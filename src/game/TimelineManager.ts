import * as THREE from 'three';
import { Timeline, EchoAnchorObject, EchoVisionState } from '../types';
import { soundManager } from '../audio/SoundManager';

export type TimelineListener = (timeline: Timeline, transitionProgress: number) => void;

export class TimelineManager {
  public currentTimeline: Timeline = 'PRESENT';
  public targetTimeline: Timeline = 'PRESENT';
  public isTransitioning: boolean = false;
  public transitionProgress: number = 0; // 0 = fully PRESENT, 1 = fully ECHO
  public timeDilation: number = 1.0; // Slow-mo multiplier
  public glitchIntensity: number = 0.0;

  // Echo Anchor system
  public activeAnchors: Map<string, EchoAnchorObject> = new Map();
  public maxAnchors: number = 2; // Upgradable via Wanderer skill tree
  private anchorVfxGroup: THREE.Group = new THREE.Group();

  // Echo Vision system
  public echoVision: EchoVisionState = {
    active: false,
    meter: 100,
    maxMeter: 100,
  };
  private visionPulseWave: THREE.Mesh | null = null;
  private visionPulseRadius: number = 0;

  // Scene elements for transition
  private scene: THREE.Scene;
  private listeners: Set<TimelineListener> = new Set();
  private transitionDuration: number = 0.55; // seconds
  private slowMoTimer: number = 0;
  private distortionParticles: THREE.Points | null = null;
  private particlePositions: Float32Array | null = null;

