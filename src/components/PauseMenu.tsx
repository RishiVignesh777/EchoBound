import React, { useState } from 'react';
import { GameSettings, SkillUpgrade, MemoryShard, SideQuest, WeaponItem, ArmorItem, DifficultyMode } from '../types';
import { soundManager } from '../audio/SoundManager';
import {
  Play,
  Sparkles,
  BookOpen,
  Settings as SettingsIcon,
  RotateCcw,
  Shield,
  Zap,
  Swords,
  Scroll,
  Shirt,
  Compass,
} from 'lucide-react';

interface PauseMenuProps {
  isOpen: boolean;
  shardsCount: number;
  memoryShards: MemoryShard[];
  sideQuests?: SideQuest[];
  currentDifficulty?: DifficultyMode;
  onSetDifficulty?: (diff: DifficultyMode) => void;
  onSelectBladeAppearance?: (color: string) => void;
  onSelectArmorAppearance?: (color: string) => void;
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onUpgradeSkill: (skill: SkillUpgrade) => void;
  onUpdateBrightness?: (val: number) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  shardsCount,
  memoryShards,
  sideQuests = [],
  currentDifficulty = 'NORMAL',
  onSetDifficulty,
  onSelectBladeAppearance,
  onSelectArmorAppearance,
  onResume,
  onRestartCheckpoint,
  onUpgradeSkill,
  onUpdateBrightness,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'quests' | 'equipment' | 'lore' | 'settings' | 'controls'>('skills');
  const [selectedBlade, setSelectedBlade] = useState<string>('#00f0ff');
  const [selectedCloak, setSelectedCloak] = useState<string>('#1e293b');
  const [difficulty, setDifficulty] = useState<DifficultyMode>(currentDifficulty);

