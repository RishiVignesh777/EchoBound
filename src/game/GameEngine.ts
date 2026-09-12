import * as THREE from 'three';
import { FloatingText, GameNotification, MemoryShard, PuzzleState, Timeline } from '../types';
import { TimelineManager } from './TimelineManager';
import { PlayerController } from './PlayerController';
import { EnemyManager } from './EnemyManager';
import { PuzzleManager } from './PuzzleManager';
import { WorldBuilder } from './WorldBuilder';
import { soundManager } from '../audio/SoundManager';

export interface GameEngineState {
  timeline: Timeline;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  echoEnergy: number;
  maxEchoEnergy: number;
  shardsCount: number;
  currentObjective: string;
  activePrompt: string | null;
  bossHealth: { name: string; health: number; maxHealth: number } | null;
  glitchIntensity: number;
  floatingTexts: FloatingText[];
  notifications: GameNotification[];
  isPaused: boolean;
  isPointerLocked: boolean;
  inOpeningCinematic: boolean;
  gameCompleted: boolean;
  gameOver: boolean;
}

export class GameEngine {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  // Subsystems
  public timelineManager: TimelineManager;
  public player: PlayerController;
  public world: WorldBuilder;
  public enemies: EnemyManager;
  public puzzles: PuzzleManager;

  // Input tracking
  private keys: { [key: string]: boolean } = {};
  private mouseDelta = { x: 0, y: 0 };
  public isPointerLocked: boolean = false;

  // Game Loop
  private lastTime: number = 0;
  private animFrameId: number = 0;
  private isRunning: boolean = false;

  // State & Callbacks
  public isPaused: boolean = false;
  public inOpeningCinematic: boolean = true;
  public cinematicTimer: number = 6.0;
  public gameCompleted: boolean = false;
  public gameOver: boolean = false;
  public currentObjective: string = 'Awaken in Veyra. Explore the ruins ahead.';

  private floatingTexts: FloatingText[] = [];
  private notifications: GameNotification[] = [];
  private onStateUpdate?: (state: GameEngineState) => void;

