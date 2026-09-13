import * as THREE from 'three';
import {
  SideQuest,
  NPCData,
  SecretArea,
  FastTravelPoint,
  FracturedCore,
  EchoRelic,
  GameEnding,
} from '../types';
import { soundManager } from '../audio/SoundManager';

export class QuestManager {
  public quests: SideQuest[] = [
    {
      id: 'quest_lost_signal',
      title: 'The Lost Signal',
      description: 'Find Dr. Sarah Vance’s transmission logs scattered in the Abyssal Metropolis ruins.',
      reward: '50 Echo Shards, Chrono Capacitor',
      completed: false,
      progress: 0,
      maxProgress: 3,
      objective: 'Locate 3 research logs in Abyssal Metropolis [0/3]',
      giverNpcId: 'npc_vance',
    },
    {
      id: 'quest_clockwork_heart',
      title: 'The Clockwork Heart',
      description: 'Anchor the Cathedral mechanism in Echo to align the gear trains in the Present.',
      reward: '80 Echo Shards, Blade Upgrade Tier 2',
      completed: false,
      progress: 0,
      maxProgress: 1,
      objective: 'Use Echo Anchor on the Cathedral gear hub [0/1]',
      giverNpcId: 'npc_kenneth',
    },
    {
      id: 'quest_fragments_past',
      title: 'Fragments of the Past',
      description: 'Collect sunken memory crystals submerged in the toxic waters of Sunken District.',
      reward: '60 Echo Shards, Increased Stamina +20',
      completed: false,
      progress: 0,
      maxProgress: 3,
      objective: 'Gather 3 Sunken Crystals [0/3]',
      giverNpcId: 'npc_vane',
    },
    {
      id: 'quest_ghosts_forest',
      title: 'Ghosts of the Forest',
      description: 'Eliminate the Timeline Stalkers warping the fabric of Crimson Forest.',
      reward: '100 Echo Shards, Phantom Cloak Cosmetic',
      completed: false,
      progress: 0,
      maxProgress: 2,
      objective: 'Defeat 2 Timeline Stalkers in the forest [0/2]',
      giverNpcId: 'npc_thorne',
    },
    {
      id: 'quest_project_chronos',
      title: 'Project Chronos Origin',
      description: 'Uncover the secret research facility where Kael’s temporal resonance was created.',
      reward: 'Fractured Core: Alpha, Reality Break DMG +30%',
      completed: false,
      progress: 0,
      maxProgress: 1,
      objective: 'Discover the Forgotten Laboratory hidden alcove [0/1]',
      giverNpcId: 'npc_traveler',
    },
    {
      id: 'quest_master_reality',
      title: 'Master of Reality',
      description: 'Defeat all regional mini-bosses to unlock the Abyssal Metropolis Core gate.',
      reward: 'Chrono Champion Cloak, Access to The Timelord',
      completed: false,
      progress: 0,
      maxProgress: 3,
      objective: 'Defeat Drowned Guardian, Clockmaker, and Hollow Warden [0/3]',
      giverNpcId: 'npc_aurelia',
    },
  ];

