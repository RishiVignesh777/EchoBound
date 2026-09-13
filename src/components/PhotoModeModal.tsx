import React, { useState } from 'react';
import * as THREE from 'three';
import { Camera, Download, Eye, EyeOff, Sun, Sliders, X } from 'lucide-react';

interface PhotoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  renderer: THREE.WebGLRenderer | null;
  onSetBrightness: (brightness: number) => void;
  currentBrightness: number;
}

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({
  isOpen,
  onClose,
  renderer,
  onSetBrightness,
  currentBrightness,
}) => {
  const [brightness, setBrightness] = useState(currentBrightness);
  const [hideHud, setHideHud] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBrightnessChange = (val: number) => {
    setBrightness(val);
    onSetBrightness(val);
  };

  const handleCaptureScreenshot = () => {
    if (!renderer) return;
    try {
      const dataUrl = renderer.domElement.toDataURL('image/png');
      setCapturedUrl(dataUrl);

      // Create download anchor
      const link = document.createElement('a');
      link.download = `ECHOBOUND_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to capture screenshot', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-6 bg-slate-950/40 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="font-cinzel font-bold text-sm text-slate-200 tracking-wider">
              PHOTO MODE CONTROLS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Exposure / Brightness
              </span>
              <span>{brightness.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.4"
              step="0.05"
              value={brightness}
              onChange={(e) => handleBrightnessChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              {hideHud ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
              Hide UI Elements
            </span>
            <button
              onClick={() => setHideHud(!hideHud)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                hideHud ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {hideHud ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Capture Action */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCaptureScreenshot}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            CAPTURE SCREENSHOT (PNG)
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer"
          >
            RESUME
          </button>
        </div>
      </div>
    </div>
  );
};