  constructor(container: HTMLElement, onStateUpdate?: (state: GameEngineState) => void) {
    this.container = container;
    this.onStateUpdate = onStateUpdate;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 3. Initialize Game Subsystems
    this.timelineManager = new TimelineManager(this.scene);
    this.player = new PlayerController(this.scene, this.camera);
    this.world = new WorldBuilder(this.scene, this.timelineManager);
    this.enemies = new EnemyManager(this.scene, this.timelineManager);
    this.puzzles = new PuzzleManager(this.scene, this.timelineManager);

    // Initial position for Kael in Forgotten City
    this.player.position.set(0, 0, -4);
    this.player.cameraAngles.yaw = 0;

    // 4. Input bindings
    this.setupInputs();
    this.setupResize();

    // Start engine
    this.start();
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Audio context startup on first gesture
      soundManager.init();

      if (e.code === 'KeyQ') {
        this.triggerEchoShift();
      } else if (e.code === 'KeyE') {
        this.handleInteract();
      } else if (e.code === 'KeyR') {
        if (this.player.triggerEchoStrike()) {
          this.executePlayerAttack(this.player.stats.bladeDamage * 2.2, 5.0, 'Echo Strike!');
        }
      } else if (e.code === 'KeyF') {
        if (this.player.triggerTimeBreak()) {
          this.addFloatingText('TIME BREAK - SLOW ACTIVATED', '#00f0ff');
        }
      } else if (e.code === 'KeyX') {
        if (this.player.triggerRealitySlash()) {
          this.executePlayerAttack(this.player.stats.bladeDamage * 1.8, 6.5, 'Reality Slash!');
        }
      } else if (e.code === 'Tab') {
        e.preventDefault();
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.renderer.domElement.addEventListener('click', () => {
      if (!this.isPointerLocked && !this.isPaused) {
        this.renderer.domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
      this.publishState();
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked && !this.isPaused) {
        this.mouseDelta.x = e.movementX;
        this.mouseDelta.y = e.movementY;
      }
    });

    window.addEventListener('mousedown', (e) => {
      soundManager.init();
      if (this.isPaused || !this.isPointerLocked) return;

      if (e.button === 0) {
        // Left Click: Light Attack
        if (this.player.performLightAttack()) {
          this.executePlayerAttack(this.player.stats.bladeDamage, 3.2);
        }
      } else if (e.button === 2) {
        // Right Click: Block / Heavy Attack
        if (e.shiftKey) {
          if (this.player.performHeavyAttack()) {
            this.executePlayerAttack(this.player.stats.bladeDamage * 1.6, 4.0);
          }
        } else {
          this.player.startBlock();
        }
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.player.stopBlock();
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private setupResize() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  public triggerEchoShift() {
    if (this.timelineManager.toggleTimeline(this.player.position)) {
      const isEchoNow = this.timelineManager.targetTimeline === 'ECHO';
      this.player.setRuneTimeline(this.timelineManager.targetTimeline);
      this.addNotification(
        'TIMELINE SHIFT',
        isEchoNow ? 'Shifted to the ECHO Epoch (100 Years Ago)' : 'Returned to the PRESENT Ruins',
        'shift'
      );
      this.player.cameraShake = 0.4;
    }
  }

  public handleInteract() {
    if (this.puzzles.activePuzzleId) {
      if (this.puzzles.interact(this.puzzles.activePuzzleId)) {
        this.addNotification('PUZZLE SOLVED', 'The path forward has reopened!', 'quest');
        this.addFloatingText('MECHANISM ACTIVATED', '#ffb703');
      }
    }
  }

  private executePlayerAttack(damage: number, range: number, label?: string) {
    const hits = this.enemies.checkPlayerAttackHit(
      this.player.position,
      this.player.facingAngle,
      damage,
      range
    );

    for (const hit of hits) {
      soundManager.playHitImpact(damage > 30);
      this.addFloatingText(`-${Math.round(hit.damage)}`, hit.damage > 35 ? '#ff3366' : '#ffb703');
      if (hit.isFatal) {
        this.player.stats.echoShards += 15;
        this.player.stats.echoEnergy = Math.min(
          this.player.stats.maxEchoEnergy,
          this.player.stats.echoEnergy + 20
        );
        this.addNotification('ENEMY VANQUISHED', '+15 Chrono Shards Acquired', 'lore');
      }
    }

    if (label) {
      this.addFloatingText(label, '#00f0ff');
    }
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused && document.exitPointerLock) {
      document.exitPointerLock();
    }
    this.publishState();
  }

  public restartAtCheckpoint() {
    this.gameOver = false;
    this.isPaused = false;
    this.player.stats.health = this.player.stats.maxHealth;
    this.player.stats.stamina = this.player.stats.maxStamina;
    this.player.stats.echoEnergy = this.player.stats.maxEchoEnergy;
    this.player.position.set(0, 0, -4);
    this.player.velocity.set(0, 0, 0);
    this.player.currentAction = 'idle';
    this.publishState();
  }

  public setBrightness(exposure: number) {
    this.renderer.toneMappingExposure = Math.max(0.6, Math.min(2.5, exposure));
  }

  private start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.loop);

    const now = performance.now();
    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Cap delta to avoid physics instability
    if (delta > 0.1) delta = 0.1;

    // Handle Time Dilation from TimelineManager
    const effectiveDelta = delta * this.timelineManager.timeDilation;

    if (!this.isPaused && !this.gameOver) {
      this.update(effectiveDelta);
    }

    this.renderer.render(this.scene, this.camera);
    this.mouseDelta = { x: 0, y: 0 };
  };

  private update(delta: number) {
    // 1. Cinematic sequence handling
    if (this.inOpeningCinematic) {
      this.cinematicTimer -= delta;
      // Pan camera dramatically
      this.player.cameraAngles.pitch = 0.15;
      this.player.cameraAngles.yaw += delta * 0.15;
      if (this.cinematicTimer <= 0) {
        this.inOpeningCinematic = false;
        this.addNotification(
          'AWAKENING',
          'Press [Q] to shift timelines between the ruined Present and the intact Echo.',
          'lore'
        );
      }
    }

    // 2. Subsystems update
    this.timelineManager.update(delta);
    this.player.handleInput(this.keys, delta, this.mouseDelta);
    this.world.update(delta, this.player.position);

    // 3. Enemies update & player damage handler
    this.enemies.update(delta, this.player.position, (dmg) => {
      const res = this.player.takeDamage(dmg);
      if (res.parried) {
        this.addFloatingText('PERFECT PARRY!', '#00f0ff');
      } else if (res.blocked) {
        this.addFloatingText('BLOCKED', '#ffb703');
      } else {
        this.addFloatingText(`-${Math.round(dmg)}`, '#ef233c');
      }

      if (res.dead) {
        this.gameOver = true;
        this.addNotification('FALLEN', 'Kael dissolved back into temporal dust.', 'quest');
      }
      return res;
    });

    // 4. Puzzles update
    const { solvedPuzzle } = this.puzzles.update(delta, this.player.position);
    if (solvedPuzzle) {
      this.addNotification('PUZZLE SOLVED', `${solvedPuzzle.title} cleared!`, 'quest');
      this.player.stats.echoEnergy = this.player.stats.maxEchoEnergy;
    }

    // 5. Check Memory Shard pickups
    const shard = this.world.checkMemoryShardPickup(this.player.position);
    if (shard) {
      soundManager.playShardPickup();
      this.player.stats.echoShards += 25;
      this.addNotification('MEMORY SHARD RECOVERED', shard.title, 'lore');
      this.addFloatingText('+25 CHRONO SHARDS', '#00f0ff');
    }

    // 6. Dynamic Objectives by player position
    this.updateCurrentObjective();

    // 7. Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].opacity -= delta * 1.5;
      this.floatingTexts[i].y -= delta * 30;
      if (this.floatingTexts[i].opacity <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 8. Publish state to React HUD
    this.publishState();
  }

  private updateCurrentObjective() {
    const z = this.player.position.z;

    if (z > -40) {
      this.currentObjective = 'Explore the Forgotten City. Cross the Shattered Chasm using [Q] Echo Shift.';
    } else if (z > -100) {
      this.currentObjective = 'The Sunken District: Power the Chrono Generator in Echo to open the Iron Gate.';
    } else if (z > -160) {
      this.currentObjective = 'Ascend toward the Clockwork Cathedral. Align the Resonant Pedestal in Echo.';
    } else if (z > -210) {
      const boss = this.enemies.getBossEnemy();
      if (boss && boss.data.type === 'chrono_knight') {
        this.currentObjective = 'DEFEAT THE CHRONO KNIGHT: Shift timelines to dodge repeat Echo attacks!';
      } else {
        this.currentObjective = 'The Clockwork Cathedral: Strike the Sacred Bell in Echo to breach the Barrier.';
      }
    } else if (z > -280) {
      this.currentObjective = 'Traverse the Crimson Forest. Beware the Timeline Stalker.';
    } else {
      const architect = this.enemies.getBossEnemy();
      if (architect && architect.data.type === 'architect') {
        this.currentObjective = 'FINAL CONFRONTATION: Defeat The Architect and determine the fate of reality.';
      } else {
        // Victory!
        if (!this.gameCompleted) {
          const finalBoss = this.enemies.enemies.find((e) => e.data.type === 'architect');
          if (finalBoss && finalBoss.data.state === 'DEAD') {
            this.gameCompleted = true;
            this.addNotification('VICTORY', 'You have unraveled the truth of Veyra.', 'quest');
          }
        }
        this.currentObjective = 'Observatory Inner Sanctum: Uncover the final truth of Kael.';
      }
    }
  }

  public addFloatingText(text: string, color: string) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      color,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight / 2 - 80 + (Math.random() - 0.5) * 40,
      opacity: 1.0,
    });
  }

