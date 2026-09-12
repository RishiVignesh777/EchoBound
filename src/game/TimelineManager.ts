import * as THREE from 'three';
import { Timeline } from '../types';
import { soundManager } from '../audio/SoundManager';

export type TimelineListener = (timeline: Timeline, transitionProgress: number) => void;

export class TimelineManager {
  public currentTimeline: Timeline = 'PRESENT';
  public targetTimeline: Timeline = 'PRESENT';
  public isTransitioning: boolean = false;
  public transitionProgress: number = 0; // 0 = fully PRESENT, 1 = fully ECHO
  public timeDilation: number = 1.0; // Slow-mo multiplier
  public glitchIntensity: number = 0.0;

  // Scene elements for transition
  private scene: THREE.Scene;
  private listeners: Set<TimelineListener> = new Set();
  private transitionDuration: number = 0.5; // seconds
  private slowMoTimer: number = 0;
  private distortionParticles: THREE.Points | null = null;
  private particlePositions: Float32Array | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setupShiftParticles();
  }

  private setupShiftParticles() {
    const count = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      // Cyan to Gold
      colors[i * 3] = 0.2 + Math.random() * 0.8;
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.9;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.25,
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
    this.timeDilation = 0.2; // Slow time
    this.slowMoTimer = 0.25;
    this.glitchIntensity = 1.0;

    // Center shift particles around player
    if (playerPosition && this.distortionParticles) {
      this.distortionParticles.position.copy(playerPosition);
      this.distortionParticles.position.y += 1.0;
    }

    soundManager.switchTimeline(this.targetTimeline);
    return true;
  }

  public update(delta: number) {
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
        mat.opacity = Math.sin(this.transitionProgress * Math.PI) * 0.9;
        this.distortionParticles.rotation.y += delta * 4.0;
      }

      // Glitch intensity fades out
      this.glitchIntensity = Math.sin(this.transitionProgress * Math.PI);

      this.notifyListeners();
    } else {
      if (this.distortionParticles) {
        (this.distortionParticles.material as THREE.PointsMaterial).opacity = 0;
      }
      this.glitchIntensity = 0;
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
}
