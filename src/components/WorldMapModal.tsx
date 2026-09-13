import React from 'react';
import { FastTravelPoint, SecretArea, Timeline } from '../types';
import { MapPin, Navigation, Eye, Sparkles, X } from 'lucide-react';

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPos: { x: number; y: number; z: number };
  timeline: Timeline;
  waypoints: FastTravelPoint[];
  secretAreas: SecretArea[];
  onFastTravel: (pos: [number, number, number]) => void;
}

const REGIONS = [
  { id: 'city', name: 'Forgotten City', zMin: -40, zMax: 10, color: 'border-cyan-500/40 bg-cyan-950/20' },
  { id: 'district', name: 'The Sunken District', zMin: -100, zMax: -40, color: 'border-blue-500/40 bg-blue-950/20' },
  { id: 'cathedral', name: 'Clockwork Cathedral', zMin: -160, zMax: -100, color: 'border-amber-500/40 bg-amber-950/20' },
  { id: 'forest', name: 'Crimson Forest', zMin: -240, zMax: -160, color: 'border-rose-500/40 bg-rose-950/20' },
  { id: 'metropolis', name: 'The Abyssal Metropolis', zMin: -340, zMax: -240, color: 'border-purple-500/40 bg-purple-950/20' },
  { id: 'observatory', name: 'Chrono Observatory', zMin: -420, zMax: -340, color: 'border-emerald-500/40 bg-emerald-950/20' },
];

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  isOpen,
  onClose,
  playerPos,
  timeline,
  waypoints,
  secretAreas,
  onFastTravel,
}) => {
  if (!isOpen) return null;

  // Map coordinate conversion: z ranges from +10 down to -420 (430 units height)
  const zToPercent = (z: number) => {
    const clamped = Math.max(-420, Math.min(10, z));
    return ((10 - clamped) / 430) * 100;
  };

  const xToPercent = (x: number) => {
    // x ranges from -60 to +60
    const clamped = Math.max(-60, Math.min(60, x));
    return ((clamped + 60) / 120) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-cinzel font-bold text-slate-100 tracking-wider">
              VEYRA TACTICAL MAP
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
                timeline === 'ECHO'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              EPOCH: {timeline}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content: Map View & Waypoint List */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Visual Schematic Map */}
          <div className="md:col-span-2 relative bg-slate-950 p-6 flex flex-col items-center justify-center border-r border-slate-800 overflow-y-auto">
            <div className="relative w-full max-w-sm h-[480px] bg-slate-900/60 rounded-xl border border-slate-800 p-2 overflow-hidden shadow-inner">
              {/* Region bands */}
              {REGIONS.map((region) => {
                const top = zToPercent(region.zMax);
                const height = zToPercent(region.zMin) - top;
                return (
                  <div
                    key={region.id}
                    className={`absolute left-2 right-2 rounded border px-2 py-1 flex items-center justify-between text-[10px] font-mono text-slate-400 ${region.color}`}
                    style={{ top: `${top}%`, height: `${height}%` }}
                  >
                    <span className="font-semibold text-slate-300 truncate">{region.name}</span>
                  </div>
                );
              })}

              {/* Waypoints */}
              {waypoints.map((wp) => {
                const top = zToPercent(wp.position[2]);
                const left = xToPercent(wp.position[0]);
                return (
                  <button
                    key={wp.id}
                    onClick={() => wp.unlocked && onFastTravel(wp.position)}
                    disabled={!wp.unlocked}
                    title={`${wp.name} ${wp.unlocked ? '(Click to Travel)' : '(Locked)'}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full transition-transform hover:scale-125 z-10 ${
                      wp.unlocked
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/50 cursor-pointer'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                    style={{ top: `${top}%`, left: `${left}%` }}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                );
              })}

              {/* Secret Area markers */}
              {secretAreas.map((secret) => {
                if (!secret.discovered) return null;
                const top = zToPercent(secret.position[2]);
                const left = xToPercent(secret.position[0]);
                return (
                  <div
                    key={secret.id}
                    title={`Secret: ${secret.name}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 p-0.5 rounded-full bg-purple-500 text-white z-10 animate-pulse"
                    style={{ top: `${top}%`, left: `${left}%` }}
                  >
                    <Sparkles className="w-3 h-3" />
                  </div>
                );
              })}

              {/* Player Position Pin */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
                style={{
                  top: `${zToPercent(playerPos.z)}%`,
                  left: `${xToPercent(playerPos.x)}%`,
                }}
              >
                <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-xl animate-ping absolute" />
                <div className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-lg relative" />
                <span className="text-[9px] font-bold text-rose-300 font-mono bg-slate-950/90 px-1 rounded mt-0.5 whitespace-nowrap">
                  KAEL
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 font-mono">
              Click any synchronized waypoint (blue pins) to Fast Travel
            </span>
          </div>

          {/* Waypoints & Travel Directory */}
          <div className="p-4 bg-slate-900/80 flex flex-col gap-3 overflow-y-auto max-h-[500px]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Synchronized Waypoints
            </h3>
            <div className="flex flex-col gap-2">
              {waypoints.map((wp) => (
                <div
                  key={wp.id}
                  className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                    wp.unlocked
                      ? 'bg-slate-800/80 border-slate-700 hover:border-cyan-500/50'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{wp.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        wp.unlocked ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {wp.unlocked ? 'SYNCED' : 'UNEXPLORED'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{wp.region}</span>
                  {wp.unlocked && (
                    <button
                      onClick={() => onFastTravel(wp.position)}
                      className="mt-1 w-full py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-mono transition-colors shadow"
                    >
                      FAST TRAVEL
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Secret areas list */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" /> Discovered Secrets (
                {secretAreas.filter((s) => s.discovered).length} / {secretAreas.length})
              </h3>
              <div className="flex flex-col gap-1.5">
                {secretAreas.map((secret) => (
                  <div
                    key={secret.id}
                    className={`p-2 rounded-lg text-xs font-mono border ${
                      secret.discovered
                        ? 'bg-purple-950/20 border-purple-800/50 text-purple-200'
                        : 'bg-slate-950/40 border-slate-800/40 text-slate-600 italic'
                    }`}
                  >
                    {secret.discovered ? secret.name : 'Unknown Anomaly ???'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
