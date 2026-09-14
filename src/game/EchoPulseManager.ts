import * as THREE from 'three';
import { EchoPulseTarget, EchoPulseState } from '../types';
import { WorldBuilder } from './WorldBuilder';
import { PuzzleManager } from './PuzzleManager';
import { EnemyManager } from './EnemyManager';
import { QuestManager } from './QuestManager';

export class EchoPulseManager {
  private scene: THREE.Scene;

  // Pulse wave expanding geometry & shader material
  private pulseSphereMesh: THREE.Mesh;
  private pulseSphereMat: THREE.ShaderMaterial;

  // Ground Sonar Grid expanding disc & shader material
  private groundSonarMesh: THREE.Mesh;
  private groundSonarMat: THREE.ShaderMaterial;

  // Tactical beacon & highlight pool
  private highlightGroup: THREE.Group = new THREE.Group();
  private activeHighlightMeshes: THREE.Object3D[] = [];

  // State
  public isActive: boolean = false;
  public progress: number = 0; // 0 to 1
  public currentRadius: number = 0;
  public readonly maxRadius: number = 32.0;
  public readonly waveSpeed: number = 22.0; // meters per sec
  public durationRemaining: number = 0;
  public readonly maxDuration: number = 5.0; // tactical vision duration in seconds
  public cooldownRemaining: number = 0;
  public readonly maxCooldown: number = 2.5;

