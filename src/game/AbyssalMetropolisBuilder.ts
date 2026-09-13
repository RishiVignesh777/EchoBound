import * as THREE from 'three';
import { TimelineManager } from './TimelineManager';

export class AbyssalMetropolisBuilder {
  private presentGroup: THREE.Group = new THREE.Group();
  private echoGroup: THREE.Group = new THREE.Group();
  private neutralGroup: THREE.Group = new THREE.Group();
  private timelineManager: TimelineManager;

  // Animated elements
  private skycars: THREE.Group[] = [];
  private monorailTrain: THREE.Group | null = null;
  private holographicBillboards: THREE.Mesh[] = [];
  private realityFractures: THREE.Mesh[] = [];
  private floatingDebris: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, timelineManager: TimelineManager) {
    this.timelineManager = timelineManager;
    scene.add(this.presentGroup);
    scene.add(this.echoGroup);
    scene.add(this.neutralGroup);

    this.buildGroundAndPlaza();
    this.buildSkyscrapers();
    this.buildMonorailSystem();
    this.buildLaboratories();
    this.buildRealityFracturesAndHolograms();
    this.buildSkycarTraffic();
  }

  private buildGroundAndPlaza() {
    // Ground plane extension for Abyssal Metropolis (z from -340 to -520)
    const groundGeo = new THREE.PlaneGeometry(160, 200, 32, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      roughness: 0.8,
      metalness: 0.3,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -430);
    ground.receiveShadow = true;
    this.neutralGroup.add(ground);

    // High-tech cyber highway / central boulevard
    const boulevardMat = new THREE.MeshStandardMaterial({
      color: 0x222938,
      roughness: 0.6,
      metalness: 0.5,
    });
    for (let z = -340; z > -520; z -= 12) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(16, 0.2, 10.5), boulevardMat);
      slab.position.set(0, 0.05, z);
      slab.receiveShadow = true;
      this.neutralGroup.add(slab);
    }
  }

  private buildSkyscrapers() {
    // Materials
    const ruinedMat = new THREE.MeshStandardMaterial({
      color: 0x1f232b,
      roughness: 0.95,
      metalness: 0.1,
    });
    const echoGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.85,
    });
    const echoSteelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2,
    });

    const towerConfigs = [
      { x: -32, z: -370, width: 18, depth: 18, height: 75 },
      { x: 34, z: -375, width: 22, depth: 20, height: 90 },
      { x: -36, z: -430, width: 24, depth: 22, height: 110 },
      { x: 38, z: -435, width: 20, depth: 18, height: 85 },
      { x: -30, z: -490, width: 20, depth: 20, height: 95 },
      { x: 32, z: -495, width: 26, depth: 22, height: 120 },
    ];

    towerConfigs.forEach((cfg, idx) => {
      // 1. PRESENT: Broken, hollow, fractured skyscraper ruins with exposed girders
      const presentTower = new THREE.Group();
      const ruinedHeight = cfg.height * (0.35 + (idx % 3) * 0.15);
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(cfg.width, ruinedHeight, cfg.depth),
        ruinedMat
      );
      base.position.set(cfg.x, ruinedHeight / 2, cfg.z);
      base.castShadow = true;
      base.receiveShadow = true;
      presentTower.add(base);

      // Twisted rebar / structural frames extending upward
      for (let g = 0; g < 4; g++) {
        const girder = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, ruinedHeight * 0.5, 0.8),
          new THREE.MeshStandardMaterial({ color: 0x472e27, metalness: 0.8 })
        );
        girder.position.set(
          cfg.x + (g % 2 === 0 ? 5 : -5),
          ruinedHeight + (ruinedHeight * 0.25),
          cfg.z + (g > 1 ? 5 : -5)
        );
        girder.rotation.z = (Math.random() - 0.5) * 0.25;
        presentTower.add(girder);
      }
      this.presentGroup.add(presentTower);

      // 2. ECHO: Pristine monumental megatower with glowing cyber strip lighting
      const echoTower = new THREE.Group();
      const towerBody = new THREE.Mesh(
        new THREE.BoxGeometry(cfg.width, cfg.height, cfg.depth),
        echoGlassMat
      );
      towerBody.position.set(cfg.x, cfg.height / 2, cfg.z);
      towerBody.castShadow = true;
      echoTower.add(towerBody);

      // Crown spire and neon conduits
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(cfg.width * 0.45, 24, 4),
        echoSteelMat
      );
      spire.position.set(cfg.x, cfg.height + 12, cfg.z);
      spire.rotation.y = Math.PI / 4;
      echoTower.add(spire);

      // Neon vertical luminescent stripes
      const stripeGeo = new THREE.BoxGeometry(0.5, cfg.height, 0.2);
      const stripeMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x06b6d4 : 0xf59e0b,
      });
      const stripeL = new THREE.Mesh(stripeGeo, stripeMat);
      stripeL.position.set(cfg.x - cfg.width * 0.45, cfg.height / 2, cfg.z + cfg.depth * 0.51);
      const stripeR = new THREE.Mesh(stripeGeo, stripeMat);
      stripeR.position.set(cfg.x + cfg.width * 0.45, cfg.height / 2, cfg.z + cfg.depth * 0.51);
      echoTower.add(stripeL);
      echoTower.add(stripeR);

      this.echoGroup.add(echoTower);
    });
  }

  private buildMonorailSystem() {
    // Elevated Monorail Track: Runs from z: -350 to -510 along the right flank (x = 18)
    const trackPillarMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.3,
    });
    const echoTrackBeamMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ruinedBeamMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
    });

    for (let z = -350; z > -510; z -= 30) {
      // Pillar (neutral)
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 12, 12), trackPillarMat);
      pillar.position.set(18, 6, z);
      this.neutralGroup.add(pillar);

      // ECHO: Continuous pristine magnetic levitation track
      const echoTrackSegment = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 30), echoTrackBeamMat);
      echoTrackSegment.position.set(18, 12, z - 15);
      this.echoGroup.add(echoTrackSegment);

      // PRESENT: Partially collapsed track section with broken gap
      if (z === -410) {
        // Collapsed track plunged into ground
        const brokenTrack = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 22), ruinedBeamMat);
        brokenTrack.position.set(18, 5, z - 12);
        brokenTrack.rotation.x = -0.55;
        this.presentGroup.add(brokenTrack);
      } else if (z !== -440) {
        const presentTrack = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 26), ruinedBeamMat);
        presentTrack.position.set(18, 12, z - 15);
        this.presentGroup.add(presentTrack);
      }
    }

    // ECHO Monorail Train Carriage
    const trainGroup = new THREE.Group();
    const trainBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.5, 14),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.15 })
    );
    trainBody.position.y = 1.35;
    const trainStripe = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 0.4, 13.8),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    trainStripe.position.y = 1.35;
    trainGroup.add(trainBody);
    trainGroup.add(trainStripe);
    trainGroup.position.set(18, 12.4, -380);
    this.monorailTrain = trainGroup;
    this.echoGroup.add(trainGroup);
  }

  private buildLaboratories() {
    // Advanced Quantum Temporal Laboratory at z: -460
    // Present: Flooded subterranean chamber with sparking coils
    const ruinedLab = new THREE.Group();
    const labWallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8, 24), labWallMat);
    wallL.position.set(-14, 4, -460);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8, 24), labWallMat);
    wallR.position.set(14, 4, -460);
    ruinedLab.add(wallL);
    ruinedLab.add(wallR);

    // Sparking broken reactor core in Present
    const brokenCore = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 4.0, 5, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
    );
    brokenCore.position.set(0, 2.5, -460);
    ruinedLab.add(brokenCore);
    this.presentGroup.add(ruinedLab);

    // Echo: Fully operational chronometric research institute with containment spheres
    const activeLab = new THREE.Group();
    const activeCore = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.8, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
    );
    activeCore.position.set(0, 4, -460);

    const containmentField = new THREE.Mesh(
      new THREE.SphereGeometry(6, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      })
    );
    containmentField.position.set(0, 4, -460);

    activeLab.add(activeCore);
    activeLab.add(containmentField);
    this.echoGroup.add(activeLab);
  }

  private buildRealityFracturesAndHolograms() {
    // PRESENT: Reality fractures (glowing purple/cyan cracks in space)
    const fractureMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 5; i++) {
      const frac = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), fractureMat);
      frac.position.set((i % 2 === 0 ? -1 : 1) * (8 + i * 2), 3 + i * 1.2, -370 - i * 25);
      this.realityFractures.push(frac);
      this.presentGroup.add(frac);
    }

    // ECHO: Massive holographic advertising displays
    const holoCanvas = document.createElement('canvas');
    holoCanvas.width = 256;
    holoCanvas.height = 128;
    const ctx = holoCanvas.getContext('2d')!;
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('VEYRA METROPOLIS', 20, 50);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('PROJECT CHRONOS ACTIVE', 20, 85);

    const holoTex = new THREE.CanvasTexture(holoCanvas);
    const holoMat = new THREE.MeshBasicMaterial({
      map: holoTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const billboard1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), holoMat);
    billboard1.position.set(0, 24, -390);
    this.holographicBillboards.push(billboard1);
    this.echoGroup.add(billboard1);

    const billboard2 = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), holoMat.clone());
    billboard2.position.set(0, 28, -470);
    this.holographicBillboards.push(billboard2);
    this.echoGroup.add(billboard2);
  }

  private buildSkycarTraffic() {
    // ECHO: Autonomous aerocars gliding on high-altitude lanes
    const skycarGeo = new THREE.BoxGeometry(2.4, 0.9, 4.8);
    const skycarMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
    });

    for (let i = 0; i < 6; i++) {
      const car = new THREE.Group();
      const body = new THREE.Mesh(skycarGeo, skycarMat);
      const thruster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      thruster.rotation.x = Math.PI / 2;
      thruster.position.set(0, 0, 2.5);
      car.add(body);
      car.add(thruster);

      // Stagger initial positions along two lanes (x = -15 and x = 15, height 28 to 36)
      const laneX = i % 2 === 0 ? -16 : 16;
      const laneY = 28 + (i % 3) * 4;
      const startZ = -340 - i * 30;
      car.position.set(laneX, laneY, startZ);
      this.skycars.push(car);
      this.echoGroup.add(car);
    }
  }

  public update(delta: number) {
    const isEcho = this.timelineManager.isEcho();
    const progress = this.timelineManager.transitionProgress;

    this.presentGroup.visible = progress < 0.95;
    this.echoGroup.visible = progress > 0.05;

    // Animate Reality Fractures (pulsing rotational warp in Present)
    for (const frac of this.realityFractures) {
      frac.rotation.x += delta * 1.5;
      frac.rotation.y += delta * 2.1;
      const scale = 1.0 + Math.sin(Date.now() * 0.005) * 0.15;
      frac.scale.set(scale, scale, scale);
    }

    // Animate Skycar traffic in Echo
    if (isEcho || progress > 0.05) {
      for (let i = 0; i < this.skycars.length; i++) {
        const car = this.skycars[i];
        const dir = i % 2 === 0 ? -1 : 1;
        car.position.z += dir * delta * 22;

        if (car.position.z < -520) car.position.z = -340;
        if (car.position.z > -340) car.position.z = -520;
      }

      // Animate Monorail Train
      if (this.monorailTrain) {
        this.monorailTrain.position.z -= delta * 18;
        if (this.monorailTrain.position.z < -510) {
          this.monorailTrain.position.z = -350;
        }
      }

      // Pulse Holographic Billboards
      for (const bb of this.holographicBillboards) {
        bb.rotation.y = Math.sin(Date.now() * 0.001) * 0.05;
      }
    }
  }
}
