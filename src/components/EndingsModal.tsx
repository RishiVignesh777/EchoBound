import React from 'react';
import { GameEnding } from '../types';
import { Sparkles, History, RotateCcw, AlertTriangle } from 'lucide-react';

interface EndingsModalProps {
  isOpen: boolean;
  onSelectEnding: (ending: GameEnding) => void;
  onClose: () => void;
}

export const EndingsModal: React.FC<EndingsModalProps> = ({
  isOpen,
  onSelectEnding,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-lg select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl p-8 shadow-2xl flex flex-col gap-6 text-center">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            The Convergence at Chrono Observatory
          </span>
          <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-slate-100 mt-1">
            DETERMINE THE FATE OF VEYRA
          </h2>
          <p className="text-sm text-slate-400 font-sans mt-2 max-w-xl mx-auto">
            The Chrono Core stands dormant. Kael possesses the power to rewrite time, anchor the past,
            or fuse reality into an unforeseen continuum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Ending 1 */}
          <div
            onClick={() => onSelectEnding('RESTORE_ECHO')}
            className="p-5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 mb-3">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel font-bold text-sm text-amber-200 group-hover:text-amber-100">
                RESTORE THE ECHO
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Reverse the Great Collapse. Sacrificing the present, the intact civilization of 100 years ago is permanently restored to life.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono font-bold text-amber-400">
              CHOOSE THIS PATH &rarr;
            </span>
          </div>

          {/* Ending 2 */}
          <div
            onClick={() => onSelectEnding('ACCEPT_PRESENT')}
            className="p-5 rounded-xl border border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-900/30 hover:border-cyan-400 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel font-bold text-sm text-cyan-200 group-hover:text-cyan-100">
                ACCEPT THE PRESENT
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Sever temporal delusions. Allow the ruined present to mourn, heal, and rebuild honestly without false illusions of what was lost.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono font-bold text-cyan-400">
              CHOOSE THIS PATH &rarr;
            </span>
          </div>

          {/* Ending 3 */}
          <div
            onClick={() => onSelectEnding('FUSE_TIMELINES')}
            className="p-5 rounded-xl border border-purple-500/40 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-400 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 mb-3">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel font-bold text-sm text-purple-200 group-hover:text-purple-100">
                FUSE TIMELINES
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Create a permanent Paradox Reality. Present ruins and Echo machinery merge into a hybrid world of infinite temporal power.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono font-bold text-purple-400">
              CHOOSE THIS PATH &rarr;
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="self-center px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-xs transition-colors"
        >
          RETURN TO WORLD
        </button>
      </div>
    </div>
  );
};
