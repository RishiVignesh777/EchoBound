import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, GameEngineState } from './game/GameEngine';
import { GameHUD } from './components/GameHUD';
import { PauseMenu } from './components/PauseMenu';
import { CinematicOverlay } from './components/CinematicOverlay';
import { GameOverModal } from './components/GameOverModal';
import { SkillUpgrade } from './types';
import { MousePointer, Play } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameEngineState>({
    timeline: 'PRESENT',
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    echoEnergy: 100,
    maxEchoEnergy: 100,
    shardsCount: 0,
    currentObjective: 'Awaken in Veyra. Explore the ruins ahead.',
    activePrompt: null,
    bossHealth: null,
    glitchIntensity: 0,
    floatingTexts: [],
    notifications: [],
    isPaused: false,
    isPointerLocked: false,
    inOpeningCinematic: true,
    gameCompleted: false,
    gameOver: false,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, (state) => {
      setGameState(state);
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleShiftTimeline = () => {
    engineRef.current?.triggerEchoShift();
  };

  const handleInteract = () => {
    engineRef.current?.handleInteract();
  };

  const handleTogglePause = () => {
    engineRef.current?.togglePause();
  };

  const handleRestart = () => {
    engineRef.current?.restartAtCheckpoint();
  };

  const handleSkipOpening = () => {
    if (engineRef.current) {
      engineRef.current.inOpeningCinematic = false;
      engineRef.current.cinematicTimer = 0;
    }
  };

  const handleUpgradeSkill = (skill: SkillUpgrade) => {
    if (!engineRef.current) return;
    const player = engineRef.current.player;

    if (player.stats.echoShards >= skill.cost) {
      player.stats.echoShards -= skill.cost;

      if (skill.id === 'blade_edge') {
        player.stats.bladeDamage += 10;
      } else if (skill.id === 'echo_surge') {
        player.stats.maxEchoEnergy += 30;
        player.stats.echoEnergy = player.stats.maxEchoEnergy;
      } else if (skill.id === 'parry_master') {
        player.stats.maxStamina += 25;
      }

      engineRef.current.addNotification('SKILL UNLOCKED', `${skill.name} is now active!`, 'ability');
    }
  };

  const requestCursorLock = () => {
    if (canvasRef.current?.querySelector('canvas')) {
      canvasRef.current.querySelector('canvas')?.requestPointerLock();
    }
  };

  return (
    <div id="echobound-root" className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Atmospheric scanline overlay for retro-cinematic fantasy feel */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />

      {/* Click-to-Play overlay when cursor is unlocked & game is active */}
      {!gameState.isPointerLocked && !gameState.isPaused && !gameState.inOpeningCinematic && !gameState.gameOver && !gameState.gameCompleted && (
        <div
          onClick={requestCursorLock}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer select-none"
        >
          <div className="px-6 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-200 flex flex-col items-center gap-2 shadow-2xl animate-pulse">
            <MousePointer className="w-6 h-6 text-cyan-400" />
            <span className="font-cinzel text-sm font-bold tracking-wider">CLICK TO CONTROL KAEL</span>
            <span className="text-[11px] font-mono text-slate-400">Mouse look & attack activated</span>
          </div>
        </div>
      )}

      {/* In-Game HUD */}
      {!gameState.inOpeningCinematic && !gameState.gameCompleted && (
        <GameHUD
          state={gameState}
          onShiftTimeline={handleShiftTimeline}
          onInteract={handleInteract}
          onOpenPause={handleTogglePause}
        />
      )}

      {/* Cinematic Overlays (Opening narrative & ending revelations) */}
      <CinematicOverlay
        inOpening={gameState.inOpeningCinematic}
        gameCompleted={gameState.gameCompleted}
        onSkipOpening={handleSkipOpening}
        onRestart={handleRestart}
      />

      {/* Game Over Modal */}
      <GameOverModal isOpen={gameState.gameOver} onRestart={handleRestart} />

      {/* Pause Menu (Skills, Lore Shards, Audio Settings, Controls) */}
      <PauseMenu
        isOpen={gameState.isPaused}
        shardsCount={gameState.shardsCount}
        memoryShards={engineRef.current?.world.memoryShards || []}
        onResume={handleTogglePause}
        onRestartCheckpoint={handleRestart}
        onUpgradeSkill={handleUpgradeSkill}
        onUpdateBrightness={(val) => engineRef.current?.setBrightness(val)}
      />
    </div>
  );
}
