import * as THREE from 'three';
import { PuzzleState, Timeline } from '../types';
import { soundManager } from '../audio/SoundManager';
import { TimelineManager } from './TimelineManager';

export class PuzzleInstance {
  public state: PuzzleState;
  public interactionMesh: THREE.Mesh;
  public presentVisual: THREE.Group;
  public echoVisual: THREE.Group;

  constructor(
    state: PuzzleState,
    interactionMesh: THREE.Mesh,
    presentVisual: THREE.Group,
    echoVisual: THREE.Group
  ) {
    this.state = state;
    this.interactionMesh = interactionMesh;
    this.presentVisual = presentVisual;
    this.echoVisual = echoVisual;
  }
}

export class PuzzleManager {
  private scene: THREE.Scene;
  private timelineManager: TimelineManager;
  public puzzles: PuzzleInstance[] = [];

  // Active interaction prompt for UI
  public activePrompt: string | null = null;
  public activePuzzleId: string | null = null;

  constructor(scene: THREE.Scene, timelineManager: TimelineManager) {
    this.scene = scene;
    this.timelineManager = timelineManager;
    this.buildPuzzles();
  }

  private buildPuzzles() {
    // 1. Shattered Chasm Bridge (Puzzle 1)
    this.buildChasmBridgePuzzle();

    // 2. Chrono Generator & Lift (Puzzle 2)
    this.buildGeneratorPuzzle();

    // 3. Phase-Shifted Vault Wall (Puzzle 3)
    this.buildVaultWallPuzzle();

    // 4. Flooded Sluice Waterwheel (Puzzle 4)
    this.buildSluicePuzzle();

    // 5. Cathedral Bell of Resonance (Puzzle 5)
    this.buildCathedralBellPuzzle();
  }

