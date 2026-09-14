import React from 'react';
import { GameEngineState } from '../game/GameEngine';
import { EchoPulseCooldownWidget } from './EchoPulseCooldownWidget';
import {
  Shield,
  Zap,
  Sparkles,
  Compass,
  Key,
  Volume2,
  AlertCircle,
  RefreshCw,
  Eye,
  Anchor,
  CloudRain,
  CloudSnow,
  Sun,
  Flame,
  MessageSquare,
  Map as MapIcon,
  Camera,
  Crosshair,
  Radio,
  Target,
} from 'lucide-react';

interface GameHUDProps {
  state: GameEngineState;
  onShiftTimeline: () => void;
  onInteract: () => void;
  onOpenPause: () => void;
  onOpenMap?: () => void;
  onOpenPhotoMode?: () => void;
  onTriggerEchoVision?: () => void;
  onTriggerEchoAnchor?: () => void;
  onTriggerEchoPulse?: () => void;
  onTriggerFinisher?: () => void;
  onTriggerRealityBreak?: () => void;
  onSpeakNpc?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  state,
  onShiftTimeline,
  onInteract,
  onOpenPause,
  onOpenMap,
  onOpenPhotoMode,
  onTriggerEchoVision,
  onTriggerEchoAnchor,
  onTriggerEchoPulse,
  onTriggerFinisher,
  onTriggerRealityBreak,
  onSpeakNpc,
}) => {
  const isEcho = state.timeline === 'ECHO';

  const getWeatherIcon = (w?: string) => {
    switch (w) {
      case 'RAIN':
        return <CloudRain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />;
      case 'SNOW':
        return <CloudSnow className="w-3.5 h-3.5 text-sky-200 animate-pulse" />;
      case 'TEMPORAL_STORM':
        return <Flame className="w-3.5 h-3.5 text-purple-400 animate-bounce" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  return (
    <div id="game-hud" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none z-10">
      {/* Glitch & Chromatic Aberration overlay on Echo Shift */}
      {state.glitchIntensity > 0.05 && (
        <div
          className="absolute inset-0 pointer-events-none animate-timeline-glitch"
          style={{
            backgroundColor: isEcho ? 'rgba(255, 183, 3, 0.12)' : 'rgba(0, 240, 255, 0.12)',
            backdropFilter: `blur(${state.glitchIntensity * 4}px)`,
          }}
        />
      )}

      {/* Echo Vision Active Scanner Overlay Filter */}
      {state.echoVisionActive && (
        <div className="absolute inset-0 pointer-events-none border-[6px] border-cyan-500/30 bg-cyan-950/15 backdrop-brightness-110 shadow-[inset_0_0_80px_rgba(0,240,255,0.25)]">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-900/80 border border-cyan-400/80 text-cyan-200 text-xs font-mono font-bold tracking-widest animate-pulse flex items-center gap-2">
            <Eye className="w-4 h-4" /> ECHO VISION SCANNER ACTIVE
          </div>
        </div>
      )}

      {/* TOP BAR: Health, Stamina, Energy, Timeline Badge, Weather, Map & Pause */}
      <div className="flex items-start justify-between w-full">
        {/* Player Stats Cluster */}
        <div className="flex flex-col gap-2 w-72">
          {/* Health Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> HEALTH
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {Math.round(state.health)} / {state.maxHealth}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950/80 rounded-full border border-slate-800/80 overflow-hidden p-0.5 backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-rose-700 to-rose-500 rounded-full transition-all duration-150"
                style={{ width: `${(state.health / state.maxHealth) * 100}%` }}
              />
            </div>
          </div>

          {/* Stamina Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-400/90">
                <Zap className="w-3 h-3" /> STAMINA
              </span>
              <span className="font-mono text-[11px] text-slate-500">{Math.round(state.stamina)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950/80 rounded-full border border-slate-800/60 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-100"
                style={{ width: `${(state.stamina / state.maxStamina) * 100}%` }}
              />
            </div>
          </div>

          {/* Echo Energy Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Sparkles className="w-3 h-3" /> ECHO ENERGY
              </span>
              <span className="font-mono text-[11px] text-slate-500">{Math.round(state.echoEnergy)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950/80 rounded-full border border-slate-800/60 overflow-hidden backdrop-blur-sm">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  isEcho
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                }`}
                style={{ width: `${(state.echoEnergy / state.maxEchoEnergy) * 100}%` }}
              />
            </div>
          </div>

          {/* 1.0 Ability Controls & Visual Echo Pulse Cooldown */}
          <div className="flex flex-col gap-2 pt-1.5">
            <EchoPulseCooldownWidget
              active={state.echoPulseActive}
              cooldown={state.echoPulseCooldown}
              maxCooldown={state.echoPulseMaxCooldown || 2.5}
              durationRemaining={state.echoPulseDurationRemaining || 0}
              maxDuration={state.echoPulseMaxDuration || 5.0}
              targetsCount={state.echoPulseTargets ? state.echoPulseTargets.length : 0}
              onTrigger={onTriggerEchoPulse}
              compact={true}
            />

            <div className="flex items-center gap-2">
              <div
                onClick={onTriggerEchoVision}
                className={`pointer-events-auto cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono transition-colors ${
                  state.echoVisionActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>[V] Vision</span>
              </div>

              <div
                onClick={onTriggerEchoAnchor}
                className="pointer-events-auto cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-950/70 text-[10px] font-mono text-slate-400 hover:text-slate-200"
              >
                <Anchor className="w-3 h-3 text-cyan-400" />
                <span>[R] Anchors: {state.echoAnchorCount || 0}/3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: CURRENT TIMELINE BADGE & WEATHER */}
        <div className="flex flex-col items-center gap-1.5">
          <div
            onClick={onShiftTimeline}
            className={`pointer-events-auto cursor-pointer px-5 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-xl flex items-center gap-3 ${
              isEcho
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-amber-950/50'
                : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-cyan-950/50'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                Active Reality
              </span>
              <span className="text-sm font-bold font-cinzel tracking-wider">
                {isEcho ? 'ECHO (100 YEARS AGO)' : 'PRESENT (COLLAPSED RUINS)'}
              </span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold text-slate-200 shadow-inner">
              Q
            </kbd>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 tracking-wide">
              {isEcho ? 'Intact Architecture • Living Flora' : 'Hostile Corrupted • Broken Chasms'}
            </span>
            {state.currentWeather && (
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
                {getWeatherIcon(state.currentWeather)}
                <span>{state.currentWeather}</span>
              </span>
            )}
          </div>

          {/* Tactical Sonar Pulse Status Readout */}
          {state.echoPulseActive && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/80 text-cyan-200 text-[11px] font-mono shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse">
              <Radio className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <span className="font-bold tracking-wider">TACTICAL ECHO PULSE ACTIVE:</span>
              <span>
                {state.echoPulseTargets ? state.echoPulseTargets.length : 0} targets detected
              </span>
              <span className="px-1.5 py-0.2 bg-cyan-800/80 border border-cyan-400/50 rounded text-[10px] font-bold text-cyan-100">
                {(state.echoPulseDurationRemaining || 0).toFixed(1)}s
              </span>
            </div>
          )}

          {/* Tactical Sonar Cooldown Readout Bar */}
          {!state.echoPulseActive && state.echoPulseCooldown > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-900/60 text-slate-300 text-[10px] font-mono shadow-md backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-400 tracking-wider uppercase">PULSE RECHARGING:</span>
              <span className="text-cyan-300 font-bold font-mono">
                {state.echoPulseCooldown.toFixed(1)}s
              </span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-75"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        ((((state.echoPulseMaxCooldown || 2.5) - state.echoPulseCooldown) /
                          (state.echoPulseMaxCooldown || 2.5)) *
                          100)
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Map, Photo Mode, Shards count and Pause Menu trigger */}
        <div className="flex items-center gap-2">
          {/* Tactical Map */}
          <button
            onClick={onOpenMap}
            className="pointer-events-auto px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono tracking-wider transition-colors backdrop-blur-sm flex items-center gap-1.5 cursor-pointer shadow"
          >
            <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>MAP</span>
            <kbd className="text-[9px] bg-slate-800 px-1 py-0.2 rounded border border-slate-600">M</kbd>
          </button>

          {/* Photo Mode */}
          <button
            onClick={onOpenPhotoMode}
            className="pointer-events-auto px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono tracking-wider transition-colors backdrop-blur-sm flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>PHOTO</span>
            <kbd className="text-[9px] bg-slate-800 px-1 py-0.2 rounded border border-slate-600">P</kbd>
          </button>

          {/* Shards count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-xs font-semibold">{state.shardsCount} Shards</span>
          </div>

          {/* Pause Menu */}
          <button
            id="pause-menu-btn"
            onClick={onOpenPause}
            className="pointer-events-auto px-3.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono tracking-wider transition-colors backdrop-blur-sm flex items-center gap-2 cursor-pointer shadow"
          >
            <span>MENU</span>
            <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600">TAB</kbd>
          </button>
        </div>
      </div>

      {/* BOSS HEALTH BAR (If active) */}
      {state.bossHealth && (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-1.5 -mt-6">
          <div className="flex justify-between items-center w-full text-xs font-cinzel font-bold text-rose-300 tracking-widest">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              {state.bossHealth.name}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {Math.round(state.bossHealth.health)} / {state.bossHealth.maxHealth}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950/90 rounded-full border border-rose-900/80 overflow-hidden p-0.5 shadow-2xl backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-rose-800 via-rose-600 to-amber-500 rounded-full transition-all duration-150"
              style={{ width: `${(state.bossHealth.health / state.bossHealth.maxHealth) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* FINISHER EXECUTION PROMPT (Update 1.0) */}
      {state.nearFinisherEnemy && (
        <div
          onClick={onTriggerFinisher}
          className="pointer-events-auto cursor-pointer self-center px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 border-2 border-amber-300 text-white font-mono text-sm font-black tracking-widest shadow-2xl shadow-rose-900/80 flex items-center gap-3 animate-pulse transform -translate-y-8 cursor-pointer"
        >
          <Crosshair className="w-5 h-5 animate-spin" />
          <span>[F] EXECUTE ECHO FINISHER (STUNNED TARGET)</span>
        </div>
      )}

      {/* NPC DIALOGUE PROMPT (Update 1.0) */}
      {state.activeNpc && (
        <div
          onClick={onSpeakNpc}
          className="pointer-events-auto cursor-pointer self-center px-6 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-400 text-cyan-200 font-mono text-xs font-bold tracking-wider shadow-xl flex items-center gap-2.5 animate-bounce backdrop-blur-md"
        >
          <MessageSquare className="w-4 h-4 text-cyan-300" />
          <span>[T] Speak with {state.activeNpc.name} ({state.activeNpc.role})</span>
        </div>
      )}

      {/* TACTICAL ECHO PULSE SCANNER SCREEN OVERLAY & 3D RETICLES */}
      {state.echoPulseActive && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Futuristic corner brackets & grid vignette */}
          <div className="absolute inset-4 border border-cyan-500/20 pointer-events-none rounded-xl">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
            
            <div className="absolute top-3 left-4 flex items-center gap-2 text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
              <Radio className="w-3 h-3 animate-spin" />
              <span>ECHOBOUND // SONAR ECHO PULSE ACTIVE</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-bold">
                {(state.echoPulseDurationRemaining || 0).toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Dynamic 3D Projected Screen Reticles for Detected Targets */}
          {state.echoPulseTargets &&
            state.echoPulseTargets.map((target) => {
              if (!target.screenPos || !target.screenPos.visible) return null;
              const isLoot = target.type === 'LOOT';
              const isEnemy = target.type === 'ENEMY';

              return (
                <div
                  key={target.id}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-75"
                  style={{
                    left: `${target.screenPos.x}px`,
                    top: `${target.screenPos.y}px`,
                  }}
                >
                  {/* Holographic Diamond Reticle */}
                  <div
                    className={`w-7 h-7 border-2 rotate-45 flex items-center justify-center animate-pulse transition-colors ${
                      isLoot
                        ? 'border-amber-400 bg-amber-500/25 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                        : isEnemy
                        ? 'border-rose-500 bg-rose-600/30 shadow-[0_0_15px_rgba(244,63,94,0.7)]'
                        : 'border-cyan-400 bg-cyan-500/25 shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isLoot ? 'bg-amber-300' : isEnemy ? 'bg-rose-300' : 'bg-cyan-300'
                      }`}
                    />
                  </div>

                  {/* Tactical readout tag */}
                  <div
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider backdrop-blur-md border shadow-xl flex flex-col items-center whitespace-nowrap ${
                      isLoot
                        ? 'bg-slate-950/90 border-amber-500/80 text-amber-200 shadow-amber-950/50'
                        : isEnemy
                        ? 'bg-slate-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50'
                        : 'bg-slate-950/90 border-cyan-500/80 text-cyan-200 shadow-cyan-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-90">
                        {isLoot ? '◈ LOOT' : isEnemy ? '▲ THREAT' : '◆ MECHANISM'}
                      </span>
                      <span>•</span>
                      <span className="text-white font-black">{target.name}</span>
                      <span className="opacity-80">({Math.round(target.distance)}m)</span>
                    </div>
                    {target.info && (
                      <span className="text-[9px] font-normal opacity-75 mt-0.5">
                        {target.info}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* FLOATING COMBAT TEXT & DAMAGE NUMBERS */}
      <div className="absolute inset-0 pointer-events-none">
        {state.floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute font-mono font-extrabold text-sm tracking-wide text-shadow transition-transform pointer-events-none"
            style={{
              left: `${ft.x}px`,
              top: `${ft.y}px`,
              color: ft.color,
              opacity: ft.opacity,
              transform: `translate(-50%, -50%) scale(${0.9 + ft.opacity * 0.3})`,
              textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)',
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* NOTIFICATIONS STREAM (Left side) */}
      <div className="absolute left-6 bottom-24 flex flex-col gap-2 max-w-sm pointer-events-none">
        {state.notifications.map((notif) => (
          <div
            key={notif.id}
            className="px-3.5 py-2 rounded-lg bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-lg flex items-start gap-2.5 animate-fadeIn"
          >
            <span className="text-cyan-400 mt-0.5">
              {notif.type === 'lore' ? (
                <Sparkles className="w-4 h-4" />
              ) : notif.type === 'quest' ? (
                <Key className="w-4 h-4" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold font-cinzel text-slate-200 tracking-wide">
                {notif.title}
              </span>
              <span className="text-[11px] text-slate-400 font-sans leading-tight">
                {notif.message}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM SECTION: Objective Bar & Action Controls */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* INTERACTION PROMPT */}
        {state.activePrompt && (
          <div
            onClick={onInteract}
            className="pointer-events-auto cursor-pointer px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-900/90 to-amber-500/20 border border-amber-500/60 text-amber-200 font-mono text-xs font-bold tracking-wider backdrop-blur-md shadow-2xl flex items-center gap-2.5 animate-bounce"
          >
            <span>{state.activePrompt}</span>
          </div>
        )}

        {/* Current Objective Banner */}
        <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-200 backdrop-blur-md shadow-lg">
          <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-medium tracking-wide text-slate-300">
            {state.currentObjective}
          </span>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-slate-200 font-bold">LMB</span>
            <span>Slash</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-slate-200 font-bold">RMB</span>
            <span>Parry</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-slate-200 font-bold">Shift+RMB</span>
            <span>Heavy</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-slate-200 font-bold">SPACE</span>
            <span>Jump</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-slate-200 font-bold">C / Shift</span>
            <span>Dodge</span>
          </div>
          <div
            onClick={onTriggerEchoPulse}
            className={`pointer-events-auto cursor-pointer relative overflow-hidden flex items-center gap-1.5 px-3 py-1 rounded border transition-all select-none ${
              state.echoPulseActive
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                : state.echoPulseCooldown > 0
                ? 'bg-slate-950/90 border-slate-700/80 text-slate-300'
                : 'bg-slate-950/80 border-cyan-700 text-cyan-300 hover:border-cyan-400 hover:text-cyan-100 shadow-sm'
            }`}
          >
            {/* Visual cooldown fill progress backdrop */}
            {state.echoPulseCooldown > 0 && !state.echoPulseActive && (
              <div
                className="absolute inset-0 bg-cyan-900/35 transition-all duration-75 pointer-events-none"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      ((((state.echoPulseMaxCooldown || 2.5) - state.echoPulseCooldown) /
                        (state.echoPulseMaxCooldown || 2.5)) *
                        100)
                    )
                  )}%`,
                }}
              />
            )}
            {state.echoPulseActive && (
              <div className="absolute inset-0 bg-cyan-500/20 animate-pulse pointer-events-none" />
            )}

            <div className="relative z-10 flex items-center gap-1.5">
              <span className="text-cyan-200 font-black px-1 rounded bg-slate-900/90 border border-cyan-800/80 text-[10px]">
                E
              </span>
              <Radio
                className={`w-3 h-3 ${
                  state.echoPulseActive
                    ? 'text-cyan-300 animate-spin'
                    : state.echoPulseCooldown > 0
                    ? 'text-amber-400'
                    : 'text-cyan-400'
                }`}
              />
              <span>
                {state.echoPulseActive
                  ? `Vision Active (${(state.echoPulseDurationRemaining || 0).toFixed(1)}s)`
                  : state.echoPulseCooldown > 0
                  ? `Echo Pulse (${state.echoPulseCooldown.toFixed(1)}s)`
                  : 'Echo Pulse / Interact'}
              </span>
              {state.echoPulseCooldown > 0 && !state.echoPulseActive && (
                <span className="text-[9px] font-bold text-amber-400 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-500/40">
                  {state.echoPulseCooldown.toFixed(1)}s
                </span>
              )}
            </div>
          </div>
          <div
            onClick={onTriggerEchoVision}
            className="pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-cyan-800 text-cyan-300 hover:border-cyan-500"
          >
            <span className="text-cyan-200 font-bold">V</span>
            <span>Vision Pulse</span>
          </div>
          <div
            onClick={onTriggerEchoAnchor}
            className="pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-cyan-800 text-cyan-300 hover:border-cyan-500"
          >
            <span className="text-cyan-200 font-bold">R</span>
            <span>Anchor Object</span>
          </div>
          <div
            onClick={onTriggerFinisher}
            className="pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-rose-800 text-rose-300 hover:border-rose-500"
          >
            <span className="text-rose-200 font-bold">F</span>
            <span>Finisher / Time Break</span>
          </div>
          <div
            onClick={onTriggerRealityBreak}
            className="pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-purple-800 text-purple-300 hover:border-purple-500"
          >
            <span className="text-purple-200 font-bold">X</span>
            <span>Reality Break (50)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

