import React from 'react';
import { Radio, Sparkles, AlertCircle } from 'lucide-react';

interface EchoPulseCooldownWidgetProps {
  active: boolean;
  cooldown: number;
  maxCooldown: number;
  durationRemaining: number;
  maxDuration: number;
  targetsCount: number;
  onTrigger?: () => void;
  compact?: boolean;
}

export const EchoPulseCooldownWidget: React.FC<EchoPulseCooldownWidgetProps> = ({
  active,
  cooldown,
  maxCooldown = 2.5,
  durationRemaining = 0,
  maxDuration = 5.0,
  targetsCount = 0,
  onTrigger,
  compact = false,
}) => {
  const isOnCooldown = cooldown > 0 && !active;
  const isReady = !isOnCooldown && !active;

  // Recharge progress: 0 when just cast, goes to 100% when ready
  const safeMaxCooldown = maxCooldown > 0 ? maxCooldown : 2.5;
  const rechargeRatio = isOnCooldown ? Math.max(0, Math.min(1, (safeMaxCooldown - cooldown) / safeMaxCooldown)) : 1;
  const rechargePercent = Math.round(rechargeRatio * 100);

  // Active duration progress: 100% when started, goes to 0% when duration ends
  const safeMaxDuration = maxDuration > 0 ? maxDuration : 5.0;
  const durationRatio = active ? Math.max(0, Math.min(1, durationRemaining / safeMaxDuration)) : 0;
  const durationPercent = Math.round(durationRatio * 100);

  // SVG circular geometry
  const size = compact ? 36 : 48;
  const strokeWidth = compact ? 3 : 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // SVG dash offsets
  // On cooldown: stroke fills up from 0 to circumference
  const cooldownDashoffset = circumference - circumference * rechargeRatio;
  // While active: stroke drains from circumference to 0
  const activeDashoffset = circumference - circumference * durationRatio;

  if (compact) {
    return (
      <div
        onClick={onTrigger}
        title="Tactical Echo Pulse: Sonar wave reveals hidden loot, enemies, and mechanisms [E]"
        className={`pointer-events-auto cursor-pointer flex items-center gap-2 px-2.5 py-1 rounded-lg border backdrop-blur-md font-mono text-[10px] select-none transition-all ${
          active
            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
            : isOnCooldown
            ? 'bg-slate-950/80 border-slate-800 text-slate-400'
            : 'bg-slate-950/80 border-cyan-700/70 text-cyan-300 hover:border-cyan-400 hover:text-cyan-100 shadow-sm'
        }`}
      >
        {/* Radial mini dial */}
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-slate-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active / Cooldown dynamic stroke */}
            {active ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-cyan-400 transition-all duration-75"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={activeDashoffset}
                strokeLinecap="round"
              />
            ) : isOnCooldown ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-cyan-500 transition-all duration-75"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={cooldownDashoffset}
                strokeLinecap="round"
              />
            ) : (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-cyan-400"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
            )}
          </svg>

          {/* Center icon / countdown number */}
          <div className="absolute inset-0 flex items-center justify-center font-bold">
            {active ? (
              <Radio className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
            ) : isOnCooldown ? (
              <span className="text-[9px] font-bold text-cyan-400">{cooldown.toFixed(1)}s</span>
            ) : (
              <span className="text-[10px] font-black text-cyan-300">E</span>
            )}
          </div>
        </div>

        {/* Text and linear meter */}
        <div className="flex flex-col min-w-[75px]">
          <div className="flex items-center justify-between gap-1 leading-none mb-1">
            <span className="font-bold text-[10px] tracking-wider uppercase text-slate-200">
              Pulse
            </span>
            <span
              className={`text-[9px] font-bold ${
                active
                  ? 'text-cyan-300 animate-pulse'
                  : isOnCooldown
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {active
                ? `${durationRemaining.toFixed(1)}s`
                : isOnCooldown
                ? `${cooldown.toFixed(1)}s`
                : 'READY'}
            </span>
          </div>

          {/* Linear recharge bar */}
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-75 ${
                active
                  ? 'bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.8)]'
                  : isOnCooldown
                  ? 'bg-gradient-to-r from-amber-500 to-cyan-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${active ? durationPercent : rechargePercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Full-featured tactical ability slot
  return (
    <div
      onClick={onTrigger}
      title="Tactical Echo Pulse [E]: Emits an acoustic temporal wave revealing hidden loot, mechanisms, and threats"
      className={`pointer-events-auto cursor-pointer relative flex items-center gap-3 px-3 py-2 rounded-xl border backdrop-blur-md transition-all select-none ${
        active
          ? 'bg-cyan-950/90 border-cyan-400/90 shadow-[0_0_20px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400/50'
          : isOnCooldown
          ? 'bg-slate-950/85 border-slate-800 text-slate-400'
          : 'bg-slate-950/85 border-cyan-600/70 hover:border-cyan-400 text-cyan-300 shadow-md hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]'
      }`}
    >
      {/* 1. Circular Radial Cooldown Dial */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 drop-shadow" viewBox={`0 0 ${size} ${size}`}>
          {/* Base Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth={strokeWidth}
            fill="rgba(15, 23, 42, 0.6)"
          />

          {/* Active Duration Sweep */}
          {active && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-cyan-400 transition-all duration-75"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={activeDashoffset}
              strokeLinecap="round"
            />
          )}

          {/* Cooldown Recharging Sweep */}
          {isOnCooldown && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-cyan-400 transition-all duration-75"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={cooldownDashoffset}
              strokeLinecap="round"
            />
          )}

          {/* Ready State Full Ring */}
          {isReady && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-cyan-400 shadow-[0_0_10px_#00f0ff]"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
          )}
        </svg>

        {/* Dial Center Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {active ? (
            <div className="flex flex-col items-center">
              <Radio className="w-4 h-4 text-cyan-300 animate-spin" />
              <span className="text-[8px] font-mono font-bold text-cyan-200 leading-none mt-0.5">
                {durationRemaining.toFixed(1)}s
              </span>
            </div>
          ) : isOnCooldown ? (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono font-black text-cyan-300 tracking-tighter leading-none">
                {cooldown.toFixed(1)}s
              </span>
              <span className="text-[7px] font-mono uppercase text-slate-400 leading-none mt-0.5">
                {rechargePercent}%
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[12px] font-mono font-black text-cyan-200 leading-none">
                E
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mt-0.5" />
            </div>
          )}
        </div>
      </div>

      {/* 2. Tactical Readout & Linear Recharge Bar */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              Echo Pulse
            </span>
            <kbd className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-cyan-300">
              E
            </kbd>
          </div>

          {/* Status Chip */}
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
              active
                ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200 animate-pulse'
                : isOnCooldown
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
            }`}
          >
            {active
              ? `${targetsCount} Detected`
              : isOnCooldown
              ? `${cooldown.toFixed(1)}s`
              : 'READY'}
          </span>
        </div>

        {/* Micro Subtitle */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 leading-none">
          <span>
            {active
              ? 'Tactical Vision Scan'
              : isOnCooldown
              ? 'Sonar Wave Recharging'
              : 'Reveal Loot & Threats'}
          </span>
          <span className="font-bold text-slate-300">
            {active ? `${durationPercent}%` : `${rechargePercent}%`}
          </span>
        </div>

        {/* Dynamic Dual-Phase Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-75 ${
              active
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.7)]'
                : isOnCooldown
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
            }`}
            style={{ width: `${active ? durationPercent : rechargePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
