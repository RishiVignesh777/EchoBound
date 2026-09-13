import * as THREE from 'three';
import { Timeline, EnemyData } from '../types';
import { soundManager } from '../audio/SoundManager';
import { TimelineManager } from './TimelineManager';

export interface HitResult {
  hit: boolean;
  damage: number;
  enemyId: string;
  isFatal: boolean;
  position: THREE.Vector3;
}

export class EnemyInstance {
  public data: EnemyData;
  public mesh: THREE.Group;
  public presentVisual: THREE.Group;
  public echoVisual: THREE.Group;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public stateTimer: number = 0;
  public attackCooldown: number = 0;
  public staggerTimer: number = 0;
  public spawnPos: THREE.Vector3;
  public targetPos: THREE.Vector3 | null = null;
  public isPhasing: boolean = false;
  public phaseTimer: number = 0;
  public attackHitboxActive: boolean = false;
  public bossPhase: number = 1;
  public echoAttacksQueue: { delay: number; pos: THREE.Vector3; radius: number }[] = [];

  constructor(data: EnemyData, mesh: THREE.Group, presentVisual: THREE.Group, echoVisual: THREE.Group) {
    this.data = data;
    this.mesh = mesh;
    this.presentVisual = presentVisual;
    this.echoVisual = echoVisual;
    this.spawnPos = new THREE.Vector3(...data.position);
    this.mesh.position.copy(this.spawnPos);
  }
}

export class EnemyManager {
  private scene: THREE.Scene;
  private timelineManager: TimelineManager;
  public enemies: EnemyInstance[] = [];

  // Hit sparks and impact particle system
  private hitParticles: THREE.Points | null = null;
  private hitParticlePositions: Float32Array = new Float32Array(300 * 3);
  private hitParticleVelocities: Float32Array = new Float32Array(300 * 3);
  private hitParticleLife: Float32Array = new Float32Array(300);

  constructor(scene: THREE.Scene, timelineManager: TimelineManager) {
    this.scene = scene;
    this.timelineManager = timelineManager;
    this.setupHitParticleSystem();
    this.spawnInitialEnemies();
  }

  private setupHitParticleSystem() {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.hitParticlePositions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffe066,
      size: 0.18,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.hitParticles = new THREE.Points(geo, mat);
    this.scene.add(this.hitParticles);
  }

  public spawnInitialEnemies() {
    // 1. Forgotten City: Corrupted Lurkers (Wraiths)
    this.createLurker('lurker_1', 'Corrupted Lurker', [-12, 0, -22]);
    this.createLurker('lurker_2', 'Echo Corrupted', [14, 0, -32]);

    // 2. Sunken District: Broken Sentinels & Void Crawler
    this.createSentinel('sentinel_1', 'Broken Sentinel', [24, 0, -68]);
    this.createSentinel('sentinel_2', 'Chrono Sentinel', [-18, 0, -82]);
    this.createVoidCrawler('crawler_1', 'Void Crawler', [-16, 0, -78]);

    // Mini-Boss 1: The Drowned Guardian (Sunken District)
    this.createDrownedGuardian('drowned_guardian', 'The Drowned Guardian', [0, 0, -96]);

    // 3. Crimson Forest: Timeline Stalker & Reality Devourer
    this.createStalker('stalker_1', 'Timeline Stalker', [0, 0, -125]);
    this.createRealityDevourer('devourer_1', 'Reality Devourer', [-14, 0, -140]);

    // Mini-Boss 2: The Hollow Warden (Crimson Forest)
    this.createHollowWarden('hollow_warden', 'The Hollow Warden', [18, 0, -135]);

    // 4. Clockwork Cathedral: Boss 1 - The Chrono Knight & Chrono Sentinel
    this.createChronoKnight('chrono_knight', 'The Chrono Knight', [0, 0, -195]);
    this.createChronoSentinel('chrono_sent_1', 'Cathedral Chrono Sentinel', [16, 0, -175]);

    // Mini-Boss 3: The Clockmaker (Clockwork Cathedral Sanctum)
    this.createClockmaker('clockmaker', 'The Clockmaker', [-14, 0, -215]);

    // 5. The Grand Observatory: The Architect
    this.createArchitect('architect_boss', 'The Architect (Master of Reality)', [0, 0, -310]);

    // 6. THE ABYSSAL METROPOLIS (Region 6)
    this.createFracturedKnight('frac_knight_1', 'Fractured Knight', [-12, 0, -380]);
    this.createEchoStalker('echo_stalker_1', 'Echo Stalker', [14, 0, -415]);
    this.createFracturedKnight('frac_knight_2', 'Fractured Knight Elite', [10, 0, -445]);

    // Major Boss: The Timelord (Abyssal Metropolis Core)
    this.createTimelord('timelord_boss', 'The Timelord (Avatar of Rupture)', [0, 0, -485]);
  }

