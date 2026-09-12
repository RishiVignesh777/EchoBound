import React, { useState } from 'react';
import { GameSettings, SkillUpgrade, MemoryShard } from '../types';
import { soundManager } from '../audio/SoundManager';
import { Play, Sparkles, BookOpen, Settings as SettingsIcon, RotateCcw, Shield, Zap, Swords } from 'lucide-react';

interface PauseMenuProps {
  isOpen: boolean;
  shardsCount: number;
  memoryShards: MemoryShard[];
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onUpgradeSkill: (skill: SkillUpgrade) => void;
  onUpdateBrightness?: (val: number) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  shardsCount,
  memoryShards,
  onResume,
  onRestartCheckpoint,
  onUpgradeSkill,
  onUpdateBrightness,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'lore' | 'settings' | 'controls'>('skills');

  // Skill Tree definitions
  const [skills, setSkills] = useState<SkillUpgrade[]>([
    {
      id: 'echo_surge',
      name: 'Temporal Resonance',
      category: 'ECHO',
      description: 'Increases Echo Energy recovery rate by 40% and reduces Echo Strike cooldown.',
      cost: 30,
      unlocked: false,
      iconName: 'Sparkles',
    },
    {
      id: 'echo_duration',
      name: 'Chrono Anchor',
      category: 'ECHO',
      description: 'Strengthens stability while in the Echo timeline, boosting movement speed by 15%.',
      cost: 50,
      unlocked: false,
      iconName: 'Zap',
    },
    {
      id: 'blade_edge',
      name: 'Runic Edge',
      category: 'COMBAT',
      description: 'Infuses the Echo Blade with dense temporal energy, increasing light attack damage by +8.',
      cost: 35,
      unlocked: false,
      iconName: 'Swords',
    },
    {
      id: 'parry_master',
      name: 'Aegis of the Past',
      category: 'COMBAT',
      description: 'Extends perfect parry window and restores 25 Echo Energy on every successful counter.',
      cost: 45,
      unlocked: false,
      iconName: 'Shield',
    },
    {
      id: 'shadow_dodge',
      name: 'Phase Step',
      category: 'MOBILITY',
      description: 'Grants full invulnerability frames and increases dodge roll distance by 25%.',
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

  return (
    <div id="pause-menu-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-6 select-none animate-fadeIn">
      <div className="w-full max-w-4xl h-[560px] bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-cinzel font-bold tracking-wider text-slate-100">
              ECHOBOUND
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
              Veyra Chronicles
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'skills'
                  ? 'bg-cyan-900/40 border border-cyan-500/60 text-cyan-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Abilities & Skills
            </button>
            <button
              onClick={() => setActiveTab('lore')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'lore'
                  ? 'bg-cyan-900/40 border border-cyan-500/60 text-cyan-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Memory Archives ({memoryShards.filter((s) => s.collected).length}/6)
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-cyan-900/40 border border-cyan-500/60 text-cyan-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'controls'
                  ? 'bg-cyan-900/40 border border-cyan-500/60 text-cyan-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Controls
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* TAB 1: SKILLS */}
          {activeTab === 'skills' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-cinzel text-slate-400">Available Resonance</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">
                    {shardsCount} Chrono Shards
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-sans max-w-sm">
                  Defeat temporal anomalies and recover Memory Shards scattered across Veyra to empower Kael.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {skills.map((skill) => {
                  const canAfford = shardsCount >= skill.cost && !skill.unlocked;
                  return (
                    <div
                      key={skill.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                        skill.unlocked
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                          : canAfford
                          ? 'bg-slate-900/70 border-cyan-500/40 hover:border-cyan-400'
                          : 'bg-slate-950 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <span className="font-cinzel font-bold text-sm text-slate-100">
                            {skill.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {skill.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          {skill.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {skill.cost} Shards
                        </span>
                        <button
                          onClick={() => handleUnlockSkill(skill)}
                          disabled={skill.unlocked || !canAfford}
                          className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                            skill.unlocked
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : canAfford
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 cursor-pointer shadow-lg shadow-cyan-900/40'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {skill.unlocked ? 'UNLOCKED' : canAfford ? 'UNLOCK' : 'LOCKED'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LORE ARCHIVES */}
          {activeTab === 'lore' && (
            <div className="flex flex-col gap-4">
              <span className="text-xs text-slate-400 font-sans">
                Echo Shards reveal encrypted fragments of Veyra prior to the catastrophe.
              </span>
              <div className="grid grid-cols-2 gap-4">
                {memoryShards.map((shard) => (
                  <div
                    key={shard.id}
                    className={`p-4 rounded-xl border flex flex-col gap-2 ${
                      shard.collected
                        ? 'bg-slate-900/60 border-cyan-500/30'
                        : 'bg-slate-950 border-slate-800/60 opacity-40'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-cinzel text-xs font-bold text-slate-200">
                        {shard.collected ? shard.title : 'Encrypted Shard'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {shard.region}
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

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 max-w-lg">
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
                    if (onUpdateBrightness) {
                      onUpdateBrightness(val);
                    }
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 font-sans">
                  Adjust tone mapping exposure to match your display preference.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: CONTROLS */}
          {activeTab === 'controls' && (
            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Movement</span>
                <span className="text-cyan-300 font-bold">W, A, S, D</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Echo Shift (Change Timeline)</span>
                <span className="text-amber-300 font-bold">Q</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Light Attack Combo</span>
                <span className="text-cyan-300 font-bold">Left Click</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Heavy Attack</span>
                <span className="text-cyan-300 font-bold">Shift + Right Click</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Block & Perfect Parry</span>
                <span className="text-cyan-300 font-bold">Right Click</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Dodge Roll (Invulnerable)</span>
                <span className="text-cyan-300 font-bold">C / Shift</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Interact / Puzzles</span>
                <span className="text-amber-300 font-bold">E</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Echo Strike Ability</span>
                <span className="text-cyan-300 font-bold">R</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Time Break (Slow-Mo)</span>
                <span className="text-cyan-300 font-bold">F</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
                <span>Reality Slash Wave</span>
                <span className="text-cyan-300 font-bold">X</span>
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