  public addNotification(title: string, message: string, type: GameNotification['type']) {
    const notif: GameNotification = {
      id: Math.random().toString(),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 4) {
      this.notifications.pop();
    }
  }

  private publishState() {
    if (!this.onStateUpdate) return;

    const boss = this.enemies.getBossEnemy();
    const bossHealth = boss
      ? {
          name: boss.data.name,
          health: Math.max(0, boss.data.health),
          maxHealth: boss.data.maxHealth,
        }
      : null;

    this.onStateUpdate({
      timeline: this.timelineManager.currentTimeline,
      health: this.player.stats.health,
      maxHealth: this.player.stats.maxHealth,
      stamina: this.player.stats.stamina,
      maxStamina: this.player.stats.maxStamina,
      echoEnergy: this.player.stats.echoEnergy,
      maxEchoEnergy: this.player.stats.maxEchoEnergy,
      shardsCount: this.player.stats.echoShards,
      currentObjective: this.currentObjective,
      activePrompt: this.puzzles.activePrompt,
      bossHealth,
      glitchIntensity: this.timelineManager.glitchIntensity,
      floatingTexts: [...this.floatingTexts],
      notifications: [...this.notifications],
      isPaused: this.isPaused,
      isPointerLocked: this.isPointerLocked,
      inOpeningCinematic: this.inOpeningCinematic,
      gameCompleted: this.gameCompleted,
      gameOver: this.gameOver,
    });
  }

  public destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    this.renderer.dispose();
  }
}
