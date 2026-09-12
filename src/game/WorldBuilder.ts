import * as THREE from 'three';
import { Timeline, MemoryShard } from '../types';
import { TimelineManager } from './TimelineManager';

export class WorldBuilder {
  private scene: THREE.Scene;
  private timelineManager: TimelineManager;

  // Environment elements that transition
  public presentObjects: THREE.Group = new THREE.Group();
  public echoObjects: THREE.Group = new THREE.Group();
  public neutralObjects: THREE.Group = new THREE.Group();

  // Dynamic Lighting
  public ambientLight: THREE.AmbientLight;
  public dirLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public fog: THREE.FogExp2;
  public pointLights: THREE.PointLight[] = [];

  // Weather / Realistic Snowfall system
  public snowSystem: THREE.Points | null = null;
  private snowPositions: Float32Array | null = null;
  private snowData: Float32Array | null = null; // [fallSpeed, swayPhase, swaySpeed, swayRadius]
  private snowElapsed: number = 0;

  // Rotating clockwork gears
  private rotatingGears: THREE.Mesh[] = [];

  // Collectibles (Memory Shards)
  public memoryShards: MemoryShard[] = [];
  public shardMeshes: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, timelineManager: TimelineManager) {
    this.scene = scene;
    this.timelineManager = timelineManager;

    // Atmospheric Fog - Clearer, brighter, and richer visibility
    this.fog = new THREE.FogExp2(0x1e2736, 0.0065);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(0x1e2736);

    // Dynamic Ambient & Hemisphere Skylight
    this.ambientLight = new THREE.AmbientLight(0x425470, 2.0);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x98bfe6, 0x252e3d, 1.6);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xa6c8e8, 2.8);
    this.dirLight.position.set(30, 55, 25);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    this.dirLight.shadow.camera.left = -40;
    this.dirLight.shadow.camera.right = 40;
    this.dirLight.shadow.camera.top = 40;
    this.dirLight.shadow.camera.bottom = -40;
    this.scene.add(this.dirLight);

    this.scene.add(this.presentObjects);
    this.scene.add(this.echoObjects);
    this.scene.add(this.neutralObjects);

    this.buildWorld();
    this.setupPathLanterns();
    this.setupRealisticSnowfall();
    this.setupMemoryShards();
  }

  private buildWorld() {
    this.buildTerrain();
    this.buildForgottenCity();
    this.buildSunkenDistrict();
    this.buildClockworkCathedral();
    this.buildCrimsonForest();
    this.buildObservatory();
  }

  private buildTerrain() {
    // Ground plane - Brighter, richer tone to reflect moonlight & ambient skylight
    const groundGeo = new THREE.PlaneGeometry(140, 360, 48, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x272e3d,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -170);
    ground.receiveShadow = true;
    this.neutralObjects.add(ground);

    // Stone pathway tiles running down the center - Enhanced clarity & edge definition
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x3d475a,
      roughness: 0.75,
      metalness: 0.2,
    });
    for (let z = 0; z > -340; z -= 8) {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(7, 0.15, 6.5), pathMat);
      tile.position.set(0, 0.02, z);
      tile.receiveShadow = true;
      this.neutralObjects.add(tile);
    }
  }

  private buildForgottenCity() {
    // Region 1: z from 0 to -40
    // Present: Cracked ruined columns, collapsed arches, rubble piles
    const ruinedMat = new THREE.MeshStandardMaterial({ color: 0x242833, roughness: 0.9 });
    const intactMat = new THREE.MeshStandardMaterial({ color: 0x5c677d, roughness: 0.4, metalness: 0.2 });
    const goldTrim = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });

    // Colonnade columns
    for (let i = -1; i <= 1; i += 2) {
      for (let z = -6; z > -38; z -= 8) {
        // PRESENT: Broken half column
        const brokenCol = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 3.5, 8), ruinedMat);
        brokenCol.position.set(i * 9, 1.75, z);
        brokenCol.rotation.z = (Math.random() - 0.5) * 0.15;
        this.presentObjects.add(brokenCol);

        // ECHO: Pristine grand column with golden capital
        const fullCol = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 9, 12), intactMat);
        fullCol.position.set(i * 9, 4.5, z);
        const capital = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 2.0), goldTrim);
        capital.position.set(i * 9, 9, z);
        this.echoObjects.add(fullCol);
        this.echoObjects.add(capital);
      }
    }

    // Grand Entrance Arch
    const archPostL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 12, 2.5), intactMat);
    const archPostR = new THREE.Mesh(new THREE.BoxGeometry(2.5, 12, 2.5), intactMat);
    const archHeader = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 2.5), goldTrim);
    archPostL.position.set(-7, 6, -38);
    archPostR.position.set(7, 6, -38);
    archHeader.position.set(0, 11, -38);
    this.echoObjects.add(archPostL);
    this.echoObjects.add(archPostR);
    this.echoObjects.add(archHeader);

    // Present version: Shattered arch pieces on the ground
    const shattered1 = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 2.5), ruinedMat);
    shattered1.position.set(-4, 1.2, -38);
    shattered1.rotation.y = 0.4;
    const shattered2 = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 2.5), ruinedMat);
    shattered2.position.set(5, 1.2, -37);
    shattered2.rotation.z = 0.3;
    this.presentObjects.add(shattered1);
    this.presentObjects.add(shattered2);
  }

  private buildSunkenDistrict() {
    // Region 2: z from -55 to -105
    // Water basin canal
    const waterGeo = new THREE.PlaneGeometry(35, 45);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x005f73,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.4, -80);
    this.echoObjects.add(water);

    // Present canal: toxic sludge & dry rusted pipes
    const sludgeMat = new THREE.MeshStandardMaterial({
      color: 0x1f130b,
      roughness: 0.9,
    });
    const sludge = new THREE.Mesh(waterGeo, sludgeMat);
    sludge.rotation.x = -Math.PI / 2;
    sludge.position.set(0, -0.6, -80);
    this.presentObjects.add(sludge);

    // Submerged buildings
    for (let i = 0; i < 6; i++) {
      const bHeight = 7 + i * 2;
      const bMesh = new THREE.Mesh(
        new THREE.BoxGeometry(8, bHeight, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e2029, roughness: 0.8 })
      );
      const side = i % 2 === 0 ? 1 : -1;
      bMesh.position.set(side * (16 + (i % 3) * 3), bHeight / 2 - 2, -65 - i * 7);
      this.neutralObjects.add(bMesh);
    }
  }

  private buildClockworkCathedral() {
    // Region 3: z from -130 to -210
    // Giant cathedral walls
    const cathedralMat = new THREE.MeshStandardMaterial({
      color: 0x171921,
      roughness: 0.7,
      metalness: 0.3,
    });

    const wallL = new THREE.Mesh(new THREE.BoxGeometry(2, 22, 75), cathedralMat);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(2, 22, 75), cathedralMat);
    wallL.position.set(-22, 11, -170);
    wallR.position.set(22, 11, -170);
    this.neutralObjects.add(wallL);
    this.neutralObjects.add(wallR);

    // Massive rotating clockwork gears in Echo
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25,
    });
    const gearRustMat = new THREE.MeshStandardMaterial({
      color: 0x3d261d,
      metalness: 0.4,
      roughness: 0.9,
    });

    for (let i = 0; i < 4; i++) {
      const radius = 4.5 + (i % 2) * 2;
      const gearGeo = new THREE.CylinderGeometry(radius, radius, 0.6, 16);

      // Echo spinning gear
      const echoGear = new THREE.Mesh(gearGeo, gearMat);
      echoGear.position.set(i % 2 === 0 ? -18 : 18, 12 + (i % 3) * 3, -150 - i * 16);
      echoGear.rotation.x = Math.PI / 2;
      this.echoObjects.add(echoGear);
      this.rotatingGears.push(echoGear);

      // Present broken rusted gear on the ground
      const presentGear = new THREE.Mesh(gearGeo, gearRustMat);
      presentGear.position.set(i % 2 === 0 ? -14 : 14, 0.4, -150 - i * 16);
      presentGear.rotation.set(0.3, 0.2, 0.1);
      this.presentObjects.add(presentGear);
    }

    // Circular Boss Arena (The Chrono Knight) at z = -195
    const arenaMat = new THREE.MeshStandardMaterial({ color: 0x282c37, roughness: 0.6 });
    const arenaFloor = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 0.8, 32), arenaMat);
    arenaFloor.position.set(0, 0.3, -195);
    this.neutralObjects.add(arenaFloor);

    // Arena pillar perimeter
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      const px = Math.cos(a) * 19;
      const pz = -195 + Math.sin(a) * 19;
      const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 14, 10), cathedralMat);
      pil.position.set(px, 7, pz);
      this.neutralObjects.add(pil);
    }
  }

  private buildCrimsonForest() {
    // Region 4: z from -220 to -270
    // Present: Dead twisted blackened trees
    const deadTreeMat = new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.95 });
    // Echo: Majestic crimson foliage trees
    const crimsonLeafMat = new THREE.MeshStandardMaterial({
      color: 0x9d0208,
      emissive: 0x6a040f,
      emissiveIntensity: 0.6,
      roughness: 0.7,
    });
    const livingBarkMat = new THREE.MeshStandardMaterial({ color: 0x3d1c06, roughness: 0.8 });

    for (let i = 0; i < 18; i++) {
      const tx = (i % 2 === 0 ? 1 : -1) * (10 + (i * 3.7) % 18);
      const tz = -225 - i * 2.5;

      // Present dead trunk
      const deadTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.8, 7, 6), deadTreeMat);
      deadTrunk.position.set(tx, 3.5, tz);
      deadTrunk.rotation.z = (i % 3 - 1) * 0.15;
      this.presentObjects.add(deadTrunk);

      // Echo flourishing tree
      const livingTree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 9, 8), livingBarkMat);
      trunk.position.y = 4.5;
      const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 8), crimsonLeafMat);
      foliage1.position.y = 9;
      const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), crimsonLeafMat);
      foliage2.position.set(1.2, 10.5, 0.5);

      livingTree.add(trunk);
      livingTree.add(foliage1);
      livingTree.add(foliage2);
      livingTree.position.set(tx, 0, tz);
      this.echoObjects.add(livingTree);
    }
  }

  private buildObservatory() {
    // Region 5: z from -280 to -340 (Final Arena)
    const observatoryMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c16,
      metalness: 0.85,
      roughness: 0.2,
    });
    const goldCore = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xfb8500,
      emissiveIntensity: 1.6,
    });

    // Grand Dome Base
    const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(24, 26, 1.5, 32), observatoryMat);
    domeBase.position.set(0, 0.6, -310);
    this.neutralObjects.add(domeBase);

    // Floating Astrolabe Rings around the arena
    const astrolabe = new THREE.Group();
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(18, 0.4, 8, 48), goldCore);
    ring1.rotation.x = Math.PI / 4;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(14, 0.35, 8, 48), goldCore);
    ring2.rotation.y = Math.PI / 3;

    astrolabe.add(ring1);
    astrolabe.add(ring2);
    astrolabe.position.set(0, 15, -310);
    this.echoObjects.add(astrolabe);
  }

  private setupPathLanterns() {
    // Array of key pathway markers to cast welcoming light across the regions
    const lanternCoords = [
      { x: -5.5, z: -10 },
      { x: 5.5, z: -32 },
      { x: -5.5, z: -68 },
      { x: 5.5, z: -108 },
      { x: -5.5, z: -150 },
      { x: 5.5, z: -195 },
      { x: -5.5, z: -245 },
      { x: 5.5, z: -290 },
    ];

    const presentPostMat = new THREE.MeshStandardMaterial({ color: 0x2e3544, roughness: 0.8 });
    const presentCrystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.8,
      roughness: 0.2,
    });

    const echoPostMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
    const echoFlameMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xf59e0b,
      emissiveIntensity: 3.2,
      roughness: 0.2,
    });

    for (const coord of lanternCoords) {
      // 1. PRESENT: Ancient runic pillar with hovering glowing cyan crystal
      const presentLantern = new THREE.Group();
      const pBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.2, 0.7), presentPostMat);
      pBase.position.y = 1.6;
      const pCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), presentCrystalMat);
      pCrystal.position.y = 3.6;
      presentLantern.add(pBase);
      presentLantern.add(pCrystal);
      presentLantern.position.set(coord.x, 0, coord.z);
      this.presentObjects.add(presentLantern);

      // 2. ECHO: Gilded ornamental Victorian/fantasy brass lamppost with amber lantern
      const echoLantern = new THREE.Group();
      const eBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.45, 4.0, 8), echoPostMat);
      eBase.position.y = 2.0;
      const eHead = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.9), echoPostMat);
      eHead.position.y = 4.2;
      const eFlame = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), echoFlameMat);
      eFlame.position.y = 4.2;
      echoLantern.add(eBase);
      echoLantern.add(eHead);
      echoLantern.add(eFlame);
      echoLantern.position.set(coord.x, 0, coord.z);
      this.echoObjects.add(echoLantern);

      // Shared localized PointLight for natural illumination on ground & player
      const pLight = new THREE.PointLight(0x38bdf8, 3.5, 20);
      pLight.position.set(coord.x, 3.8, coord.z);
      this.scene.add(pLight);
      this.pointLights.push(pLight);
    }
  }

  private createSnowflakeTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Soft Gaussian-like radial gradient for delicate, natural fluffy snowflake
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.25, 'rgba(242, 248, 255, 0.9)');
    grad.addColorStop(0.55, 'rgba(215, 235, 255, 0.45)');
    grad.addColorStop(0.85, 'rgba(180, 215, 255, 0.12)');
    grad.addColorStop(1.0, 'rgba(160, 200, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
  }

  private setupRealisticSnowfall() {
    const count = 2400;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    // Extra data per particle: [fallSpeed, swayPhase, swaySpeed, swayRadius]
    this.snowData = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      // Cylindrical spread around player
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.7) * 45;
      positions[i * 3] = Math.cos(angle) * dist;
      positions[i * 3 + 1] = Math.random() * 34;
      positions[i * 3 + 2] = Math.sin(angle) * dist;

      // Realistic fall speeds: 1.2 to 2.8 m/s (gentle, atmospheric drift)
      this.snowData[i * 4] = 1.2 + Math.random() * 1.6;
      // Sway parameters for aerodynamic air turbulence
      this.snowData[i * 4 + 1] = Math.random() * Math.PI * 2; // sway phase
      this.snowData[i * 4 + 2] = 1.0 + Math.random() * 1.8;   // sway frequency
      this.snowData[i * 4 + 3] = 0.35 + Math.random() * 0.95; // sway radius/amplitude
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const snowflakeTexture = this.createSnowflakeTexture();
    const mat = new THREE.PointsMaterial({
      map: snowflakeTexture,
      color: 0xf0f7ff,
      size: 0.38,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.snowSystem = new THREE.Points(geo, mat);
    this.scene.add(this.snowSystem);
    this.snowPositions = positions;
  }

  private setupMemoryShards() {
    const shardDefs: Omit<MemoryShard, 'collected'>[] = [
      {
        id: 'shard_1',
        title: 'Archive 01: The Chrono Machine',
        region: 'The Forgotten City',
        date: 'Day 1 of the Fracture',
        excerpt: 'The resonance chambers beneath Veyra were designed to capture history, not split reality.',
        position: [-6, 1.2, -18],
        timeline: 'PRESENT',
      },
      {
        id: 'shard_2',
        title: 'Archive 02: The Scholars Whisper',
        region: 'The Sunken District',
        date: 'Echo Epoch',
        excerpt: 'We noticed our shadows lingering seconds after we walked away. Time itself began to duplicate.',
        position: [8, 1.5, -62],
        timeline: 'ECHO',
      },
      {
        id: 'shard_3',
        title: 'Archive 03: The Architect’s Design',
        region: 'The Clockwork Cathedral',
        date: 'Year 42 of Collapse',
        excerpt: 'He believed both timelines could be merged into a singular eternal perfection.',
        position: [-15, 1.8, -138],
        timeline: 'PRESENT',
      },
      {
        id: 'shard_4',
        title: 'Archive 04: The Chrono Knight’s Oath',
        region: 'Cathedral Nave',
        date: 'Before the Fall',
        excerpt: 'I will guard the threshold between then and now, until the traveler awakens.',
        position: [12, 1.5, -185],
        timeline: 'ECHO',
      },
      {
        id: 'shard_5',
        title: 'Archive 05: The Crimson Spores',
        region: 'The Crimson Forest',
        date: 'Year 88 of Collapse',
        excerpt: 'The trees absorb chronological fallout. What dies in the Present blossoms in the Echo.',
        position: [-14, 1.2, -242],
        timeline: 'PRESENT',
      },
      {
        id: 'shard_6',
        title: 'Archive 06: Truth of Kael',
        region: 'The Observatory Sanctum',
        date: 'Final Cycle',
        excerpt: 'Kael was never born in Veyra. Kael is the original Echo—the anchor holding reality together.',
        position: [0, 2.0, -325],
        timeline: 'ECHO',
      },
    ];

    const shardGeo = new THREE.OctahedronGeometry(0.4, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d4e6,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    for (const def of shardDefs) {
      const shard: MemoryShard = { ...def, collected: false };
      this.memoryShards.push(shard);

      const mesh = new THREE.Mesh(shardGeo, shardMat.clone());
      mesh.position.set(...shard.position);
      this.scene.add(mesh);
      this.shardMeshes.push(mesh);
    }
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    const isEcho = this.timelineManager.isEcho();
    const progress = this.timelineManager.transitionProgress; // 0 (Present) to 1 (Echo)

    // Smoothly interpolate Lighting, Hemisphere skylight, and Fog
    // Present: Clear, crisp twilight moonlit blue
    // Echo: Warm, luminous golden sunrise
    const presentAmbient = new THREE.Color(0x3a4d6b);
    const echoAmbient = new THREE.Color(0x7c542a);
    this.ambientLight.color.lerpColors(presentAmbient, echoAmbient, progress);
    this.ambientLight.intensity = 2.0 + progress * 0.5;

    const presentDir = new THREE.Color(0xa6c9ed);
    const echoDir = new THREE.Color(0xffbe42);
    this.dirLight.color.lerpColors(presentDir, echoDir, progress);
    this.dirLight.intensity = 2.8 + progress * 0.6;

    const presentHemiSky = new THREE.Color(0x9bc4ee);
    const presentHemiGround = new THREE.Color(0x2b3547);
    const echoHemiSky = new THREE.Color(0xffd699);
    const echoHemiGround = new THREE.Color(0x46321e);
    this.hemiLight.color.lerpColors(presentHemiSky, echoHemiSky, progress);
    this.hemiLight.groundColor.lerpColors(presentHemiGround, echoHemiGround, progress);

    const presentFog = new THREE.Color(0x1a2434);
    const echoFog = new THREE.Color(0x422e1b);
    this.fog.color.lerpColors(presentFog, echoFog, progress);
    this.fog.density = 0.0065;
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.copy(this.fog.color);
    }

    // Interpolate lantern point lights
    const pColor = new THREE.Color(0x38bdf8);
    const eColor = new THREE.Color(0xf59e0b);
    const currentPointColor = new THREE.Color().lerpColors(pColor, eColor, progress);
    for (const pl of this.pointLights) {
      pl.color.copy(currentPointColor);
      pl.intensity = 3.5 + progress * 0.5;
    }

    // Objects visibility & reconstruction animation
    this.presentObjects.visible = progress < 0.95;
    this.echoObjects.visible = progress > 0.05;

    // Rotate clockwork gears
    for (const gear of this.rotatingGears) {
      gear.rotation.z += delta * (isEcho ? 1.2 : 0.05);
    }

    // Realistic Snowfall / Echo Spores physics
    if (this.snowSystem && this.snowPositions && this.snowData) {
      this.snowElapsed += delta;
      const snowMat = this.snowSystem.material as THREE.PointsMaterial;

      // Color shifts between winter crystalline snow and golden floating pollen/spores
      const snowColor = new THREE.Color(0xf0f7ff);
      const sporeColor = new THREE.Color(0xffd166);
      snowMat.color.lerpColors(snowColor, sporeColor, progress);
      snowMat.opacity = 0.85;

      // Dynamic wind vector with realistic undulating gusts
      const windX = Math.sin(this.snowElapsed * 0.35) * 1.4 + 0.5;
      const windZ = Math.cos(this.snowElapsed * 0.25) * 0.9;

      const count = this.snowPositions.length / 3;
      const speedMultiplier = isEcho ? 0.38 : 1.0; // Echo timeline spores float much slower and gently

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const dIdx = i * 4;

        const baseFallSpeed = this.snowData[dIdx];
        const swayPhase = this.snowData[dIdx + 1];
        const swayFreq = this.snowData[dIdx + 2];
        const swayAmp = this.snowData[dIdx + 3];

        // 1. Descent with individual fall speeds & air resistance
        this.snowPositions[idx + 1] -= baseFallSpeed * speedMultiplier * delta;

        // 2. Aerodynamic fluttering and lateral air turbulence (sine wave sway + wind)
        const flutterX = Math.sin(this.snowElapsed * swayFreq + swayPhase) * swayAmp;
        const flutterZ = Math.cos(this.snowElapsed * swayFreq * 0.8 + swayPhase) * (swayAmp * 0.6);

        this.snowPositions[idx] += (flutterX + windX) * delta;
        this.snowPositions[idx + 2] += (flutterZ + windZ) * delta;

        // 3. Dynamic wrapping around player to ensure continuous snowfall coverage
        const relX = this.snowPositions[idx] - playerPos.x;
        const relZ = this.snowPositions[idx + 2] - playerPos.z;

        // Hit ground or fallen below view
        if (this.snowPositions[idx + 1] < 0.1) {
          this.snowPositions[idx + 1] = 28 + Math.random() * 6;
          // Re-scatter within cylindrical radius around player
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.pow(Math.random(), 0.7) * 40;
          this.snowPositions[idx] = playerPos.x + Math.cos(angle) * dist;
          this.snowPositions[idx + 2] = playerPos.z + Math.sin(angle) * dist;
        }

        // Horizontal boundary wrap
        if (Math.abs(relX) > 42) {
          this.snowPositions[idx] = playerPos.x - Math.sign(relX) * 40;
        }
        if (Math.abs(relZ) > 42) {
          this.snowPositions[idx + 2] = playerPos.z - Math.sign(relZ) * 40;
        }
      }

      this.snowSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Animate Memory Shards
    for (let i = 0; i < this.memoryShards.length; i++) {
      const shard = this.memoryShards[i];
      const mesh = this.shardMeshes[i];

      if (shard.collected) {
        mesh.visible = false;
        continue;
      }

      // Visible in matching timeline or both if shift is near
      mesh.visible = (shard.timeline === 'ECHO' && isEcho) || (shard.timeline === 'PRESENT' && !isEcho);
      mesh.rotation.y += delta * 2.5;
      mesh.rotation.x += delta * 1.2;
      mesh.position.y = shard.position[1] + Math.sin(Date.now() * 0.004 + i) * 0.25;
    }
  }

  public checkMemoryShardPickup(playerPos: THREE.Vector3): MemoryShard | null {
    const isEcho = this.timelineManager.isEcho();

    for (let i = 0; i < this.memoryShards.length; i++) {
      const shard = this.memoryShards[i];
      if (shard.collected) continue;

      if ((shard.timeline === 'ECHO' && isEcho) || (shard.timeline === 'PRESENT' && !isEcho)) {
        const shardPos = new THREE.Vector3(...shard.position);
        if (playerPos.distanceTo(shardPos) < 2.4) {
          shard.collected = true;
          return shard;
        }
      }
    }
    return null;
  }
}
