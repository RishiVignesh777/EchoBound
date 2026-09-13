import * as THREE from 'three';
import { WeatherType } from '../types';

export class DynamicWeatherManager {
  public currentWeather: WeatherType = WeatherType.SNOW;
  public timeOfDay: number = 0.8; // 0.0 to 1.0 (0.2 dawn, 0.5 noon, 0.8 dusk/night)
  private rainSystem: THREE.Points | null = null;
  private rainPositions: Float32Array | null = null;
  private scene: THREE.Scene;
  private stormFlashTimer: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setupRainSystem();
  }

  private setupRainSystem() {
    const rainCount = 1800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.rainSystem = new THREE.Points(geo, mat);
    this.rainPositions = positions;
    this.scene.add(this.rainSystem);
  }

  public setWeather(type: WeatherType) {
    this.currentWeather = type;
    if (!this.rainSystem) return;

    const mat = this.rainSystem.material as THREE.PointsMaterial;
    if (type === WeatherType.RAIN) {
      mat.opacity = 0.65;
      mat.color.setHex(0x93c5fd);
    } else if (type === WeatherType.HEAVY_RAIN) {
      mat.opacity = 0.9;
      mat.color.setHex(0x60a5fa);
    } else if (type === WeatherType.TIMELINE_STORM) {
      mat.opacity = 0.85;
      mat.color.setHex(0xc084fc); // Purple lightning storm rain
    } else {
      mat.opacity = 0.0;
    }
  }

  public cycleWeather(): WeatherType {
    const types = [
      WeatherType.SNOW,
      WeatherType.CLEAR,
      WeatherType.RAIN,
      WeatherType.FOG,
      WeatherType.TIMELINE_STORM,
    ];
    const currentIndex = types.indexOf(this.currentWeather);
    const nextType = types[(currentIndex + 1) % types.length];
    this.setWeather(nextType);
    return nextType;
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    ambientLight: THREE.AmbientLight,
    dirLight: THREE.DirectionalLight,
    fog: THREE.FogExp2
  ) {
    // 1. Update rain simulation if active
    if (this.rainSystem && this.rainPositions) {
      const isRaining =
        this.currentWeather === WeatherType.RAIN ||
        this.currentWeather === WeatherType.HEAVY_RAIN ||
        this.currentWeather === WeatherType.TIMELINE_STORM;

      if (isRaining) {
        const speed = this.currentWeather === WeatherType.HEAVY_RAIN ? 36 : 26;
        for (let i = 0; i < this.rainPositions.length / 3; i++) {
          const idx = i * 3;
          this.rainPositions[idx + 1] -= delta * speed;
          this.rainPositions[idx] -= delta * 3; // Slanted rain

          if (this.rainPositions[idx + 1] < 0.1) {
            this.rainPositions[idx + 1] = 30 + Math.random() * 5;
            this.rainPositions[idx] = playerPos.x + (Math.random() - 0.5) * 60;
            this.rainPositions[idx + 2] = playerPos.z + (Math.random() - 0.5) * 60;
          }
        }
        this.rainSystem.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 2. Timeline Storm electrical flashes
    if (this.currentWeather === WeatherType.TIMELINE_STORM) {
      this.stormFlashTimer -= delta;
      if (this.stormFlashTimer <= 0) {
        this.stormFlashTimer = 3.0 + Math.random() * 4.0;
        ambientLight.intensity = 2.5; // Lightning flash
        setTimeout(() => {
          ambientLight.intensity = 0.8;
        }, 80);
      }
    }

    // 3. Fog adjustments based on weather
    if (this.currentWeather === WeatherType.FOG) {
      fog.density = 0.035;
    } else if (this.currentWeather === WeatherType.TIMELINE_STORM) {
      fog.density = 0.024;
    } else {
      fog.density = 0.016;
    }
  }
}
