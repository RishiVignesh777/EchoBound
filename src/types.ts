export type Timeline = 'PRESENT' | 'ECHO';

export type DifficultyMode = 'STORY' | 'NORMAL' | 'NIGHTMARE' | 'story' | 'adventure' | 'nightmare' | 'EASY' | 'HARD';

export enum WeatherType {
  CLEAR = 'clear',
  RAIN = 'rain',
  HEAVY_RAIN = 'heavy_rain',
  FOG = 'fog',
  SNOW = 'snow',
  TIMELINE_STORM = 'timeline_storm',
}

export enum GameEnding {
  RESTORE_ECHO = 'RESTORE_ECHO',
  ACCEPT_PRESENT = 'ACCEPT_PRESENT',
  FUSE_TIMELINES = 'FUSE_TIMELINES',
  THE_PRESENT = 'ACCEPT_PRESENT',
  THE_ECHO = 'RESTORE_ECHO',
  THE_BALANCE = 'FUSE_TIMELINES',
  PRESENT = 'ACCEPT_PRESENT',
  ECHO = 'RESTORE_ECHO',
  BALANCE = 'FUSE_TIMELINES',
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  echoEnergy: number;
  maxEchoEnergy: number;
  echoShards: number;
  fracturedCores: number;
  bladeDamage: number;
  level: number;
  maxAnchors: number;
}

export type PlayerAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'sprint'
  | 'jump'
  | 'fall'
  | 'dodge'
  | 'climb'
  | 'vault'
  | 'slide'
  | 'wallJump'
  | 'attack1'
  | 'attack2'
  | 'attack3'
  | 'heavyAttack'
  | 'block'
  | 'parry'
  | 'echoCounter'
  | 'realityBreak'
  | 'finisher'
  | 'echoStrike'
  | 'timeBreak'
  | 'realitySlash'
  | 'hit'
  | 'dead'
  | 'interact';

export interface EnemyData {
  id: string;
  name: string;
  type:
    | 'lurker'
    | 'sentinel'
    | 'stalker'
    | 'chrono_knight'
    | 'architect'
    | 'fractured_knight'
    | 'echo_stalker'
    | 'void_crawler'
    | 'chrono_sentinel'
    | 'reality_devourer'
    | 'drowned_guardian'
    | 'clockmaker'
    | 'hollow_warden'
    | 'timelord';
  health: number;
  maxHealth: number;
  timeline: Timeline | 'both';
  isBoss: boolean;
  isMiniBoss?: boolean;
  position: [number, number, number];
  isAggro: boolean;
  state: 'IDLE' | 'PATROL' | 'CHASE' | 'ATTACK' | 'STAGGER' | 'RETURN' | 'DEAD';
  phase?: number;
  vulnerableToFinisher?: boolean;
}

export interface EchoAnchorObject {
  id: string;
  name: string;
  position: [number, number, number];
  anchoredTimeline: Timeline;
  active: boolean;
  duration: number; // seconds remaining
  maxDuration: number;
}

export interface EchoVisionState {
  active: boolean;
  meter: number; // 0 to 100
  maxMeter: number;
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

export interface EchoRelic {
  id: string;
  name: string;
  region?: string;
  lore?: string;
  era?: string;
  description?: string;
  passiveBonus?: string;
  visualEffect?: string;
  collected?: boolean;
  position?: [number, number, number];
}

export interface FracturedCore {
  id: string;
  name: string;
  region?: string;
  location?: string;
  powerGranted?: string;
  lore?: string;
  collected: boolean;
  position?: [number, number, number];
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
  requiresAnchor?: boolean;
  requiresVision?: boolean;
}

export interface WeaponItem {
  id: string;
  name: string;
  damageBonus: number;
  speedBonus: number;
  description: string;
  unlocked: boolean;
  bladeColor: string;
}

export interface ArmorItem {
  id: string;
  name: string;
  defenseBonus: number;
  staminaBonus: number;
  description: string;
  unlocked: boolean;
  cloakColor: string;
}

export interface SideQuest {
  id: string;
  title: string;
  giver?: string;
  giverNpcId?: string;
  region?: string;
  description: string;
  currentStep?: number;
  totalSteps?: number;
  progress?: number;
  maxProgress?: number;
  objective?: string;
  reward?: string;
  steps?: string[];
  completed: boolean;
  rewardShards?: number;
  rewardCore?: string;
}

export interface NPCData {
  id: string;
  name: string;
  title?: string;
  role?: string;
  region?: string;
  timeline: Timeline | 'both';
  position: [number, number, number];
  dialogue?: string[];
  currentDialogue?: string;
  dialogueTree?: string[];
  questId?: string;
}

export interface SecretArea {
  id: string;
  name: string;
  region: string;
  description?: string;
  discovered: boolean;
  position: [number, number, number];
  loreFragment?: string;
  loreText?: string;
}

export interface FastTravelPoint {
  id: string;
  name: string;
  region: string;
  position: [number, number, number];
  unlocked: boolean;
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
  difficulty: DifficultyMode;
  motionBlur: boolean;
  screenShake: boolean;
  subtitles: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  colorFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface SkillUpgrade {
  id: string;
  name: string;
  category: 'ECHO' | 'BLADE' | 'WANDERER';
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
  type: 'lore' | 'quest' | 'ability' | 'shift' | 'boss' | 'relic';
  timestamp: number;
}

export interface GameSaveData {
  slot: number;
  timestamp: number;
  playtime: number;
  region: string;
  stats: PlayerStats;
  difficulty: DifficultyMode;
  isNewGamePlus: boolean;
  collectedShards: string[];
  collectedRelics: string[];
  collectedCores: string[];
  completedQuests: string[];
  discoveredSecrets: string[];
  unlockedWaypoints: string[];
  equippedWeaponId: string;
  equippedArmorId: string;
  unlockedSkills: string[];
}
