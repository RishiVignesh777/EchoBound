export type Timeline = 'PRESENT' | 'ECHO';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  echoEnergy: number;
  maxEchoEnergy: number;
  echoShards: number;
  bladeDamage: number;
  level: number;
}

export type PlayerAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'sprint'
  | 'jump'
  | 'fall'
  | 'dodge'
  | 'attack1'
  | 'attack2'
  | 'attack3'
  | 'heavyAttack'
  | 'block'
  | 'parry'
  | 'echoStrike'
  | 'timeBreak'
  | 'realitySlash'
  | 'hit'
  | 'dead'
  | 'interact';

export interface EnemyData {
  id: string;
  name: string;
  type: 'lurker' | 'sentinel' | 'stalker' | 'chrono_knight' | 'architect';
  health: number;
  maxHealth: number;
  timeline: Timeline | 'both';
  isBoss: boolean;
  position: [number, number, number];
  isAggro: boolean;
  state: 'IDLE' | 'PATROL' | 'CHASE' | 'ATTACK' | 'STAGGER' | 'RETURN' | 'DEAD';
}

export interface MemoryShard {
  id: string;
  title: string;
  region: string;
  date: string;
  excerpt: string;
  collected: boolean;
  position: [number, number, number];
  timeline: Timeline;
}

export interface PuzzleState {
  id: string;
  title: string;
  region: string;
  solved: boolean;
  hint: string;
  timelineRequired: Timeline;
  currentStep: number;
  totalSteps: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  brightness: number;
  mouseSensitivity: number;
  cameraDistance: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  lockOnEnabled: boolean;
}

export interface SkillUpgrade {
  id: string;
  name: string;
  category: 'ECHO' | 'COMBAT' | 'MOBILITY';
  description: string;
  cost: number;
  unlocked: boolean;
  iconName: string;
}

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  opacity: number;
}

export interface GameNotification {
  id: string;
  title: string;
  message: string;
  type: 'lore' | 'quest' | 'ability' | 'shift' | 'boss';
  timestamp: number;
}