  public npcs: NPCData[] = [
    {
      id: 'npc_vance',
      name: 'Dr. Sarah Vance',
      role: 'Lead Chrono-Physicist',
      timeline: 'ECHO',
      position: [-10, 0, -360],
      currentDialogue: 'Kael! The temporal resonance field is collapsing. The Abyssal Core is leaking into the future. Please find my logs in the ruins!',
      dialogueTree: [
        'Kael! The temporal resonance field is collapsing. The Abyssal Core is leaking into the future. Please find my logs in the ruins!',
        'Project Chronos was supposed to harvest infinite energy from time loops. But the fracture severed causality itself.',
        'Use your Echo Anchor to freeze unstable structures across both timelines before the collapse swallows everything!',
      ],
      questId: 'quest_lost_signal',
    },
    {
      id: 'npc_kenneth',
      name: 'Archivist Kenneth',
      role: 'Cathedral Scholar',
      timeline: 'PRESENT',
      position: [12, 0, -180],
      currentDialogue: 'The Cathedral bells have ceased tolling for a century. In the Echo, their resonance once held the fracture at bay.',
      dialogueTree: [
        'The Cathedral bells have ceased tolling for a century. In the Echo, their resonance once held the fracture at bay.',
        'If you anchor the main gear assembly while in the Echo, its temporal frequency will synchronize both eras!',
      ],
      questId: 'quest_clockwork_heart',
    },
    {
      id: 'npc_vane',
      name: 'Engineer Vane',
      role: 'Monorail Mechanic',
      timeline: 'ECHO',
      position: [14, 12, -355],
      currentDialogue: 'The magnetic transit line to the Core is still powered here in the Echo. But in your future, it is completely shattered.',
      dialogueTree: [
        'The magnetic transit line to the Core is still powered here in the Echo. But in your future, it is completely shattered.',
        'Watch out for the void anomalies below the viaduct. They eat through steel like acid.',
      ],
      questId: 'quest_fragments_past',
    },
    {
      id: 'npc_thorne',
      name: 'Ranger Thorne',
      role: 'Forest Guide',
      timeline: 'PRESENT',
      position: [-14, 0, -115],
      currentDialogue: 'The Crimson Forest whispers with shadows that don’t belong to either era. Void crawlers are hunting anything that moves.',
      dialogueTree: [
        'The Crimson Forest whispers with shadows that don’t belong to either era. Void crawlers are hunting anything that moves.',
        'Use your Echo Vision to spot their dimensional ripples before they ambush you from the mist!',
      ],
      questId: 'quest_ghosts_forest',
    },
    {
      id: 'npc_aurelia',
      name: 'Aurelia',
      role: 'Temporal Merchant',
      timeline: 'ECHO',
      position: [0, 0, -16],
      currentDialogue: 'Greetings, traveler. I trade rare temporal minerals for Echo Shards. Keep your blade sharp and your mind anchored.',
      dialogueTree: [
        'Greetings, traveler. I trade rare temporal minerals for Echo Shards. Keep your blade sharp and your mind anchored.',
        'The three ancient guardians hold the keys to the deepest sector of the Abyssal Metropolis. Seek them out!',
      ],
      questId: 'quest_master_reality',
    },
    {
      id: 'npc_traveler',
      name: 'The Mysterious Traveler',
      role: 'Wanderer of Time',
      timeline: 'both',
      position: [6, 0, -325],
      currentDialogue: 'You do not remember, do you, Kael? You were not merely an explorer who stumbled into the fracture. You were its first anchor.',
      dialogueTree: [
        'You do not remember, do you, Kael? You were not merely an explorer who stumbled into the fracture. You were its first anchor.',
        'There are 5 Fractured Cores hidden across Veyra. Only with all five can you prevent the world from tearing apart forever.',
      ],
      questId: 'quest_project_chronos',
    },
  ];

  public secretAreas: SecretArea[] = [
    {
      id: 'secret_lab',
      name: 'The Forgotten Laboratory',
      region: 'Forgotten City Alcove',
      position: [-28, 0, -45],
      discovered: false,
      loreText: 'Classified archives detailing the initial test phase of Project Chronos in 2042.',
    },
    {
      id: 'secret_archive',
      name: 'The Underground Archive',
      region: 'Sunken District Sub-Level',
      position: [26, 0, -95],
      discovered: false,
      loreText: 'Pristine digital cylinders containing historical records of Veyra before the Great Rupture.',
    },
    {
      id: 'secret_observatory',
      name: 'The Dead Observatory Crypt',
      region: 'Clockwork Under-Chamber',
      position: [-32, 0, -170],
      discovered: false,
      loreText: 'Astronomical logs recording spatial distortions that preceded the temporal split.',
    },
    {
      id: 'secret_mirror',
      name: 'The Mirror District',
      region: 'Grand Observatory Overlook',
      position: [30, 0, -255],
      discovered: false,
      loreText: 'A secluded sanctuary where Present and Echo overlap without any dimensional barrier.',
    },
    {
      id: 'secret_chamber',
      name: 'The First Echo Chamber',
      region: 'Abyssal Metropolis Sub-Core',
      position: [0, 0, -490],
      discovered: false,
      loreText: 'The epicenter of Project Chronos. Kael’s stasis pod stands open, bearing his name and barcode.',
    },
  ];

  public fastTravelPoints: FastTravelPoint[] = [
    {
      id: 'ft_city',
      name: 'Forgotten City Colonnade',
      region: 'Forgotten City',
      position: [0, 0, -5],
      unlocked: true,
    },
    {
      id: 'ft_sunken',
      name: 'Sunken District Canal',
      region: 'Sunken District',
      position: [0, 0, -65],
      unlocked: true,
    },
    {
      id: 'ft_cathedral',
      name: 'Clockwork Cathedral Plaza',
      region: 'Clockwork Cathedral',
      position: [0, 0, -160],
      unlocked: false,
    },
    {
      id: 'ft_forest',
      name: 'Crimson Forest Clearing',
      region: 'Crimson Forest',
      position: [0, 0, -120],
      unlocked: false,
    },
    {
      id: 'ft_observatory',
      name: 'Grand Observatory Ascent',
      region: 'Grand Observatory',
      position: [0, 0, -280],
      unlocked: false,
    },
    {
      id: 'ft_metropolis',
      name: 'Abyssal Metropolis Boulevard',
      region: 'The Abyssal Metropolis',
      position: [0, 0, -360],
      unlocked: false,
    },
  ];

