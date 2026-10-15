import React, { useState, useEffect } from "react";
import { Maximize2, X, Sparkles, Smartphone } from "lucide-react";

export const FULLSCREEN_PROMPT_STORAGE_KEY = "aamar_fullscreen_prompt_seen_v1";

export default function FullscreenPromptModal({ onComplete }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(FULLSCREEN_PROMPT_STORAGE_KEY);
      const isMobile = window.innerWidth < 768 || "ontouchstart" in window;
      const isAlreadyStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

      // Only show if not seen before, on mobile, and not already running in standalone PWA mode
      if (!seen && isMobile && !isAlreadyStandalone) {
        setIsOpen(true);
      } else {
        if (onComplete) onComplete();
      }
    } catch {
      if (onComplete) onComplete();
    }
  }, [onComplete]);

  if (!isOpen) return null;

  const handleEnableFullscreen = async () => {
    try {
      localStorage.setItem(FULLSCREEN_PROMPT_STORAGE_KEY, "true");
    } catch {
      // storage unavailable
    }

    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen permission notice:", err);
    }

    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(FULLSCREEN_PROMPT_STORAGE_KEY, "true");
    } catch {
      // storage unavailable
    }
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-gradient-to-b from-[#160E22] via-[#0E0916] to-[#070509] rounded-3xl border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-4 relative"
        role="dialog"
        aria-modal="true"
        aria-label="Full Screen Mode Permission"
      >
        {/* Top Icon Badge */}
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-slate-950 shadow-lg">
            <Maximize2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Content (Clean English) */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Optimal View Setup</span>
          </div>
          <h3 className="text-lg font-black text-white">
            Enable Full Screen View?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Hides mobile browser address bars and bottom navigation buttons for an edge-to-edge, distraction-free pandal hopping experience.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleEnableFullscreen}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-rose-950/50 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 stroke-[2.5]" />
            <span>Enable Full Screen</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition text-center cursor-pointer"
          >
            Continue in Standard View
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center">
          You can toggle full screen anytime using the ⛶ button in the top bar.
        </p>
      </div>
    </div>
  );
}