  private buildChasmBridgePuzzle() {
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    // Present: Broken jagged stone pieces falling into abyss
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x22242a, roughness: 0.9 });
    const rubble1 = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 5), stoneMat);
    rubble1.position.set(0, -0.6, -42);
    presentGroup.add(rubble1);

    const rubble2 = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 4), stoneMat);
    rubble2.position.set(0, -1.8, -52);
    rubble2.rotation.z = 0.25;
    presentGroup.add(rubble2);

    // Echo: Majestic intact glowing bridge
    const echoBridgeMat = new THREE.MeshStandardMaterial({
      color: 0x4a4e69,
      roughness: 0.5,
      metalness: 0.3,
    });
    const echoRuneMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xfb8500,
      emissiveIntensity: 1.5,
    });

    const bridgeRoad = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.0, 18), echoBridgeMat);
    bridgeRoad.position.set(0, -0.2, -47);
    echoGroup.add(bridgeRoad);

    // Glowing side railings
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 18), echoRuneMat);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 18), echoRuneMat);
    railL.position.set(-2.6, 0.4, -47);
    railR.position.set(2.6, 0.4, -47);
    echoGroup.add(railL);
    echoGroup.add(railR);

    // Interaction trigger / checkpoint zone
    const triggerGeo = new THREE.BoxGeometry(5, 3, 4);
    const triggerMat = new THREE.MeshBasicMaterial({ visible: false });
    const trigger = new THREE.Mesh(triggerGeo, triggerMat);
    trigger.position.set(0, 1, -55);

    this.scene.add(presentGroup);
    this.scene.add(echoGroup);
    this.scene.add(trigger);

    this.puzzles.push(
      new PuzzleInstance(
        {
          id: 'puzzle_bridge',
          title: 'The Shattered Chasm',
          region: 'The Forgotten City',
          solved: false,
          hint: 'The chasm is impassable in the Present. Shift to the Echo timeline to cross the intact bridge.',
          timelineRequired: 'ECHO',
          currentStep: 0,
          totalSteps: 1,
        },
        trigger,
        presentGroup,
        echoGroup
      )
    );
  }

  private buildGeneratorPuzzle() {
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    // Present: Ruined dead engine with smoke
    const deadMat = new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.9 });
    const ruinedEngine = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 2.2, 8), deadMat);
    ruinedEngine.position.set(10, 1.1, -92);
    presentGroup.add(ruinedEngine);

    // Echo: Fully powered luminous Chrono-Core generator
    const echoGoldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
    const coreGlow = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xfb8500,
      emissiveIntensity: 2.0,
    });

    const intactEngine = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 2.2, 8), echoGoldMat);
    intactEngine.position.set(10, 1.1, -92);
    const powerCore = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), coreGlow);
    powerCore.position.set(10, 2.4, -92);
    echoGroup.add(intactEngine);
    echoGroup.add(powerCore);

    // Gate / lift operated by the puzzle
    const liftMat = new THREE.MeshStandardMaterial({ color: 0x3d348b, metalness: 0.7 });
    const gateMesh = new THREE.Mesh(new THREE.BoxGeometry(6, 7, 0.4), liftMat);
    gateMesh.position.set(0, 3.5, -100);
    this.scene.add(gateMesh);

    // Interactive switch in Echo
    const switchGeo = new THREE.BoxGeometry(1.2, 1.8, 1.2);
    const switchMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d4e6,
      emissiveIntensity: 1.0,
    });
    const switchMesh = new THREE.Mesh(switchGeo, switchMat);
    switchMesh.position.set(8.5, 0.9, -92);

    this.scene.add(presentGroup);
    this.scene.add(echoGroup);
    this.scene.add(switchMesh);

    this.puzzles.push(
      new PuzzleInstance(
        {
          id: 'puzzle_generator',
          title: 'The Chrono Generator & Iron Gate',
          region: 'The Sunken District',
          solved: false,
          hint: 'The gate is sealed without power. Power the Chrono Generator in the Echo timeline.',
          timelineRequired: 'ECHO',
          currentStep: 0,
          totalSteps: 1,
        },
        switchMesh,
        presentGroup,
        echoGroup
      )
    );
  }

  private buildVaultWallPuzzle() {
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    // Present: Collapsed rubble wall
    const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x2b2d42, roughness: 0.95 });
    const wallRubble = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 2.5), rubbleMat);
    wallRubble.position.set(-16, 2.5, -145);
    presentGroup.add(wallRubble);

    // Echo: Intact runic pedestal with cipher wheel
    const altarMat = new THREE.MeshStandardMaterial({ color: 0x4a4e69, metalness: 0.6 });
    const altar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 1.6, 8), altarMat);
    altar.position.set(-16, 0.8, -142);
    echoGroup.add(altar);

    const runeRings = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.08, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xfb8500, emissiveIntensity: 1.8 })
    );
    runeRings.position.set(-16, 1.8, -142);
    runeRings.rotation.x = Math.PI / 2;
    echoGroup.add(runeRings);

    this.scene.add(presentGroup);
    this.scene.add(echoGroup);

    this.puzzles.push(
      new PuzzleInstance(
        {
          id: 'puzzle_vault',
          title: 'The Resonant Rune Pedestal',
          region: 'Cathedral Courtyard',
          solved: false,
          hint: 'Rubble blocks the passage in the Present. Align the Runic Pedestal in the Echo timeline.',
          timelineRequired: 'ECHO',
          currentStep: 0,
          totalSteps: 1,
        },
        altar,
        presentGroup,
        echoGroup
      )
    );
  }

  private buildSluicePuzzle() {
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    // Echo: Giant rotating water wheel & sluice channel
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x582f0e, roughness: 0.8 });
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.8, 12), woodMat);
    wheel.position.set(16, 3, -78);
    wheel.rotation.z = Math.PI / 2;
    echoGroup.add(wheel);

    // Lever mesh
    const leverMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 })
    );
    leverMesh.position.set(14, 1.2, -75);
    echoGroup.add(leverMesh);

    this.scene.add(presentGroup);
    this.scene.add(echoGroup);

    this.puzzles.push(
      new PuzzleInstance(
        {
          id: 'puzzle_sluice',
          title: 'The Sluice Waterwheel',
          region: 'The Sunken District',
          solved: false,
          hint: 'Turn the Sluice Valve in the Echo timeline to flood the aqueduct and bridge the gap.',
          timelineRequired: 'ECHO',
          currentStep: 0,
          totalSteps: 1,
        },
        leverMesh,
        presentGroup,
        echoGroup
      )
    );
  }

  private buildCathedralBellPuzzle() {
    const presentGroup = new THREE.Group();
    const echoGroup = new THREE.Group();

    // Present: Dark abyssal barrier blocking boss sanctuary
    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x10002b,
      emissive: 0x3c096c,
      emissiveIntensity: 2.2,
      transparent: true,
      opacity: 0.85,
    });
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 0.5), barrierMat);
    barrier.position.set(0, 4, -180);
    presentGroup.add(barrier);

    // Echo: Colossal Sacred Bronze Bell
    const bellMat = new THREE.MeshStandardMaterial({
      color: 0xb08968,
      metalness: 0.9,
      roughness: 0.25,
    });
    const bell = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.2, 12), bellMat);
    bell.position.set(0, 5.5, -174);
    echoGroup.add(bell);

    // Bell clapper interaction target
    const striker = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xfb8500, emissiveIntensity: 1.8 })
    );
    striker.position.set(0, 3.2, -174);
    echoGroup.add(striker);

    this.scene.add(presentGroup);
    this.scene.add(echoGroup);

    this.puzzles.push(
      new PuzzleInstance(
        {
          id: 'puzzle_bell',
          title: 'The Bell of Resonance',
          region: 'The Clockwork Cathedral',
          solved: false,
          hint: 'The dark barrier in the Present can only be shattered by striking the Cathedral Bell in the Echo.',
          timelineRequired: 'ECHO',
          currentStep: 0,
          totalSteps: 1,
        },
        striker,
        presentGroup,
        echoGroup
      )
    );
  }

  public update(delta: number, playerPos: THREE.Vector3): { solvedPuzzle: PuzzleState | null } {
    const isEcho = this.timelineManager.isEcho();
    let solvedPuzzle: PuzzleState | null = null;
    this.activePrompt = null;
    this.activePuzzleId = null;

    for (const p of this.puzzles) {
      // Toggle visual representation
      p.presentVisual.visible = !isEcho || p.state.solved;
      p.echoVisual.visible = isEcho || p.state.solved;

      // Special case: Chasm bridge crossing check
      if (p.state.id === 'puzzle_bridge' && !p.state.solved) {
        // If player crossed bridge (z < -52)
        if (playerPos.z < -52) {
          p.state.solved = true;
          solvedPuzzle = p.state;
          soundManager.playPuzzleSolve();
        }
      }

      // Check proximity to interactive elements
      if (!p.state.solved) {
        const interactDist = p.interactionMesh.position.distanceTo(playerPos);
        if (interactDist < 3.8) {
          if (p.state.timelineRequired === 'ECHO' && !isEcho) {
            this.activePrompt = `[Q] Shift to Echo Timeline to interact`;
            this.activePuzzleId = p.state.id;
          } else {
            this.activePrompt = `[E] Interact: ${p.state.title}`;
            this.activePuzzleId = p.state.id;
          }
        }
      }
    }

    return { solvedPuzzle };
  }

  public interact(puzzleId: string): boolean {
    const p = this.puzzles.find((item) => item.state.id === puzzleId);
    if (!p || p.state.solved) return false;

    const isEcho = this.timelineManager.isEcho();
    if (p.state.timelineRequired === 'ECHO' && !isEcho) {
      // Prompt user to shift
      return false;
    }

    // Solve puzzle!
    p.state.solved = true;
    p.state.currentStep = p.state.totalSteps;
    soundManager.playPuzzleSolve();

    // Visual resolution
    if (p.state.id === 'puzzle_generator') {
      // Lower or raise the gate
      p.presentVisual.position.y += 0.5;
    } else if (p.state.id === 'puzzle_vault') {
      // Crumble wall
      p.presentVisual.position.y -= 4;
    } else if (p.state.id === 'puzzle_bell') {
      // Shatter present barrier
      p.presentVisual.visible = false;
    }

    return true;
  }
}