  // Skill Tree definitions
  const [skills, setSkills] = useState<SkillUpgrade[]>([
    {
      id: 'echo_surge',
      name: 'Temporal Resonance',
      category: 'ECHO',
      description: 'Increases Echo Energy recovery rate by 40% and reduces ability cooldowns.',
      cost: 30,
      unlocked: false,
      iconName: 'Sparkles',
    },
    {
      id: 'echo_duration',
      name: 'Chrono Anchor Stability',
      category: 'ECHO',
      description: 'Increases Echo Anchor duration to 45 seconds and boosts movement speed by 15%.',
      cost: 45,
      unlocked: false,
      iconName: 'Zap',
    },
    {
      id: 'blade_edge',
      name: 'Runic Edge Infusion',
      category: 'COMBAT',
      description: 'Infuses the Echo Blade with dense chronal shards, boosting slash damage by +12.',
      cost: 35,
      unlocked: false,
      iconName: 'Swords',
    },
    {
      id: 'parry_master',
      name: 'Aegis of the Past',
      category: 'COMBAT',
      description: 'Extends counter parry window and triggers an automatic temporal shockwave.',
      cost: 45,
      unlocked: false,
      iconName: 'Shield',
    },
    {
      id: 'reality_shatter',
      name: 'Paradox Cleave',
      category: 'COMBAT',
      description: 'Increases Reality Break area by 50% and bypasses 30% of enemy armor.',
      cost: 60,
      unlocked: false,
      iconName: 'Swords',
    },
    {
      id: 'shadow_dodge',
      name: 'Phase Step',
      category: 'MOBILITY',
      description: 'Grants extended invulnerability frames during dodge roll.',
      cost: 30,
      unlocked: false,
      iconName: 'Zap',
    },
  ]);

  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    brightness: 1.45,
    mouseSensitivity: 1.0,
    cameraDistance: 4.8,
    graphicsQuality: 'high',
    lockOnEnabled: true,
    difficulty: currentDifficulty,
    motionBlur: true,
    screenShake: true,
    subtitles: true,
    subtitleSize: 'medium',
    colorFilter: 'none',
  });

  if (!isOpen) return null;

  const handleUnlockSkill = (skill: SkillUpgrade) => {
    if (skill.unlocked || shardsCount < skill.cost) return;
    setSkills((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, unlocked: true } : s))
    );
    onUpgradeSkill(skill);
    soundManager.playShardPickup();
  };

  const bladeCustomizations = [
    { name: 'Azure Chrono (Default)', color: '#00f0ff', desc: 'Standard resonator blade attuned to baseline temporal flow.' },
    { name: 'Amber Echo', color: '#f59e0b', desc: 'Attuned to 100-year past intact machinery; faster strike speed.' },
    { name: 'Crimson Paradox', color: '#f43f5e', desc: 'Infused with raw anomalies; +15% critical finisher damage.' },
    { name: 'Void Violet', color: '#a855f7', desc: 'Harvested from Devourer fragments; extends Echo Vision pulse.' },
    { name: 'Solar Gold', color: '#eab308', desc: 'Pure harmonic energy forged in the Chrono Observatory.' },
  ];

  const cloakCustomizations = [
    { name: 'Nomad Dusk (Default)', color: '#1e293b', desc: 'Weather-worn cloak built for ruined wastelands.' },
    { name: 'Architect Ivory', color: '#f8fafc', desc: 'Gleaming woven fiber worn by the high engineers of old Veyra.' },
    { name: 'Crimson Wanderer', color: '#881337', desc: 'Insulated against temporal storms in the Crimson Forest.' },
    { name: 'Metropolis Emerald', color: '#064e3b', desc: 'Hydrophobic alloy tailored for flooded skyscraper transit.' },
  ];

  return (
    <div id="pause-menu-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-6 select-none animate-fadeIn">
      <div className="w-full max-w-4xl h-[600px] bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-cinzel font-bold tracking-wider text-slate-100">
              ECHOBOUND
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
              Update 1.0: Fractured Reality
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'skills', label: 'Abilities' },
              { id: 'quests', label: 'Quests' },
              { id: 'equipment', label: 'Equipment' },
              { id: 'lore', label: `Lore (${memoryShards.filter((s) => s.collected).length}/6)` },
              { id: 'settings', label: 'Settings' },
              { id: 'controls', label: 'Controls' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-900/40 border border-cyan-500/60 text-cyan-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* TAB 1: SKILLS */}
          {activeTab === 'skills' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-cinzel font-bold text-slate-200 uppercase tracking-wider">
                    Temporal Skill Tree
                  </h2>
                  <p className="text-xs text-slate-400">
                    Channel recovered Chrono Shards to unlock combat and timeline proficiencies.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{shardsCount} Available Shards</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      skill.unlocked
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-sm shadow-cyan-950'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-200">{skill.name}</h3>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              skill.category === 'ECHO'
                                ? 'bg-amber-500/20 text-amber-300'
                                : skill.category === 'COMBAT'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {skill.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {skill.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <span className="font-mono text-xs text-slate-400">Cost: {skill.cost} Shards</span>
                      {skill.unlocked ? (
                        <span className="text-xs font-mono font-bold text-cyan-400">UNLOCKED</span>
                      ) : (
                        <button
                          onClick={() => handleUnlockSkill(skill)}
                          disabled={shardsCount < skill.cost}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                            shardsCount >= skill.cost
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Unlock
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: QUESTS */}
          {activeTab === 'quests' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-sm font-cinzel font-bold text-slate-200 uppercase tracking-wider">
                  Veyra Investigation Log
                </h2>
                <p className="text-xs text-slate-400">
                  Track main quest milestones and world side missions across both timelines.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Main Story Quest */}
                <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-cyan-300">MAIN CHRONICLE</span>
                    <span className="text-[11px] font-mono text-amber-400">IN PROGRESS</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">Chapter 1: The Echo of Veyra</h3>
                  <p className="text-xs text-slate-300">
                    Traverse from the Forgotten City, across the Sunken District and Cathedral, deep into the Abyssal Metropolis, to confront The Architect and determine the fate of reality.
                  </p>
                </div>

                {/* Side Quests */}
                {sideQuests.map((q) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border flex flex-col gap-2 ${
                      q.completed
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-400">
                        Giver: {q.giver || 'Veyra Lorekeeper'} • {q.region || 'World'}
                      </span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                          q.completed
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {q.completed ? 'COMPLETED' : 'ACTIVE'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">{q.title}</h3>
                    <p className="text-xs text-slate-400">{q.description}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                      <span>Objective: {q.objective || 'Investigate timeline anomaly'}</span>
                      <span className="text-cyan-400">Reward: {q.reward || '+35 Chrono Shards'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EQUIPMENT & CUSTOMIZATION */}
          {activeTab === 'equipment' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-sm font-cinzel font-bold text-slate-200 uppercase tracking-wider">
                  Echo Blade & Armor Attunement
                </h2>
                <p className="text-xs text-slate-400">
                  Switch the resonant frequencies and aesthetics of Kael's equipment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blade Appearance */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Swords className="w-4 h-4" /> ECHO BLADE ATTUNEMENT
                  </h3>
                  <div className="flex flex-col gap-2">
                    {bladeCustomizations.map((b) => (
                      <div
                        key={b.color}
                        onClick={() => {
                          setSelectedBlade(b.color);
                          onSelectBladeAppearance?.(b.color);
                        }}
                        className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                          selectedBlade === b.color
                            ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-950'
                            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{b.name}</span>
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/50 shadow"
                            style={{ backgroundColor: b.color }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">{b.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cloak Appearance */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Shirt className="w-4 h-4" /> WEAVER CLOAK COAT
                  </h3>
                  <div className="flex flex-col gap-2">
                    {cloakCustomizations.map((c) => (
                      <div
                        key={c.color}
                        onClick={() => {
                          setSelectedCloak(c.color);
                          onSelectArmorAppearance?.(c.color);
                        }}
                        className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                          selectedCloak === c.color
                            ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-950'
                            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{c.name}</span>
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/50 shadow"
                            style={{ backgroundColor: c.color }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">{c.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LORE & MEMORY ARCHIVES */}
          {activeTab === 'lore' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-sm font-cinzel font-bold text-slate-200 uppercase tracking-wider">
                  Memory Shard Archives
                </h2>
                <p className="text-xs text-slate-400">
                  Chronicle fragments recovered across the collapsed city and echo epochs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memoryShards.map((shard) => (
                  <div
                    key={shard.id}
                    className={`p-4 rounded-xl border flex flex-col gap-2 ${
                      shard.collected
                        ? 'bg-slate-900/60 border-slate-700 shadow-sm'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 font-cinzel">
                        {shard.collected ? shard.title : 'Unrecovered Shard'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {shard.collected ? shard.region : 'Location Unknown'}
                      </span>
                    </div>
                    {shard.collected ? (
                      <p className="text-xs text-slate-300 font-serif italic leading-relaxed">
                        "{shard.excerpt}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Hidden somewhere in the ruins. Locate in either Present or Echo timeline.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 max-w-lg">
              {/* Difficulty Selection */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-slate-300">COMBAT & PUZZLE DIFFICULTY</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['STORY', 'NORMAL', 'PARADOX'] as DifficultyMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setDifficulty(mode);
                        onSetDifficulty?.(mode);
                      }}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        difficulty === mode
                          ? 'bg-cyan-600 text-slate-950 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master Volume */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>MASTER VOLUME</span>
                  <span>{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSettings({ ...settings, masterVolume: val });
                    soundManager.setMasterVolume(val);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Music Volume */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>AMBIENCE / MUSIC VOLUME</span>
                  <span>{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSettings({ ...settings, musicVolume: val });
                    soundManager.setMusicVolume(val);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* SFX Volume */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>SOUND EFFECTS (SFX)</span>
                  <span>{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSettings({ ...settings, sfxVolume: val });
                    soundManager.setSFXVolume(val);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Game Brightness & Exposure */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>ENVIRONMENT BRIGHTNESS & EXPOSURE</span>
                  <span className="text-cyan-400 font-bold">{Math.round((settings.brightness / 1.45) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.4"
                  step="0.05"
                  value={settings.brightness}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSettings({ ...settings, brightness: val });
                    onUpdateBrightness?.(val);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 6: CONTROLS */}
          {activeTab === 'controls' && (
            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Movement</span>
                <span className="text-cyan-300 font-bold">W, A, S, D</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Echo Shift (Toggle Timeline)</span>
                <span className="text-amber-300 font-bold">Q</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Echo Anchor (Pin Object/Platform)</span>
                <span className="text-cyan-300 font-bold">R</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Echo Vision (Pulse Scanner)</span>
                <span className="text-cyan-300 font-bold">V</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Echo Finisher / Time Break</span>
                <span className="text-rose-400 font-bold">F</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Reality Break (Shockwave)</span>
                <span className="text-purple-300 font-bold">X</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Light Attack Combo</span>
                <span className="text-cyan-300 font-bold">Left Click</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Heavy Attack / Parry Counter</span>
                <span className="text-cyan-300 font-bold">Right Click / Shift+RMB</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Dodge Roll (Invulnerable)</span>
                <span className="text-cyan-300 font-bold">C / Shift</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Tactical World Map</span>
                <span className="text-cyan-300 font-bold">M</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Photo Mode</span>
                <span className="text-cyan-300 font-bold">P</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span>Interact / Talk to NPC</span>
                <span className="text-amber-300 font-bold">E / T</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-slate-800/80 bg-slate-900/40">
          <button
            onClick={onRestartCheckpoint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Checkpoint</span>
          </button>

          <button
            onClick={onResume}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold cursor-pointer transition-all shadow-lg shadow-cyan-950"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RESUME</span>
          </button>
        </div>
      </div>
    </div>
  );
};