  public pulseCenter: THREE.Vector3 = new THREE.Vector3();
  public detectedTargets: EchoPulseTarget[] = [];
  private totalTime: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Expanding 3D Spherical Wave Shader
    const sphereGeo = new THREE.SphereGeometry(1, 40, 24);
    this.pulseSphereMat = new THREE.ShaderMaterial({
      uniforms: {
        uPulseCenter: { value: new THREE.Vector3() },
        uPulseRadius: { value: 0.0 },
        uMaxRadius: { value: this.maxRadius },
        uTime: { value: 0.0 },
        uProgress: { value: 0.0 },
        uColorPeak: { value: new THREE.Color(0xdcfce7) },
        uColorPrimary: { value: new THREE.Color(0x00f0ff) },
        uColorSecondary: { value: new THREE.Color(0x8b5cf6) },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uPulseRadius;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          // Subtle harmonic surface ripples
          vec3 displaced = position;
          float harmonic = sin(position.y * 6.0 + uTime * 10.0) * cos(position.x * 6.0);
          displaced += normal * (harmonic * 0.04);
          
          vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
          vWorldPos = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uPulseCenter;
        uniform float uPulseRadius;
        uniform float uMaxRadius;
        uniform float uTime;
        uniform float uProgress;
        uniform vec3 uColorPeak;
        uniform vec3 uColorPrimary;
        uniform vec3 uColorSecondary;

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
          float dist = length(vWorldPos - uPulseCenter);
          float ringThickness = 1.8;
          float diff = abs(dist - uPulseRadius);
          
          // Primary energetic wavefront
          float primaryWave = smoothstep(ringThickness, 0.0, diff);

          // Trailing reverberation ripples
          float trail = uPulseRadius - dist;
          float ripple = 0.0;
          if (trail > 0.0 && trail < 5.0) {
            ripple = sin(trail * 3.14159 * 1.5 - uTime * 12.0) * 0.5 + 0.5;
            ripple *= smoothstep(5.0, 0.0, trail) * 0.45;
          }

          // Tactical grid lattice pattern
          float gridH = abs(fract(vUv.y * 24.0 + uTime * 0.4) - 0.5);
          float gridV = abs(fract(vUv.x * 48.0) - 0.5);
          float gridLines = (smoothstep(0.08, 0.0, gridH) + smoothstep(0.06, 0.0, gridV)) * 0.45;

          // Camera Fresnel rim glow
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

          // Alpha fade out as pulse approaches edge and expires
          float lifeFade = smoothstep(1.0, 0.7, uProgress);
          float distFade = smoothstep(uMaxRadius, uMaxRadius * 0.15, uPulseRadius);

          float finalAlpha = (primaryWave * 1.2 + ripple * 0.7 + fresnel * 0.6 + gridLines * primaryWave) * lifeFade * distFade;
          if (finalAlpha < 0.02) discard;

          // Multi-layer temporal chromatic coloring
          vec3 color = mix(uColorSecondary, uColorPrimary, primaryWave);
          color = mix(color, uColorPeak, primaryWave * fresnel * 1.5);

          gl_FragColor = vec4(color * 1.6, min(0.9, finalAlpha));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    this.pulseSphereMesh = new THREE.Mesh(sphereGeo, this.pulseSphereMat);
    this.pulseSphereMesh.visible = false;
    this.pulseSphereMesh.renderOrder = 998;
    this.scene.add(this.pulseSphereMesh);

    // 2. Ground Sonar Radar Sweep Disc Shader
    const ringGeo = new THREE.RingGeometry(0.1, 1, 64, 8);
    ringGeo.rotateX(-Math.PI / 2);
    this.groundSonarMat = new THREE.ShaderMaterial({
      uniforms: {
        uPulseCenter: { value: new THREE.Vector3() },
        uPulseRadius: { value: 0.0 },
        uMaxRadius: { value: this.maxRadius },
        uTime: { value: 0.0 },
        uProgress: { value: 0.0 },
        uColor: { value: new THREE.Color(0x00f0ff) },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uPulseCenter;
        uniform float uPulseRadius;
        uniform float uMaxRadius;
        uniform float uTime;
        uniform float uProgress;
        uniform vec3 uColor;

        varying vec3 vWorldPos;
        varying vec2 vUv;

        void main() {
          vec2 centerUv = vUv - vec2(0.5);
          float r = length(centerUv) * 2.0;
          if (r > 1.0) discard;

          // Concentric animated sonar rings
          float rings = sin(r * 42.0 - uTime * 14.0) * 0.5 + 0.5;
          rings = smoothstep(0.7, 1.0, rings);

          // Radar sweep angular beam
          float angle = atan(centerUv.y, centerUv.x);
          float sweep = fract((angle / 6.28318) + uTime * 0.8);
          sweep = pow(sweep, 4.0);

          // Leading edge circle
          float edge = smoothstep(0.85, 1.0, r);

          float alpha = (rings * 0.5 + sweep * 0.6 + edge * 0.8) * (1.0 - uProgress);
          if (alpha < 0.02) discard;

          gl_FragColor = vec4(uColor * 1.5, alpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    this.groundSonarMesh = new THREE.Mesh(ringGeo, this.groundSonarMat);
    this.groundSonarMesh.visible = false;
    this.groundSonarMesh.position.y = 0.08;
    this.groundSonarMesh.renderOrder = 997;
    this.scene.add(this.groundSonarMesh);

    // Group for tactical world highlights
    this.scene.add(this.highlightGroup);
  }

  public triggerPulse(
    playerPosition: THREE.Vector3,
    world: WorldBuilder,
    puzzles: PuzzleManager,
    enemies: EnemyManager,
    questManager: QuestManager
  ): boolean {
    if (this.cooldownRemaining > 0) {
      return false; // Still on cooldown
    }

    this.isActive = true;
    this.progress = 0;
    this.currentRadius = 0.5;
    this.durationRemaining = this.maxDuration;
    this.cooldownRemaining = this.maxCooldown;
    this.pulseCenter.copy(playerPosition);

    // Position expanding pulse meshes
    this.pulseSphereMesh.position.copy(this.pulseCenter);
    this.pulseSphereMesh.scale.setScalar(0.5);
    this.pulseSphereMesh.visible = true;

    this.groundSonarMesh.position.set(this.pulseCenter.x, this.pulseCenter.y + 0.08, this.pulseCenter.z);
    this.groundSonarMesh.scale.setScalar(0.5);
    this.groundSonarMesh.visible = true;

    this.pulseSphereMat.uniforms.uPulseCenter.value.copy(this.pulseCenter);
    this.pulseSphereMat.uniforms.uPulseRadius.value = 0.5;
    this.pulseSphereMat.uniforms.uProgress.value = 0;

    this.groundSonarMat.uniforms.uPulseCenter.value.copy(this.pulseCenter);
    this.groundSonarMat.uniforms.uPulseRadius.value = 0.5;
    this.groundSonarMat.uniforms.uProgress.value = 0;

    // Scan for nearby interactive objects, loot, and enemies
    this.scanTargets(playerPosition, world, puzzles, enemies, questManager);

    // Spawn tactical highlights for detected targets
    this.spawnTacticalHighlights();

    return true;
  }

  private scanTargets(
    playerPos: THREE.Vector3,
    world: WorldBuilder,
    puzzles: PuzzleManager,
    enemies: EnemyManager,
    questManager: QuestManager
  ) {
    this.detectedTargets = [];

    // 1. SCAN INTERACTIVE OBJECTS (Puzzles, mechanisms, anchors, levers, waypoints)
    for (const p of puzzles.puzzles) {
      const pos = new THREE.Vector3();
      p.interactionMesh.getWorldPosition(pos);
      const dist = playerPos.distanceTo(pos);
      if (dist <= this.maxRadius) {
        this.detectedTargets.push({
          id: p.state.id,
          name: p.state.title,
          type: 'INTERACTIVE',
          position: [pos.x, pos.y, pos.z],
          distance: dist,
          info: p.state.solved ? 'Activated' : 'Mechanism Ready [E]',
        });
      }
    }

    // Fast travel monoliths
    const waypoints = questManager.getFastTravelPoints();
    for (const wp of waypoints) {
      const wpPos = new THREE.Vector3(...wp.position);
      const dist = playerPos.distanceTo(wpPos);
      if (dist <= this.maxRadius && dist > 1.5) {
        this.detectedTargets.push({
          id: wp.id,
          name: wp.name,
          type: 'INTERACTIVE',
          position: [wpPos.x, wpPos.y, wpPos.z],
          distance: dist,
          info: 'Chrono Monolith',
        });
      }
    }

    // 2. SCAN LOOT & COLLECTIBLES (Memory Shards, Relics, Fractured Cores)
    for (let i = 0; i < world.shardMeshes.length; i++) {
      const shardMesh = world.shardMeshes[i];
      if (!shardMesh || !shardMesh.visible) continue;
      const shardData = world.memoryShards[i];
      if (shardData && shardData.collected) continue;

      const pos = new THREE.Vector3();
      shardMesh.getWorldPosition(pos);
      const dist = playerPos.distanceTo(pos);
      if (dist <= this.maxRadius) {
        this.detectedTargets.push({
          id: shardData?.id || `shard_${i}`,
          name: shardData?.title || 'Memory Shard',
          type: 'LOOT',
          position: [pos.x, pos.y, pos.z],
          distance: dist,
          info: '+10 Echo Energy & Lore',
        });
      }
    }

    // Fractured Cores & Relics
    const cores = questManager.getFracturedCores();
    for (const c of cores) {
      if (c.collected || !c.position) continue;
      const pos = new THREE.Vector3(...c.position);
      const dist = playerPos.distanceTo(pos);
      if (dist <= this.maxRadius) {
        this.detectedTargets.push({
          id: c.id,
          name: c.name,
          type: 'LOOT',
          position: [pos.x, pos.y, pos.z],
          distance: dist,
          info: 'Fractured Core Shard',
        });
      }
    }

    // 3. SCAN ENEMIES & THREATS (Lurkers, Knights, Automatons)
    for (const enemy of enemies.enemies) {
      if (enemy.data.state === 'DEAD' || !enemy.mesh.visible) continue;
      const pos = new THREE.Vector3();
      enemy.mesh.getWorldPosition(pos);
      const dist = playerPos.distanceTo(pos);
      if (dist <= this.maxRadius) {
        this.detectedTargets.push({
          id: enemy.data.id,
          name: enemy.data.name,
          type: 'ENEMY',
          position: [pos.x, pos.y, pos.z],
          distance: dist,
          info: `Threat HP: ${Math.round(enemy.data.health)}/${enemy.data.maxHealth}`,
        });
      }
    }

    // Sort by proximity
    this.detectedTargets.sort((a, b) => a.distance - b.distance);
  }

  private spawnTacticalHighlights() {
    this.clearTacticalHighlights();

    // Create tactical beacon visual for each detected target
    for (const target of this.detectedTargets) {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(target.position[0], target.position[1], target.position[2]);

      let colorHex = 0x00f0ff; // Cyan for INTERACTIVE
      if (target.type === 'LOOT') colorHex = 0xfacc15; // Golden Amber for LOOT
      if (target.type === 'ENEMY') colorHex = 0xff1a53; // Neon Crimson for ENEMY

      // 1. Vertical holographic light beacon pillar
      const beamGeo = new THREE.CylinderGeometry(0.12, 0.45, 14, 16, 1, true);
      beamGeo.translate(0, 7, 0);
      const beamMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0.0 },
          uColor: { value: new THREE.Color(colorHex) },
          uAlpha: { value: 0.75 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uAlpha;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            // Animated scrolling scanline bands
            float scan = sin(vUv.y * 30.0 - uTime * 8.0) * 0.5 + 0.5;
            float topFade = smoothstep(1.0, 0.2, vUv.y);
            float bottomFade = smoothstep(0.0, 0.1, vUv.y);
            float alpha = (scan * 0.4 + 0.6) * topFade * bottomFade * uAlpha;
            gl_FragColor = vec4(uColor * 1.6, alpha);
          }
        `,
        transparent: true,
        depthTest: false, // Tactical X-ray vision: visible through walls!
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.renderOrder = 1000;
      beaconGroup.add(beamMesh);

      // 2. Rotating tactical marker prism
      const prismGeo =
        target.type === 'ENEMY'
          ? new THREE.OctahedronGeometry(0.75, 0)
          : target.type === 'LOOT'
          ? new THREE.DodecahedronGeometry(0.65, 0)
          : new THREE.BoxGeometry(0.85, 0.85, 0.85);

      const prismMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });

      const prismMesh = new THREE.Mesh(prismGeo, prismMat);
      prismMesh.position.y = 1.8;
      prismMesh.renderOrder = 1001;
      prismMesh.name = 'prism';
      beaconGroup.add(prismMesh);

      // 3. Pulsing ground tactical ring
      const ringGeo = new THREE.RingGeometry(0.7, 1.1, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.12;
      ringMesh.renderOrder = 999;
      beaconGroup.add(ringMesh);

      this.highlightGroup.add(beaconGroup);
      this.activeHighlightMeshes.push(beaconGroup);
    }
  }

  public update(delta: number, camera: THREE.PerspectiveCamera) {
    this.totalTime += delta;

    // Update cooldown
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
    }

    if (!this.isActive) return;

    // Advance pulse wave expansion
    if (this.currentRadius < this.maxRadius) {
      this.currentRadius += this.waveSpeed * delta;
      this.progress = Math.min(1.0, this.currentRadius / this.maxRadius);

      this.pulseSphereMesh.scale.setScalar(this.currentRadius);
      this.groundSonarMesh.scale.setScalar(this.currentRadius);

      this.pulseSphereMat.uniforms.uPulseRadius.value = this.currentRadius;
      this.pulseSphereMat.uniforms.uProgress.value = this.progress;
      this.pulseSphereMat.uniforms.uTime.value = this.totalTime;

      this.groundSonarMat.uniforms.uPulseRadius.value = this.currentRadius;
      this.groundSonarMat.uniforms.uProgress.value = this.progress;
      this.groundSonarMat.uniforms.uTime.value = this.totalTime;
    } else {
      // Wave reached max distance, hide expanding wave meshes
      this.pulseSphereMesh.visible = false;
      this.groundSonarMesh.visible = false;
    }

    // Decrement tactical vision duration
    this.durationRemaining -= delta;
    const fadeRatio = Math.max(0, Math.min(1.0, this.durationRemaining / 1.2));

    // Update tactical highlight beacon meshes
    for (const group of this.activeHighlightMeshes) {
      const prism = group.getObjectByName('prism') as THREE.Mesh;
      if (prism) {
        prism.rotation.y += delta * 2.2;
        prism.rotation.x += delta * 1.1;
      }

      // Fade out materials during final second
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.Material & {
            uniforms?: { uTime?: { value: number }; uAlpha?: { value: number } };
            opacity?: number;
          };
          if (mat.uniforms && mat.uniforms.uTime) {
            mat.uniforms.uTime.value = this.totalTime;
          }
          if (mat.uniforms && mat.uniforms.uAlpha) {
            mat.uniforms.uAlpha.value = 0.75 * fadeRatio;
          }
          if (mat.opacity !== undefined) {
            mat.opacity = 0.85 * fadeRatio;
          }
        }
      });
    }

    // Project target positions to screen space for HUD markers
    for (const target of this.detectedTargets) {
      const worldPos = new THREE.Vector3(target.position[0], target.position[1] + 1.8, target.position[2]);
      const projected = worldPos.clone().project(camera);

      // Check if target is in front of camera
      const isVisible = projected.z > -1.0 && projected.z < 1.0;
      const screenX = (projected.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-(projected.y * 0.5) + 0.5) * window.innerHeight;

      target.screenPos = {
        x: screenX,
        y: screenY,
        visible: isVisible,
      };
    }

    if (this.durationRemaining <= 0) {
      this.endPulse();
    }
  }

  public endPulse() {
    this.isActive = false;
    this.durationRemaining = 0;
    this.pulseSphereMesh.visible = false;
    this.groundSonarMesh.visible = false;
    this.clearTacticalHighlights();
    this.detectedTargets = [];
  }

  private clearTacticalHighlights() {
    while (this.highlightGroup.children.length > 0) {
      const obj = this.highlightGroup.children[0];
      this.highlightGroup.remove(obj);
    }
    this.activeHighlightMeshes = [];
  }

  public getState(): EchoPulseState {
    return {
      active: this.isActive,
      progress: this.progress,
      radius: this.currentRadius,
      maxRadius: this.maxRadius,
      durationRemaining: this.durationRemaining,
      maxDuration: this.maxDuration,
      cooldownRemaining: this.cooldownRemaining,
      maxCooldown: this.maxCooldown,
      targets: this.detectedTargets,
    };
  }
}
