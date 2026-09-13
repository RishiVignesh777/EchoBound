import React from 'react';
import { GameEngineState } from '../game/GameEngine';
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

          {/* 1.0 Anchors & Vision Indicators */}
          <div className="flex items-center gap-3 pt-1">
            <div
              onClick={onTriggerEchoVision}
              className={`pointer-events-auto cursor-pointer flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                state.echoVisionActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>[V] Vision</span>
            </div>

            <div
              onClick={onTriggerEchoAnchor}
              className="pointer-events-auto cursor-pointer flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-950/70 text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              <Anchor className="w-3 h-3 text-cyan-400" />
              <span>[R] Anchors: {state.echoAnchorCount || 0}/3</span>
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