  private createLurker(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();

    // PRESENT VISUAL: Menacing Corrupted Shadow Beast
    const presentGroup = new THREE.Group();
    const lurkerMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.9,
      metalness: 0.1,
    });
    const lurkerGlow = new THREE.MeshStandardMaterial({
      color: 0x9d0208,
      emissive: 0xd90429,
      emissiveIntensity: 1.8,
    });

    const bodyGeo = new THREE.ConeGeometry(0.5, 1.4, 6);
    const body = new THREE.Mesh(bodyGeo, lurkerMat);
    body.position.y = 0.9;
    body.rotation.x = 0.3;
    presentGroup.add(body);

    // Glowing red eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, lurkerGlow);
    const eyeR = new THREE.Mesh(eyeGeo, lurkerGlow);
    eyeL.position.set(-0.16, 1.3, 0.28);
    eyeR.position.set(0.16, 1.3, 0.28);
    presentGroup.add(eyeL);
    presentGroup.add(eyeR);

    // Claws
    const clawGeo = new THREE.CylinderGeometry(0.04, 0.01, 0.7, 5);
    const clawL = new THREE.Mesh(clawGeo, lurkerMat);
    const clawR = new THREE.Mesh(clawGeo, lurkerMat);
    clawL.position.set(-0.55, 0.8, 0.3);
    clawL.rotation.set(0.8, 0, -0.4);
    clawR.position.set(0.55, 0.8, 0.3);
    clawR.rotation.set(0.8, 0, 0.4);
    presentGroup.add(clawL);
    presentGroup.add(clawR);

    // ECHO VISUAL: Peaceful Ancient Scholar Ghost
    const echoGroup = new THREE.Group();
    const scholarMat = new THREE.MeshStandardMaterial({
      color: 0xd8e2dc,
      transparent: true,
      opacity: 0.75,
      roughness: 0.4,
    });
    const scholarGlow = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xfb8500,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    const scholarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.6, 8), scholarMat);
    scholarBody.position.y = 0.9;
    echoGroup.add(scholarBody);

    const book = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.22), scholarGlow);
    book.position.set(0, 1.05, 0.35);
    echoGroup.add(book);

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'lurker',
      health: 80,
      maxHealth: 80,
      timeline: 'PRESENT',
      isBoss: false,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };

    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createSentinel(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();

    // Present visual: Damaged, rusted crawler with sparking core
    const presentGroup = new THREE.Group();
    const rustMat = new THREE.MeshStandardMaterial({ color: 0x3d261d, roughness: 0.9, metalness: 0.4 });
    const sparkMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00d4e6, emissiveIntensity: 2.0 });

    const sentTorso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.7), rustMat);
    sentTorso.position.y = 0.6;
    sentTorso.rotation.z = 0.15;
    presentGroup.add(sentTorso);

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), sparkMat);
    core.position.set(0, 0.65, 0.3);
    presentGroup.add(core);

    // Echo visual: Pristine Golden Clockwork Guardian with shield & hammer
    const echoGroup = new THREE.Group();
    const goldArmor = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    const pristineTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 1.8, 8), goldArmor);
    pristineTorso.position.y = 1.1;
    echoGroup.add(pristineTorso);

    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.7), goldArmor);
    shield.position.set(-0.65, 1.0, 0.2);
    echoGroup.add(shield);

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'sentinel',
      health: 140,
      maxHealth: 140,
      timeline: 'both',
      isBoss: false,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };

    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createStalker(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();

    // Stalker phases between timelines with ethereal dimensional ribbons
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();
    const stalkerMat = new THREE.MeshStandardMaterial({
      color: 0x2b0938,
      emissive: 0x7b2cbf,
      emissiveIntensity: 1.2,
      roughness: 0.3,
    });

    const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 1), stalkerMat);
    body.position.y = 1.4;
    presentGroup.add(body);

    const echoBody = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 1), stalkerMat);
    echoBody.position.y = 1.4;
    echoGroup.add(echoBody);

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'stalker',
      health: 180,
      maxHealth: 180,
      timeline: 'both',
      isBoss: false,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };

    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createChronoKnight(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const knightMat = new THREE.MeshStandardMaterial({
      color: 0x242831,
      metalness: 0.9,
      roughness: 0.3,
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d4e6,
      emissiveIntensity: 2.0,
    });
    const echoGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xfb8500,
      emissiveIntensity: 1.8,
    });

    // Gigantic 3.5m tall boss body
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 1.0), knightMat);
    torso.position.y = 2.4;
    torso.castShadow = true;
    presentGroup.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.7), knightMat);
    head.position.set(0, 3.7, 0.1);
    presentGroup.add(head);

    // Glowing visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.1), glowMat);
    visor.position.set(0, 3.7, 0.45);
    presentGroup.add(visor);

    // Colossal Greatsword
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.5, 0.1), glowMat);
    sword.position.set(1.4, 2.6, 0.5);
    sword.rotation.set(0.4, 0, -0.2);
    presentGroup.add(sword);

    // Echo version has golden radiance
    const echoTorso = torso.clone();
    const echoHead = head.clone();
    const echoVisor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.1), echoGoldMat);
    echoVisor.position.set(0, 3.7, 0.45);
    const echoSword = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.5, 0.1), echoGoldMat);
    echoSword.position.set(1.4, 2.6, 0.5);
    echoSword.rotation.set(0.4, 0, -0.2);

    echoGroup.add(echoTorso);
    echoGroup.add(echoHead);
    echoGroup.add(echoVisor);
    echoGroup.add(echoSword);

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'chrono_knight',
      health: 450,
      maxHealth: 450,
      timeline: 'both',
      isBoss: true,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };

    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createArchitect(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const realityMat = new THREE.MeshStandardMaterial({
      color: 0x0d1b2a,
      emissive: 0x7209b7,
      emissiveIntensity: 2.2,
      metalness: 0.5,
      roughness: 0.2,
    });

    // Floating rings & crystalline core
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), realityMat);
    core.position.y = 2.8;
    presentGroup.add(core);

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.1, 8, 32), realityMat);
    ring1.position.y = 2.8;
    presentGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.08, 8, 32), realityMat);
    ring2.position.y = 2.8;
    ring2.rotation.x = Math.PI / 2;
    presentGroup.add(ring2);

    echoGroup.add(core.clone());
    echoGroup.add(ring1.clone());
    echoGroup.add(ring2.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'architect',
      health: 650,
      maxHealth: 650,
      timeline: 'both',
      isBoss: true,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };

    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createVoidCrawler(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x1f162b,
      emissive: 0x9333ea,
      emissiveIntensity: 1.2,
      roughness: 0.4,
    });

    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 0), mat);
    body.position.y = 0.5;
    presentGroup.add(body);
    echoGroup.add(body.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'sentinel',
      health: 120,
      maxHealth: 120,
      timeline: 'both',
      isBoss: false,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createDrownedGuardian(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const waterTitanMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 3.2, 8), waterTitanMat);
    body.position.y = 1.6;
    const mace = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 })
    );
    mace.position.set(1.4, 1.8, 0.4);

    presentGroup.add(body);
    presentGroup.add(mace);
    echoGroup.add(body.clone());
    echoGroup.add(mace.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'chrono_knight',
      health: 380,
      maxHealth: 380,
      timeline: 'both',
      isBoss: true,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createRealityDevourer(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x4a044e,
      emissive: 0xc026d3,
      emissiveIntensity: 1.5,
      roughness: 0.3,
    });
    const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 1), mat);
    head.position.y = 1.6;
    presentGroup.add(head);
    echoGroup.add(head.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'stalker',
      health: 160,
      maxHealth: 160,
      timeline: 'both',
      isBoss: false,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createHollowWarden(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const wardenMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.85,
      metalness: 0.2,
      emissive: 0x22c55e,
      emissiveIntensity: 0.7,
    });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 3.8, 8), wardenMat);
    trunk.position.y = 1.9;
    presentGroup.add(trunk);
    echoGroup.add(trunk.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'chrono_knight',
      health: 420,
      maxHealth: 420,
      timeline: 'both',
      isBoss: true,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createChronoSentinel(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.8), goldMat);
    torso.position.y = 1.2;
    presentGroup.add(torso);
    echoGroup.add(torso.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'sentinel',
      health: 175,
      maxHealth: 175,
      timeline: 'both',
      isBoss: false,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createClockmaker(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const gearMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
    });

    const core = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.4, 8, 24), gearMat);
    core.position.y = 2.2;
    presentGroup.add(core);
    echoGroup.add(core.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'chrono_knight',
      health: 440,
      maxHealth: 440,
      timeline: 'both',
      isBoss: true,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createFracturedKnight(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5,
    });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.8, 8), armorMat);
    torso.position.y = 1.1;
    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.6, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    sword.position.set(0.6, 1.2, 0.3);

    presentGroup.add(torso);
    presentGroup.add(sword);
    echoGroup.add(torso.clone());
    echoGroup.add(sword.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'sentinel',
      health: 210,
      maxHealth: 210,
      timeline: 'both',
      isBoss: false,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createEchoStalker(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    const stalkerMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x6366f1,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });

    const body = new THREE.Mesh(new THREE.TetrahedronGeometry(0.8, 1), stalkerMat);
    body.position.y = 1.5;
    presentGroup.add(body);
    echoGroup.add(body.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'stalker',
      health: 180,
      maxHealth: 180,
      timeline: 'both',
      isBoss: false,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  private createTimelord(id: string, name: string, pos: [number, number, number]) {
    const group = new THREE.Group();
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    // High-tech chronometric avatar
    const lordMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xf43f5e,
      emissiveIntensity: 2.0,
    });

    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), lordMat);
    core.position.y = 3.2;

    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.15, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true })
    );
    ringA.position.y = 3.2;

    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.12, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, wireframe: true })
    );
    ringB.position.y = 3.2;
    ringB.rotation.x = Math.PI / 2;

    presentGroup.add(core);
    presentGroup.add(ringA);
    presentGroup.add(ringB);

    echoGroup.add(core.clone());
    echoGroup.add(ringA.clone());
    echoGroup.add(ringB.clone());

    group.add(presentGroup);
    group.add(echoGroup);
    this.scene.add(group);

    const enemyData: EnemyData = {
      id,
      name,
      type: 'architect',
      health: 850,
      maxHealth: 850,
      timeline: 'both',
      isBoss: true,
      position: pos,
      isAggro: false,
      state: 'IDLE',
    };
    this.enemies.push(new EnemyInstance(enemyData, group, presentGroup, echoGroup));
  }

  // UPDATE 1.0 COMBAT HELPERS
  public checkFinisherTarget(
    playerPos: THREE.Vector3,
    playerFacing: number
  ): EnemyInstance | null {
    for (const enemy of this.enemies) {
      if (enemy.data.state === 'DEAD') continue;
      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist < 3.8 && enemy.data.health <= enemy.data.maxHealth * 0.28) {
        return enemy;
      }
    }
    return null;
  }

  public applyRealityBreakDamage(
    playerPos: THREE.Vector3,
    radius: number = 14.0,
    damage: number = 120
  ): HitResult[] {
    const hits: HitResult[] = [];
    for (const enemy of this.enemies) {
      if (enemy.data.state === 'DEAD') continue;
      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist <= radius) {
        enemy.data.health -= damage;
        enemy.staggerTimer = 1.2;
        enemy.data.state = 'STAGGER';
        this.spawnHitSparks(enemy.mesh.position);

        const isFatal = enemy.data.health <= 0;
        if (isFatal) {
          enemy.data.health = 0;
          enemy.data.state = 'DEAD';
          enemy.mesh.visible = false;
        }

        hits.push({
          hit: true,
          damage,
          enemyId: enemy.data.id,
          isFatal,
          position: enemy.mesh.position.clone(),
        });
      }
    }
    return hits;
  }

  public applyCounterDamage(enemyId: string, damage: number = 75): HitResult | null {
    const enemy = this.enemies.find((e) => e.data.id === enemyId);
    if (!enemy || enemy.data.state === 'DEAD') return null;

    enemy.data.health -= damage;
    enemy.staggerTimer = 1.5;
    enemy.data.state = 'STAGGER';
    this.spawnHitSparks(enemy.mesh.position);

    const isFatal = enemy.data.health <= 0;
    if (isFatal) {
      enemy.data.health = 0;
      enemy.data.state = 'DEAD';
      enemy.mesh.visible = false;
    }

    return {
      hit: true,
      damage,
      enemyId: enemy.data.id,
      isFatal,
      position: enemy.mesh.position.clone(),
    };
  }

  public update(
    delta: number,
    playerPosition: THREE.Vector3,
    onPlayerDamage: (dmg: number) => { dead: boolean; parried: boolean; blocked: boolean }
  ) {
    const isEcho = this.timelineManager.isEcho();

    for (const enemy of this.enemies) {
      if (enemy.data.state === 'DEAD') {
        enemy.mesh.visible = false;
        continue;
      }

      // Timeline visibility rules
      if (enemy.data.type === 'lurker') {
        enemy.presentVisual.visible = !isEcho;
        enemy.echoVisual.visible = isEcho;
      } else {
        enemy.presentVisual.visible = !isEcho;
        enemy.echoVisual.visible = isEcho;
      }

      // Floating / breathing animation
      enemy.mesh.position.y = enemy.spawnPos.y + Math.sin(Date.now() * 0.003 + enemy.mesh.position.x) * 0.12;

      // Distance to Kael
      const distToPlayer = enemy.mesh.position.distanceTo(playerPosition);

      // In Echo, lurkers (scholars) are peaceful and don't attack!
      if (enemy.data.type === 'lurker' && isEcho) {
        enemy.data.state = 'IDLE';
        enemy.data.isAggro = false;
        continue;
      }

      // Handle Stagger
      if (enemy.staggerTimer > 0) {
        enemy.staggerTimer -= delta;
        enemy.mesh.rotation.x = -0.3;
        continue;
      } else {
        enemy.mesh.rotation.x = 0;
      }

      // Attack cooldown
      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown -= delta;
      }

      // Boss phases
      if (enemy.data.isBoss) {
        if (enemy.data.health < enemy.data.maxHealth * 0.3) {
          enemy.bossPhase = 3;
        } else if (enemy.data.health < enemy.data.maxHealth * 0.65) {
          enemy.bossPhase = 2;
        }
      }

      // AI State Machine
      const aggroRadius = enemy.data.isBoss ? 45 : 18;
      const attackRange = enemy.data.type === 'chrono_knight' ? 4.2 : enemy.data.type === 'architect' ? 14.0 : 2.5;

      if (distToPlayer < aggroRadius) {
        enemy.data.isAggro = true;

        // Face player
        const dir = new THREE.Vector3().subVectors(playerPosition, enemy.mesh.position);
        dir.y = 0;
        enemy.mesh.rotation.y = Math.atan2(dir.x, dir.z);

        if (distToPlayer > attackRange) {
          // CHASE
          enemy.data.state = 'CHASE';
          const speed = enemy.data.type === 'stalker' ? 5.5 : enemy.data.isBoss ? 4.0 : 3.5;
          const moveDir = dir.normalize();
          enemy.mesh.position.x += moveDir.x * speed * delta;
          enemy.mesh.position.z += moveDir.z * speed * delta;
        } else {
          // ATTACK
          enemy.data.state = 'ATTACK';
          if (enemy.attackCooldown <= 0) {
            this.executeEnemyAttack(enemy, playerPosition, onPlayerDamage);
          }
        }
      } else if (enemy.data.isAggro) {
        // RETURN to spawn
        enemy.data.state = 'RETURN';
        const returnDir = new THREE.Vector3().subVectors(enemy.spawnPos, enemy.mesh.position);
        returnDir.y = 0;
        if (returnDir.length() > 0.5) {
          returnDir.normalize();
          enemy.mesh.position.x += returnDir.x * 3.0 * delta;
          enemy.mesh.position.z += returnDir.z * 3.0 * delta;
        } else {
          enemy.data.isAggro = false;
          enemy.data.state = 'IDLE';
        }
      }
    }

    this.updateHitParticles(delta);
  }

  private executeEnemyAttack(
    enemy: EnemyInstance,
    playerPos: THREE.Vector3,
    onPlayerDamage: (dmg: number) => { dead: boolean; parried: boolean; blocked: boolean }
  ) {
    if (enemy.data.type === 'chrono_knight') {
      enemy.attackCooldown = 2.4;
      soundManager.playSwordSwing(true);

      // Telegraph swing lunge
      setTimeout(() => {
        if (enemy.data.state === 'DEAD') return;
        const currentDist = enemy.mesh.position.distanceTo(playerPos);
        if (currentDist < 5.0) {
          const res = onPlayerDamage(28);
          if (res.parried) {
            enemy.staggerTimer = 1.8;
            enemy.data.state = 'STAGGER';
          }
        }
      }, 350);
    } else if (enemy.data.type === 'architect') {
      enemy.attackCooldown = 3.0;
      soundManager.playAbilitySound('timeBreak');

      // Reality shockwave
      setTimeout(() => {
        if (enemy.data.state === 'DEAD') return;
        const currentDist = enemy.mesh.position.distanceTo(playerPos);
        if (currentDist < 16.0) {
          onPlayerDamage(35);
        }
      }, 500);
    } else {
      // Regular enemies
      enemy.attackCooldown = 1.8;
      soundManager.playSwordSwing(false);
      setTimeout(() => {
        if (enemy.data.state === 'DEAD') return;
        const currentDist = enemy.mesh.position.distanceTo(playerPos);
        if (currentDist < 3.2) {
          const res = onPlayerDamage(enemy.data.type === 'sentinel' ? 18 : 14);
          if (res.parried) {
            enemy.staggerTimer = 1.4;
            enemy.data.state = 'STAGGER';
          }
        }
      }, 250);
    }
  }

  public checkPlayerAttackHit(
    playerPos: THREE.Vector3,
    playerFacing: number,
    baseDamage: number,
    range: number = 3.2
  ): HitResult[] {
    const hits: HitResult[] = [];
    const forwardX = Math.sin(playerFacing);
    const forwardZ = Math.cos(playerFacing);
    const playerAttackDir = new THREE.Vector2(forwardX, forwardZ).normalize();

    for (const enemy of this.enemies) {
      if (enemy.data.state === 'DEAD') continue;

      // In Echo, Lurker is a harmless researcher; cannot be attacked
      if (enemy.data.type === 'lurker' && this.timelineManager.isEcho()) continue;

      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist <= range) {
        const toEnemy = new THREE.Vector2(
          enemy.mesh.position.x - playerPos.x,
          enemy.mesh.position.z - playerPos.z
        ).normalize();

        const dot = playerAttackDir.dot(toEnemy);
        // Cone of attack (front 120 degrees)
        if (dot > 0.3) {
          enemy.data.health -= baseDamage;
          enemy.staggerTimer = 0.45;
          enemy.data.state = 'STAGGER';

          // Spawn hit particles
          this.spawnHitSparks(enemy.mesh.position);

          const isFatal = enemy.data.health <= 0;
          if (isFatal) {
            enemy.data.health = 0;
            enemy.data.state = 'DEAD';
            enemy.mesh.visible = false;
          }

          hits.push({
            hit: true,
            damage: baseDamage,
            enemyId: enemy.data.id,
            isFatal,
            position: enemy.mesh.position.clone(),
          });
        }
      }
    }

    return hits;
  }

  private spawnHitSparks(pos: THREE.Vector3) {
    const count = 30;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * 300);
      this.hitParticlePositions[idx * 3] = pos.x + (Math.random() - 0.5) * 0.4;
      this.hitParticlePositions[idx * 3 + 1] = pos.y + 1.2 + (Math.random() - 0.5) * 0.4;
      this.hitParticlePositions[idx * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.4;

      this.hitParticleVelocities[idx * 3] = (Math.random() - 0.5) * 6;
      this.hitParticleVelocities[idx * 3 + 1] = Math.random() * 5 + 1;
      this.hitParticleVelocities[idx * 3 + 2] = (Math.random() - 0.5) * 6;

      this.hitParticleLife[idx] = 0.35;
    }
  }

  private updateHitParticles(delta: number) {
    if (!this.hitParticles) return;
    let hasActive = false;

    for (let i = 0; i < 300; i++) {
      if (this.hitParticleLife[i] > 0) {
        this.hitParticleLife[i] -= delta;
        this.hitParticlePositions[i * 3] += this.hitParticleVelocities[i * 3] * delta;
        this.hitParticlePositions[i * 3 + 1] += this.hitParticleVelocities[i * 3 + 1] * delta;
        this.hitParticlePositions[i * 3 + 2] += this.hitParticleVelocities[i * 3 + 2] * delta;
        this.hitParticleVelocities[i * 3 + 1] -= 9.8 * delta; // Gravity
        hasActive = true;
      }
    }

    if (hasActive) {
      this.hitParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  public getBossEnemy(): EnemyInstance | null {
    return this.enemies.find((e) => e.data.isBoss && e.data.state !== 'DEAD' && e.data.isAggro) || null;
  }
}
