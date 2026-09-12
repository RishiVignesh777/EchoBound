import React from 'react';
import { RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, onRestart }) => {
  if (!isOpen) return null;

  return (
    <div id="game-over-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 select-none animate-fadeIn">
      <div className="max-w-md w-full bg-slate-950 border border-rose-900/60 rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl shadow-rose-950/40">
        <span className="text-xs font-mono tracking-[0.25em] text-rose-500 uppercase">
          Timeline Collapsed
        </span>
        <h2 className="text-3xl font-cinzel font-extrabold text-slate-100 tracking-wider">
          THE ECHO FADED
        </h2>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Kael has dissolved back into temporal dust. The fractured reality of Veyra destabilizes without its anchor.
        </p>
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-mono font-bold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-950 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>REAWAKEN AT CHECKPOINT</span>
        </button>
      </div>
    </div>
  );
};
