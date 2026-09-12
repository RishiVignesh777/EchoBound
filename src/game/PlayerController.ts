import * as THREE from 'three';
import { PlayerAction, PlayerStats } from '../types';
import { soundManager } from '../audio/SoundManager';

export interface CameraSettings {
  distance: number;
  height: number;
  sensitivity: number;
}

export class PlayerController {
  public mesh: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public rotation: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  public facingAngle: number = 0;

  // Character body parts for procedural animation
  private bodyGroup: THREE.Group;
  private head: THREE.Mesh;
  private hood: THREE.Mesh;
  private torso: THREE.Mesh;
  private cloak: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private echoBlade: THREE.Group;
  private bladeGlowMesh: THREE.Mesh;
  private runeMaterial: THREE.MeshStandardMaterial;

  // States & stats
  public stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    echoEnergy: 100,
    maxEchoEnergy: 100,
    echoShards: 0,
    bladeDamage: 25,
    level: 1,
  };

  public currentAction: PlayerAction = 'idle';
  public isGrounded: boolean = true;
  public isInvulnerable: boolean = false;
  public isBlocking: boolean = false;
  public isParrying: boolean = false;
  private parryWindow: number = 0;
  private actionTimer: number = 0;
  private comboStep: number = 0;
  private comboResetTimer: number = 0;
  private footstepTimer: number = 0;
  private animTime: number = 0;

  // Camera controls
  public camera: THREE.PerspectiveCamera;
  public cameraAngles = { yaw: 0, pitch: 0.25 };
  public cameraDistance: number = 4.8;
  public cameraTargetDistance: number = 4.8;
  public cameraShake: number = 0;
  public lockOnTarget: THREE.Vector3 | null = null;

  // Movement physics
  private walkSpeed: number = 4.5;
  private runSpeed: number = 8.5;
  private sprintSpeed: number = 12.0;
  private jumpForce: number = 9.5;
  private gravity: number = 26.0;

  // Weapon Trail
  private weaponTrailPoints: THREE.Vector3[] = [];
  private weaponTrailLine: THREE.Line | null = null;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.mesh = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.mesh.add(this.bodyGroup);

    // Build Kael character model procedurally
    const { head, hood, torso, cloak, leftArm, rightArm, leftLeg, rightLeg, echoBlade, bladeGlowMesh, runeMaterial } =
      this.buildCharacterModel();

    this.head = head;
    this.hood = hood;
    this.torso = torso;
    this.cloak = cloak;
    this.leftArm = leftArm;
    this.rightArm = rightArm;
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;
    this.echoBlade = echoBlade;
    this.bladeGlowMesh = bladeGlowMesh;
    this.runeMaterial = runeMaterial;

    this.setupWeaponTrail(scene);
    scene.add(this.mesh);
  }

  private buildCharacterModel() {
    // Materials
    const darkClothMat = new THREE.MeshStandardMaterial({
      color: 0x16171b,
      roughness: 0.85,
      metalness: 0.1,
    });
    const armorMetalMat = new THREE.MeshStandardMaterial({
      color: 0x3a3d45,
      roughness: 0.35,
      metalness: 0.85,
    });
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x2b1e16,
      roughness: 0.7,
      metalness: 0.2,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc8aa93,
      roughness: 0.6,
      metalness: 0.05,
    });
    const runeMaterial = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d4e6,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    });
    const goldEchoMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xfa8500,
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.3,
    });

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.26, 0.85, 8);
    const torso = new THREE.Mesh(torsoGeo, darkClothMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Torso armor plate
    const chestPlateGeo = new THREE.BoxGeometry(0.48, 0.45, 0.3);
    const chestPlate = new THREE.Mesh(chestPlateGeo, armorMetalMat);
    chestPlate.position.set(0, 0.1, 0.08);
    torso.add(chestPlate);

    // Glowing rune on chest plate
    const runeGeo = new THREE.BoxGeometry(0.12, 0.28, 0.02);
    const runeMesh = new THREE.Mesh(runeGeo, runeMaterial);
    runeMesh.position.set(0, 0.1, 0.24);
    torso.add(runeMesh);

    // Leather belt
    const beltGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 8);
    const belt = new THREE.Mesh(beltGeo, leatherMat);
    belt.position.y = -0.32;
    torso.add(belt);

    // 2. Head & Hood
    const headGeo = new THREE.SphereGeometry(0.18, 12, 10);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 0.58;
    torso.add(head);

    // Hood covering head
    const hoodGeo = new THREE.ConeGeometry(0.26, 0.42, 8);
    const hood = new THREE.Mesh(hoodGeo, darkClothMat);
    hood.position.set(0, 0.08, -0.05);
    hood.rotation.x = -0.2;
    head.add(hood);

    // Concealed face shadow / glowing eyes
    const eyeGeo = new THREE.BoxGeometry(0.04, 0.02, 0.02);
    const eyeL = new THREE.Mesh(eyeGeo, runeMaterial);
    const eyeR = new THREE.Mesh(eyeGeo, runeMaterial);
    eyeL.position.set(-0.06, 0.02, 0.16);
    eyeR.position.set(0.06, 0.02, 0.16);
    head.add(eyeL);
    head.add(eyeR);

    // 3. Cloak / Cape attached to shoulders
    const cloakGeo = new THREE.PlaneGeometry(0.7, 1.2, 3, 4);
    const cloak = new THREE.Mesh(cloakGeo, darkClothMat);
    cloak.position.set(0, 0.1, -0.22);
    cloak.rotation.x = 0.15;
    torso.add(cloak);

    // 4. Arms
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8);
    const leftArm = new THREE.Group();
    const rightArm = new THREE.Group();

    leftArm.position.set(-0.42, 0.32, 0);
    rightArm.position.set(0.42, 0.32, 0);

    const leftArmMesh = new THREE.Mesh(armGeo, darkClothMat);
    leftArmMesh.position.y = -0.3;
    leftArm.add(leftArmMesh);

    // Gauntlets
    const gauntletGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.28, 8);
    const leftGauntlet = new THREE.Mesh(gauntletGeo, armorMetalMat);
    leftGauntlet.position.y = -0.4;
    leftArm.add(leftGauntlet);

    const rightArmMesh = new THREE.Mesh(armGeo, darkClothMat);
    rightArmMesh.position.y = -0.3;
    rightArm.add(rightArmMesh);

    const rightGauntlet = new THREE.Mesh(gauntletGeo, armorMetalMat);
    rightGauntlet.position.y = -0.4;
    rightArm.add(rightGauntlet);

    torso.add(leftArm);
    torso.add(rightArm);

    // 5. Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 8);
    const leftLeg = new THREE.Group();
    const rightLeg = new THREE.Group();

    leftLeg.position.set(-0.18, 0.8, 0);
    rightLeg.position.set(0.18, 0.8, 0);

    const leftLegMesh = new THREE.Mesh(legGeo, leatherMat);
    leftLegMesh.position.y = -0.4;
    leftLeg.add(leftLegMesh);

    // Greaves (metal leg guards)
    const greaveGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.45, 8);
    const leftGreave = new THREE.Mesh(greaveGeo, armorMetalMat);
    leftGreave.position.y = -0.45;
    leftLeg.add(leftGreave);

    const rightLegMesh = new THREE.Mesh(legGeo, leatherMat);
    rightLegMesh.position.y = -0.4;
    rightLeg.add(rightLegMesh);

    const rightGreave = new THREE.Mesh(greaveGeo, armorMetalMat);
    rightGreave.position.y = -0.45;
    rightLeg.add(rightGreave);

    this.bodyGroup.add(leftLeg);
    this.bodyGroup.add(rightLeg);

    // 6. Echo Blade Weapon
    const echoBlade = new THREE.Group();
    const hiltGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8);
    const hilt = new THREE.Mesh(hiltGeo, leatherMat);
    hilt.position.y = 0.15;
    echoBlade.add(hilt);

    const crossguardGeo = new THREE.BoxGeometry(0.24, 0.05, 0.08);
    const crossguard = new THREE.Mesh(crossguardGeo, goldEchoMat);
    crossguard.position.y = 0.32;
    echoBlade.add(crossguard);

    const bladeGeo = new THREE.BoxGeometry(0.08, 1.25, 0.02);
    const blade = new THREE.Mesh(bladeGeo, armorMetalMat);
    blade.position.y = 0.95;
    echoBlade.add(blade);

    // Glowing energy fuller / core
    const glowGeo = new THREE.BoxGeometry(0.02, 1.15, 0.025);
    const bladeGlowMesh = new THREE.Mesh(glowGeo, runeMaterial);
    bladeGlowMesh.position.y = 0.95;
    echoBlade.add(bladeGlowMesh);

    // Attach blade to right arm hand by default, or sheathed on back
    rightArm.add(echoBlade);
    echoBlade.position.set(0, -0.48, 0.12);
    echoBlade.rotation.x = Math.PI / 2;

    return {
      head,
      hood,
      torso,
      cloak,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      echoBlade,
      bladeGlowMesh,
      runeMaterial,
    };
  }

  private setupWeaponTrail(scene: THREE.Scene) {
    const maxTrail = 16;
    for (let i = 0; i < maxTrail; i++) {
      this.weaponTrailPoints.push(new THREE.Vector3());
    }
    const trailGeo = new THREE.BufferGeometry().setFromPoints(this.weaponTrailPoints);
    const trailMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.weaponTrailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(this.weaponTrailLine);
  }

  public setRuneTimeline(timeline: 'PRESENT' | 'ECHO') {
    if (timeline === 'ECHO') {
      this.runeMaterial.color.setHex(0xffb703);
      this.runeMaterial.emissive.setHex(0xfb8500);
      if (this.weaponTrailLine) {
        (this.weaponTrailLine.material as THREE.LineBasicMaterial).color.setHex(0xffb703);
      }
    } else {
      this.runeMaterial.color.setHex(0x00f0ff);
      this.runeMaterial.emissive.setHex(0x00d4e6);
      if (this.weaponTrailLine) {
        (this.weaponTrailLine.material as THREE.LineBasicMaterial).color.setHex(0x00f0ff);
      }
    }
  }

  public handleInput(
    keys: { [key: string]: boolean },
    delta: number,
    mouseDelta: { x: number; y: number }
  ) {
    // 1. Update camera look angles
    this.cameraAngles.yaw -= mouseDelta.x * 0.0022;
    this.cameraAngles.pitch = Math.max(-0.4, Math.min(1.1, this.cameraAngles.pitch - mouseDelta.y * 0.0022));

    // 2. Lock-on rotation if target exists
    if (this.lockOnTarget) {
      const dirToTarget = new THREE.Vector3().subVectors(this.lockOnTarget, this.position);
      dirToTarget.y = 0;
      if (dirToTarget.lengthSq() > 0.01) {
        this.cameraAngles.yaw = Math.atan2(-dirToTarget.x, -dirToTarget.z);
      }
    }

    // 3. Check Action state locks (attacking, dodging, parrying, stunned)
    if (this.actionTimer > 0) {
      this.actionTimer -= delta;
      if (this.actionTimer <= 0) {
        if (this.currentAction === 'dodge') {
          this.isInvulnerable = false;
        }
        if (this.currentAction === 'parry') {
          this.isParrying = false;
        }
        this.currentAction = 'idle';
      }
    }

    // Parry window timer
    if (this.parryWindow > 0) {
      this.parryWindow -= delta;
      if (this.parryWindow <= 0) {
        this.isParrying = false;
      }
    }

    // Combo reset timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= delta;
      if (this.comboResetTimer <= 0) {
        this.comboStep = 0;
      }
    }

    // Stamina regeneration
    if (this.currentAction !== 'sprint' && this.currentAction !== 'dodge') {
      this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + 25 * delta);
    }
    // Echo energy slow recovery
    this.stats.echoEnergy = Math.min(this.stats.maxEchoEnergy, this.stats.echoEnergy + 6 * delta);

    // Can we perform movement?
    const isBusy =
      this.currentAction === 'attack1' ||
      this.currentAction === 'attack2' ||
      this.currentAction === 'attack3' ||
      this.currentAction === 'heavyAttack' ||
      this.currentAction === 'echoStrike' ||
      this.currentAction === 'timeBreak' ||
      this.currentAction === 'realitySlash' ||
      this.currentAction === 'hit' ||
      this.currentAction === 'dead';

    // 4. Movement vectors relative to camera
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngles.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngles.yaw);

    let moveX = 0;
    let moveZ = 0;
    if (keys['KeyW'] || keys['ArrowUp']) moveZ += 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveZ -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;

    const isMoving = (moveX !== 0 || moveZ !== 0) && !isBusy;
    let targetSpeed = 0;

    if (isMoving) {
      const isSprinting = (keys['ShiftLeft'] || keys['ShiftRight']) && this.stats.stamina > 10;
      targetSpeed = isSprinting ? this.sprintSpeed : this.runSpeed;

      if (isSprinting) {
        this.stats.stamina = Math.max(0, this.stats.stamina - 20 * delta);
      }

      // Calculate direction
      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, moveZ)
        .addScaledVector(right, moveX)
        .normalize();

      this.velocity.x = moveDir.x * targetSpeed;
      this.velocity.z = moveDir.z * targetSpeed;

      // Face movement direction smoothly
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      let angleDiff = targetAngle - this.facingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.facingAngle += angleDiff * Math.min(1.0, 14 * delta);

      if (this.currentAction === 'idle' || this.currentAction === 'walk' || this.currentAction === 'run' || this.currentAction === 'sprint') {
        this.currentAction = isSprinting ? 'sprint' : 'run';
      }

      // Footstep audio
      this.footstepTimer -= delta;
      if (this.footstepTimer <= 0 && this.isGrounded) {
        soundManager.playFootstep();
        this.footstepTimer = isSprinting ? 0.28 : 0.42;
      }
    } else if (!isBusy) {
      // Friction decelerate
      this.velocity.x *= Math.max(0, 1 - 16 * delta);
      this.velocity.z *= Math.max(0, 1 - 16 * delta);
      if (this.currentAction === 'run' || this.currentAction === 'sprint' || this.currentAction === 'walk') {
        this.currentAction = 'idle';
      }
    }

    // 5. Jump
    if (keys['Space'] && this.isGrounded && !isBusy && this.stats.stamina >= 12) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.currentAction = 'jump';
      this.stats.stamina -= 12;
      soundManager.playDodge();
    }

    // 6. Dodge Roll
    if ((keys['KeyC'] || (keys['ShiftLeft'] && !isMoving)) && this.isGrounded && this.currentAction !== 'dodge' && this.stats.stamina >= 22) {
      this.startDodge();
    }

    // Apply gravity
    this.velocity.y -= this.gravity * delta;

    // Apply movement
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Ground plane clamp (fallback if no terrain raycast hit)
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
      if (this.currentAction === 'jump' || this.currentAction === 'fall') {
        this.currentAction = 'idle';
      }
    }

    // Update mesh position and rotation
    this.mesh.position.copy(this.position);
    this.bodyGroup.rotation.y = this.facingAngle;

    // Animate procedural skeleton
    this.updateProceduralAnimations(delta, isMoving, targetSpeed);

    // Update 3rd person camera position
    this.updateCamera(delta);
  }

  public startDodge() {
    this.currentAction = 'dodge';
    this.isInvulnerable = true;
    this.actionTimer = 0.45;
    this.stats.stamina -= 22;
    soundManager.playDodge();

    // Thrust player forward or in facing direction
    const forwardX = Math.sin(this.facingAngle);
    const forwardZ = Math.cos(this.facingAngle);
    this.velocity.x = forwardX * 16.0;
    this.velocity.z = forwardZ * 16.0;
  }

  public performLightAttack(): boolean {
    if (this.actionTimer > 0 && this.currentAction !== 'idle' && this.currentAction !== 'run') return false;
    if (this.stats.stamina < 15) return false;

    this.stats.stamina -= 15;
    this.comboStep = (this.comboStep % 3) + 1;
    this.comboResetTimer = 1.0;

    if (this.comboStep === 1) {
      this.currentAction = 'attack1';
      this.actionTimer = 0.32;
    } else if (this.comboStep === 2) {
      this.currentAction = 'attack2';
      this.actionTimer = 0.34;
    } else {
      this.currentAction = 'attack3';
      this.actionTimer = 0.42;
    }

    soundManager.playSwordSwing(false);
    this.triggerWeaponTrail();
    this.cameraShake = 0.12;
    return true;
  }

  public performHeavyAttack(): boolean {
    if (this.actionTimer > 0 && this.currentAction !== 'idle' && this.currentAction !== 'run') return false;
    if (this.stats.stamina < 30) return false;

    this.stats.stamina -= 30;
    this.currentAction = 'heavyAttack';
    this.actionTimer = 0.65;
    soundManager.playSwordSwing(true);
    this.triggerWeaponTrail();
    this.cameraShake = 0.28;
    return true;
  }

  public startBlock() {
    if (this.currentAction === 'idle' || this.currentAction === 'run') {
      this.isBlocking = true;
      this.currentAction = 'block';
      this.parryWindow = 0.22; // Perfect parry window
      this.isParrying = true;
    }
  }

  public stopBlock() {
    this.isBlocking = false;
    this.isParrying = false;
    if (this.currentAction === 'block') {
      this.currentAction = 'idle';
    }
  }

  public triggerEchoStrike(): boolean {
    if (this.stats.echoEnergy < 35 || this.actionTimer > 0) return false;
    this.stats.echoEnergy -= 35;
    this.currentAction = 'echoStrike';
    this.actionTimer = 0.55;
    this.isInvulnerable = true;

    // Warp dash forward
    const forwardX = Math.sin(this.facingAngle);
    const forwardZ = Math.cos(this.facingAngle);
    this.velocity.x = forwardX * 24.0;
    this.velocity.z = forwardZ * 24.0;

    soundManager.playAbilitySound('echoStrike');
    this.cameraShake = 0.35;
    return true;
  }

  public triggerTimeBreak(): boolean {
    if (this.stats.echoEnergy < 45 || this.actionTimer > 0) return false;
    this.stats.echoEnergy -= 45;
    this.currentAction = 'timeBreak';
    this.actionTimer = 0.6;

    soundManager.playAbilitySound('timeBreak');
    this.cameraShake = 0.2;
    return true;
  }

  public triggerRealitySlash(): boolean {
    if (this.stats.echoEnergy < 40 || this.actionTimer > 0) return false;
    this.stats.echoEnergy -= 40;
    this.currentAction = 'realitySlash';
    this.actionTimer = 0.5;

    soundManager.playAbilitySound('realitySlash');
    this.cameraShake = 0.3;
    return true;
  }

  public takeDamage(amount: number): { dead: boolean; parried: boolean; blocked: boolean } {
    if (this.isInvulnerable) return { dead: false, parried: false, blocked: false };

    if (this.isParrying) {
      soundManager.playParryClash();
      this.cameraShake = 0.3;
      this.stats.echoEnergy = Math.min(this.stats.maxEchoEnergy, this.stats.echoEnergy + 30);
      return { dead: false, parried: true, blocked: false };
    }

    if (this.isBlocking && this.stats.stamina >= 15) {
      this.stats.stamina -= 15;
      soundManager.playHitImpact(false);
      this.cameraShake = 0.15;
      this.stats.health = Math.max(0, this.stats.health - amount * 0.25);
      return { dead: this.stats.health <= 0, parried: false, blocked: true };
    }

    // Direct Hit
    this.stats.health = Math.max(0, this.stats.health - amount);
    soundManager.playHitImpact(true);
    this.cameraShake = 0.38;

    if (this.stats.health <= 0) {
      this.currentAction = 'dead';
      return { dead: true, parried: false, blocked: false };
    }

    this.currentAction = 'hit';
    this.actionTimer = 0.28;
    return { dead: false, parried: false, blocked: false };
  }

  public heal(amount: number) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  private triggerWeaponTrail() {
    if (this.weaponTrailLine) {
      (this.weaponTrailLine.material as THREE.LineBasicMaterial).opacity = 0.85;
    }
  }

  private updateProceduralAnimations(delta: number, isMoving: boolean, speed: number) {
    this.animTime += delta * (isMoving ? speed * 1.5 : 2.0);

    // Reset base rotations
    this.cloak.rotation.x = 0.15 + (isMoving ? 0.35 : 0.05) * Math.sin(this.animTime * 1.2);
    this.cloak.rotation.z = Math.sin(this.animTime * 0.7) * 0.05;

    if (this.currentAction === 'idle') {
      const breath = Math.sin(this.animTime * 1.5) * 0.03;
      this.torso.position.y = 1.25 + breath;
      this.leftArm.rotation.x = Math.sin(this.animTime * 1.5) * 0.05;
      this.rightArm.rotation.x = -Math.sin(this.animTime * 1.5) * 0.05;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.echoBlade.position.set(0, -0.48, 0.12);
      this.echoBlade.rotation.set(Math.PI / 2, 0, 0);
    } else if (this.currentAction === 'run' || this.currentAction === 'sprint') {
      const stride = Math.sin(this.animTime);
      this.leftLeg.rotation.x = stride * 0.65;
      this.rightLeg.rotation.x = -stride * 0.65;
      this.leftArm.rotation.x = -stride * 0.5;
      this.rightArm.rotation.x = stride * 0.5;
      this.torso.position.y = 1.25 + Math.abs(Math.sin(this.animTime * 2)) * 0.08;
    } else if (this.currentAction === 'dodge') {
      // Barrel roll / forward dive
      const rollProgress = 1.0 - this.actionTimer / 0.45;
      this.bodyGroup.rotation.x = rollProgress * Math.PI * 2;
      this.torso.position.y = 0.6 + Math.sin(rollProgress * Math.PI) * 0.4;
    } else if (this.currentAction === 'attack1') {
      // Horizontal right-to-left slash
      const p = 1.0 - this.actionTimer / 0.32;
      this.rightArm.rotation.x = -0.3;
      this.rightArm.rotation.y = -1.5 + p * 3.0;
      this.bodyGroup.rotation.y = this.facingAngle + (p - 0.5) * 0.8;
    } else if (this.currentAction === 'attack2') {
      // Left-to-right cross slice
      const p = 1.0 - this.actionTimer / 0.34;
      this.rightArm.rotation.x = -0.5;
      this.rightArm.rotation.y = 1.5 - p * 3.0;
      this.bodyGroup.rotation.y = this.facingAngle - (p - 0.5) * 0.8;
    } else if (this.currentAction === 'attack3') {
      // Thrust & forward impale
      const p = 1.0 - this.actionTimer / 0.42;
      this.rightArm.rotation.x = -Math.PI / 2;
      this.rightArm.position.z = Math.sin(p * Math.PI) * 0.4;
    } else if (this.currentAction === 'heavyAttack') {
      // 360 spin overhead slam
      const p = 1.0 - this.actionTimer / 0.65;
      this.bodyGroup.rotation.y = this.facingAngle + p * Math.PI * 2;
      this.rightArm.rotation.x = -Math.PI + p * Math.PI;
    } else if (this.currentAction === 'block') {
      // Defensive guard
      this.rightArm.rotation.x = -1.2;
      this.rightArm.rotation.y = 0.6;
      this.leftArm.rotation.x = -1.0;
      this.leftArm.rotation.y = -0.4;
    } else if (this.currentAction === 'hit') {
      this.bodyGroup.rotation.x = -0.35;
      this.torso.position.y = 1.15;
    }

    // Decay weapon trail
    if (this.weaponTrailLine) {
      const mat = this.weaponTrailLine.material as THREE.LineBasicMaterial;
      mat.opacity = Math.max(0, mat.opacity - delta * 2.5);

      // Track tip of weapon
      const bladeTipWorld = new THREE.Vector3();
      this.bladeGlowMesh.getWorldPosition(bladeTipWorld);
      this.weaponTrailPoints.pop();
      this.weaponTrailPoints.unshift(bladeTipWorld);
      this.weaponTrailLine.geometry.setFromPoints(this.weaponTrailPoints);
    }
  }

  private updateCamera(delta: number) {
    // Camera shake decay
    let shakeOffset = new THREE.Vector3();
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - delta * 1.5);
      shakeOffset.set(
        (Math.random() - 0.5) * this.cameraShake,
        (Math.random() - 0.5) * this.cameraShake,
        (Math.random() - 0.5) * this.cameraShake
      );
    }

    // Smooth camera distance interpolation
    this.cameraDistance += (this.cameraTargetDistance - this.cameraDistance) * Math.min(1.0, 8 * delta);

    // Calculate orbit position behind Kael
    const lookTarget = this.position.clone().add(new THREE.Vector3(0, 1.45, 0));
    const sinYaw = Math.sin(this.cameraAngles.yaw);
    const cosYaw = Math.cos(this.cameraAngles.yaw);
    const sinPitch = Math.sin(this.cameraAngles.pitch);
    const cosPitch = Math.cos(this.cameraAngles.pitch);

    const camOffset = new THREE.Vector3(
      sinYaw * cosPitch * this.cameraDistance,
      sinPitch * this.cameraDistance + 0.5,
      cosYaw * cosPitch * this.cameraDistance
    );

    const desiredCamPos = lookTarget.clone().add(camOffset).add(shakeOffset);

    // Prevent clipping below floor
    if (desiredCamPos.y < 0.3) desiredCamPos.y = 0.3;

    // Smooth follow
    this.camera.position.lerp(desiredCamPos, Math.min(1.0, 12 * delta));
    this.camera.lookAt(lookTarget);
  }
}
