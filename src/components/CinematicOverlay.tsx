import React from 'react';
import { Sparkles, Play } from 'lucide-react';

interface CinematicOverlayProps {
  inOpening: boolean;
  gameCompleted: boolean;
  onSkipOpening: () => void;
  onRestart: () => void;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({
  inOpening,
  gameCompleted,
  onSkipOpening,
  onRestart,
}) => {
  if (!inOpening && !gameCompleted) return null;

  if (inOpening) {
    return (
      <div id="opening-cinematic" className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-12 bg-gradient-to-b from-black/80 via-transparent to-black/90">
        {/* Top title */}
        <div className="flex flex-col items-center gap-1 animate-fadeIn">
          <span className="text-[10px] tracking-[0.3em] font-mono text-cyan-400 uppercase">
            Chapter I : The Fracture
          </span>
          <h1 className="text-3xl font-cinzel font-extrabold tracking-widest text-slate-100">
            THE RUINS OF VEYRA
          </h1>
        </div>

        {/* Cinematic Subtitles */}
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto animate-pulse">
          <p className="font-serif italic text-lg text-slate-200 leading-relaxed text-shadow">
            "You awaken among cold stone and falling rain. The city of Veyra lies broken... yet beneath the ash, a second reality whispers."
          </p>
          <span className="text-xs font-mono text-cyan-300">
            Press [Q] at any moment to initiate an Echo Shift.
          </span>
        </div>

        {/* Skip button */}
        <div className="flex justify-end pointer-events-auto">
          <button
            onClick={onSkipOpening}
            className="px-4 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <span>START ADVENTURE</span>
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div id="ending-cinematic" className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black/95 select-none animate-fadeIn">
        <div className="max-w-xl flex flex-col items-center text-center gap-6">
          <span className="text-xs font-mono text-cyan-400 tracking-widest">
            THE OBSERVATORY ARCHIVES
          </span>
          <h2 className="text-4xl font-cinzel font-bold text-slate-100 tracking-wider">
            ECHOBOUND
          </h2>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-serif italic text-base leading-relaxed flex flex-col gap-4">
            <p>
              As the Architect's reality rings shatter, the laboratory pod hums to life. Behind the shattered glass, you gaze upon your own face in cryogenic stasis from a century ago.
            </p>
            <p className="text-rose-400 font-bold font-mono not-italic text-sm tracking-widest">
              "You were never meant to survive."
            </p>
            <p className="text-xs font-sans text-slate-400 not-italic">
              You are Kael — the living Echo anchor. Both worlds continue to exist only through your will.
            </p>
          </div>

          <button
            onClick={onRestart}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all cursor-pointer shadow-xl shadow-cyan-950"
          >
            PLAY PROTOTYPE AGAIN
          </button>
        </div>
      </div>
    );
  }

  return null;
};