  public fracturedCores: FracturedCore[] = [
    {
      id: 'core_alpha',
      name: 'Fractured Core: Alpha',
      location: 'The Forgotten Laboratory',
      collected: false,
      lore: 'The initial spark of artificial timeline synthesis.',
    },
    {
      id: 'core_beta',
      name: 'Fractured Core: Beta',
      location: 'The Underground Archive',
      collected: false,
      lore: 'Stabilized causal crystal used in cathedral chronometers.',
    },
    {
      id: 'core_gamma',
      name: 'Fractured Core: Gamma',
      location: 'Crimson Forest Glade',
      collected: false,
      lore: 'Living temporal sap crystallized during the Rupture.',
    },
    {
      id: 'core_delta',
      name: 'Fractured Core: Delta',
      location: 'Grand Observatory Spire',
      collected: false,
      lore: 'Starlight refracted through a one-hundred-year lens.',
    },
    {
      id: 'core_omega',
      name: 'Fractured Core: Omega',
      location: 'Abyssal Metropolis Sub-Core',
      collected: false,
      lore: 'The harmonic balance node capable of merging both eras peacefully.',
    },
  ];

  public echoRelics: EchoRelic[] = [
    {
      id: 'relic_chronometer',
      name: 'Antique Chronometer',
      era: 'Pre-Rupture',
      description: 'Hands tick backward every 10 seconds, resisting linear entropy.',
      passiveBonus: '+10 Max Stamina',
    },
    {
      id: 'relic_lens',
      name: 'Temporal Prism Lens',
      era: 'Echo Golden Era',
      description: 'Reveals hidden energetic fractures with enhanced clarity.',
      passiveBonus: 'Echo Vision Duration +50%',
    },
    {
      id: 'relic_blade_pommel',
      name: 'Obsidian Pommel Stone',
      era: 'Old Dynasty',
      description: 'Infused with dark matter from an expired timeline branch.',
      passiveBonus: 'Blade Attack DMG +15%',
    },
    {
      id: 'relic_cloak_clasp',
      name: 'Aegis Clasp',
      era: 'Echo Defense Force',
      description: 'Deflects projectile shockwaves when parrying.',
      passiveBonus: 'Parry Window +0.08s',
    },
    {
      id: 'relic_hourglass',
      name: 'Void Hourglass',
      era: 'Extinction Epoch',
      description: 'Sand flows horizontally across dimensional fault lines.',
      passiveBonus: 'Echo Energy Regen +25%',
    },
  ];

  // Active dialogue target
  public activeNpc: NPCData | null = null;
  public dialogueIndex: number = 0;

  public checkPlayerNearNpc(
    playerPos: THREE.Vector3,
    currentTimeline: 'PRESENT' | 'ECHO'
  ): NPCData | null {
    for (const npc of this.npcs) {
      if (npc.timeline !== 'both' && npc.timeline !== currentTimeline) continue;

      const npcPos = new THREE.Vector3(...npc.position);
      if (playerPos.distanceTo(npcPos) < 3.2) {
        return npc;
      }
    }
    return null;
  }

  public checkSecretAreaDiscovery(playerPos: THREE.Vector3): SecretArea | null {
    for (const secret of this.secretAreas) {
      if (secret.discovered) continue;

      const secPos = new THREE.Vector3(...secret.position);
      if (playerPos.distanceTo(secPos) < 5.0) {
        secret.discovered = true;
        soundManager.playSecretDiscovered();
        return secret;
      }
    }
    return null;
  }

  public unlockWaypointsNear(playerPos: THREE.Vector3): FastTravelPoint | null {
    for (const wp of this.fastTravelPoints) {
      if (wp.unlocked) continue;
      const wpPos = new THREE.Vector3(...wp.position);
      if (playerPos.distanceTo(wpPos) < 12.0) {
        wp.unlocked = true;
        return wp;
      }
    }
    return null;
  }

  public progressQuest(questId: string, amount: number = 1): SideQuest | null {
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest || quest.completed) return null;

    quest.progress += amount;
    if (quest.progress >= quest.maxProgress) {
      quest.progress = quest.maxProgress;
      quest.completed = true;
      soundManager.playQuestComplete();
    }
    return quest;
  }

  public getUnlockedEnding(coresCount: number): GameEnding {
    if (coresCount >= 5) {
      return GameEnding.BALANCE;
    }
    return GameEnding.PRESENT;
  }
}