  // Expanding shockwave ring for enhanced Echo Shift
  private shiftShockwave: THREE.Mesh | null = null;
  private shockwaveScale: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.anchorVfxGroup);
    this.setupShiftParticles();
    this.setupEnhancedShiftVfx();
    this.setupEchoVisionVfx();
  }

  private setupShiftParticles() {
    const count = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;

      // Cyan to Gold
      colors[i * 3] = 0.2 + Math.random() * 0.8;
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.9;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.distortionParticles = new THREE.Points(geometry, material);
    this.scene.add(this.distortionParticles);
    this.particlePositions = positions;
  }

  private setupEnhancedShiftVfx() {
    // 3D toroidal temporal shockwave ring
    const ringGeo = new THREE.TorusGeometry(3.5, 0.2, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });
    this.shiftShockwave = new THREE.Mesh(ringGeo, ringMat);
    this.shiftShockwave.rotation.x = Math.PI / 2;
    this.scene.add(this.shiftShockwave);
  }

  private setupEchoVisionVfx() {
    // Spherical scan pulse wave
    const pulseGeo = new THREE.SphereGeometry(1, 24, 24);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.visionPulseWave = new THREE.Mesh(pulseGeo, pulseMat);
    this.scene.add(this.visionPulseWave);
  }

  public addListener(listener: TimelineListener) {
    this.listeners.add(listener);
  }

  public removeListener(listener: TimelineListener) {
    this.listeners.delete(listener);
  }

  public toggleTimeline(playerPosition?: THREE.Vector3): boolean {
    if (this.isTransitioning) return false;

    this.targetTimeline = this.currentTimeline === 'PRESENT' ? 'ECHO' : 'PRESENT';
    this.isTransitioning = true;
    this.timeDilation = 0.15; // Brief cinematic world slowdown
    this.slowMoTimer = 0.3;
    this.glitchIntensity = 1.0;

    // Center shift particles and shockwave around player
    if (playerPosition) {
      if (this.distortionParticles) {
        this.distortionParticles.position.copy(playerPosition);
        this.distortionParticles.position.y += 1.0;
      }
      if (this.shiftShockwave) {
        this.shiftShockwave.position.copy(playerPosition);
        this.shiftShockwave.position.y += 0.4;
        this.shockwaveScale = 0.1;
        const mat = this.shiftShockwave.material as THREE.MeshBasicMaterial;
        mat.color.setHex(this.targetTimeline === 'ECHO' ? 0xffb703 : 0x00f0ff);
        mat.opacity = 0.9;
      }
    }

    soundManager.switchTimeline(this.targetTimeline);
    return true;
  }

  // ECHO ANCHOR API
  public toggleEchoAnchor(
    id: string,
    name: string,
    position: [number, number, number],
    duration: number = 28
  ): { success: boolean; active: boolean; message: string } {
    if (this.activeAnchors.has(id)) {
      // Remove anchor
      this.activeAnchors.delete(id);
      this.removeAnchorVisual(id);
      soundManager.playEchoAnchor();
      return { success: true, active: false, message: `Anchor detached from ${name}.` };
    }

    if (this.activeAnchors.size >= this.maxAnchors) {
      return {
        success: false,
        active: false,
        message: `Maximum Echo Anchors reached (${this.maxAnchors}). Detach an anchor first!`,
      };
    }

    const anchor: EchoAnchorObject = {
      id,
      name,
      position,
      anchoredTimeline: this.currentTimeline,
      active: true,
      duration,
      maxDuration: duration,
    };
    this.activeAnchors.set(id, anchor);
    this.createAnchorVisual(anchor);
    soundManager.playEchoAnchor();
    return {
      success: true,
      active: true,
      message: `${name} anchored to ${this.currentTimeline} timeline!`,
    };
  }

  public isObjectAnchored(id: string): boolean {
    return this.activeAnchors.has(id);
  }

  public getAnchoredTimeline(id: string): Timeline | null {
    const anchor = this.activeAnchors.get(id);
    return anchor ? anchor.anchoredTimeline : null;
  }

  private createAnchorVisual(anchor: EchoAnchorObject) {
    const vfx = new THREE.Group();
    vfx.name = `anchor_vfx_${anchor.id}`;

    // Glowing cyan/amber dimensional rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: anchor.anchoredTimeline === 'ECHO' ? 0xf59e0b : 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.08, 12, 36), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.06, 12, 36), ringMat.clone());
    ring2.rotation.x = Math.PI / 2;

    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.MeshBasicMaterial({
        color: anchor.anchoredTimeline === 'ECHO' ? 0xffd166 : 0x70e000,
        wireframe: true,
      })
    );

    vfx.add(ring1);
    vfx.add(ring2);
    vfx.add(core);
    vfx.position.set(...anchor.position);
    this.anchorVfxGroup.add(vfx);
  }

  private removeAnchorVisual(id: string) {
    const existing = this.anchorVfxGroup.getObjectByName(`anchor_vfx_${id}`);
    if (existing) {
      this.anchorVfxGroup.remove(existing);
    }
  }

  // ECHO VISION API
  public toggleEchoVision(playerPos?: THREE.Vector3): boolean {
    if (this.echoVision.active) {
      this.echoVision.active = false;
      soundManager.playEchoVision(false);
      if (this.visionPulseWave) {
        (this.visionPulseWave.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      return false;
    }

    if (this.echoVision.meter < 15) {
      return false; // Not enough energy
    }

    this.echoVision.active = true;
    soundManager.playEchoVision(true);

    if (playerPos && this.visionPulseWave) {
      this.visionPulseWave.position.copy(playerPos);
      this.visionPulseRadius = 1;
      (this.visionPulseWave.material as THREE.MeshBasicMaterial).opacity = 0.8;
    }

    return true;
  }

  public update(delta: number, playerPos?: THREE.Vector3) {
    // Handle slow-mo decay
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= delta;
      if (this.slowMoTimer <= 0) {
        this.timeDilation = 1.0;
      }
    }

    // Handle transition interpolation
    if (this.isTransitioning) {
      const step = (delta / this.transitionDuration) * 1.5;
      if (this.targetTimeline === 'ECHO') {
        this.transitionProgress = Math.min(1.0, this.transitionProgress + step);
        if (this.transitionProgress >= 1.0) {
          this.transitionProgress = 1.0;
          this.currentTimeline = 'ECHO';
          this.isTransitioning = false;
        }
      } else {
        this.transitionProgress = Math.max(0.0, this.transitionProgress - step);
        if (this.transitionProgress <= 0.0) {
          this.transitionProgress = 0.0;
          this.currentTimeline = 'PRESENT';
          this.isTransitioning = false;
        }
      }

      // Animate transition particle cloud
      if (this.distortionParticles && this.particlePositions) {
        const mat = this.distortionParticles.material as THREE.PointsMaterial;
        mat.opacity = Math.sin(this.transitionProgress * Math.PI) * 0.95;
        this.distortionParticles.rotation.y += delta * 4.5;
      }

      // Animate shockwave
      if (this.shiftShockwave) {
        this.shockwaveScale += delta * 24;
        this.shiftShockwave.scale.set(this.shockwaveScale, this.shockwaveScale, this.shockwaveScale);
        const mat = this.shiftShockwave.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.9 - this.shockwaveScale * 0.08);
      }

      // Glitch intensity fades out
      this.glitchIntensity = Math.sin(this.transitionProgress * Math.PI);
      this.notifyListeners();
    } else {
      if (this.distortionParticles) {
        (this.distortionParticles.material as THREE.PointsMaterial).opacity = 0;
      }
      if (this.shiftShockwave) {
        (this.shiftShockwave.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      this.glitchIntensity = 0;
    }

    // Update Echo Anchors duration
    this.activeAnchors.forEach((anchor, key) => {
      anchor.duration -= delta;
      const vfx = this.anchorVfxGroup.getObjectByName(`anchor_vfx_${anchor.id}`);
      if (vfx) {
        vfx.rotation.y += delta * 1.8;
        vfx.rotation.z += delta * 1.2;
      }
      if (anchor.duration <= 0) {
        this.activeAnchors.delete(key);
        this.removeAnchorVisual(anchor.id);
        soundManager.playEchoAnchor();
      }
    });

    // Update Echo Vision meter & scan pulse wave
    if (this.echoVision.active) {
      this.echoVision.meter = Math.max(0, this.echoVision.meter - delta * 14);
      if (this.echoVision.meter <= 0) {
        this.echoVision.active = false;
        soundManager.playEchoVision(false);
      }

      if (this.visionPulseWave && playerPos) {
        this.visionPulseWave.position.copy(playerPos);
        this.visionPulseRadius += delta * 35;
        if (this.visionPulseRadius > 70) this.visionPulseRadius = 1;
        this.visionPulseWave.scale.set(this.visionPulseRadius, this.visionPulseRadius, this.visionPulseRadius);
        const mat = this.visionPulseWave.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0.1, 0.7 - (this.visionPulseRadius / 70) * 0.6);
      }
    } else {
      // Recharging when inactive
      this.echoVision.meter = Math.min(this.echoVision.maxMeter, this.echoVision.meter + delta * 9);
      if (this.visionPulseWave) {
        (this.visionPulseWave.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.currentTimeline, this.transitionProgress);
    });
  }

  public isEcho(): boolean {
    return this.currentTimeline === 'ECHO';
  }

  public isPresent(): boolean {
    return this.currentTimeline === 'PRESENT';
  }

  public getAnchoredCount(): number {
    return this.activeAnchors.size;
  }

  public get echoVisionActive(): boolean {
    return this.echoVision.active;
  }

  public get echoVisionMeter(): number {
    return this.echoVision.meter;
  }
}

