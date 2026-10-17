import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { Sparkles, ChevronRight, X, CheckCircle2 } from "lucide-react";

export const TOUR_COMPLETED_KEY = "aamar_pujo_spotlight_tour_v2";

const TOUR_STEPS = [
  {
    id: "search-filters",
    selector: '[data-tour="search-filters"]',
    fallbackSelector: "input[type='text']",
    title: "Instant Search & 1-Tap Filters",
    bengali: "সহজে খুঁজুন আপনার প্রিয় পুজো",
    desc: "Search across all 541+ pandals by name, locality, or metro station, or filter by city zones.",
    pointerText: "TAP TO DISCOVER",
    placement: "bottom"
  },
  {
    id: "nav-map",
    selector: '[data-tour="nav-map"]',
    fallbackSelector: 'button:has(svg.lucide-map), a[href="#map"]',
    title: "Interactive Kolkata Pujo Map",
    bengali: "লাইভ ম্যাপে প্যান্ডেল দেখুন",
    desc: "Switch to the full-screen map with 541 pandals, 228 iconic eateries, and road-snapped walking routes.",
    pointerText: "TAP EXPLORE MAP",
    placement: "bottom"
  },
  {
    id: "express-hop-btn",
    selector: '[data-tour="express-hop-btn"]',
    fallbackSelector: '[data-tour="express-hop"]',
    title: "⚡ Time-Crunch Express Hop",
    bengali: "কম সময়ে সেরা পুজোগুলি দেখুন",
    desc: "Short on time after lunch? Pick the top 2 to 10 pandals that blew up on Instagram this year!",
    pointerText: "TAP EXPRESS HOP",
    placement: "bottom"
  },
  {
    id: "visited-btn",
    selector: '[data-tour="visited-btn"]',
    fallbackSelector: '[data-tour="visited-toggle-btn"]',
    title: "Seen / Visited Tracker ✅",
    bengali: "দেখা প্যান্ডেল ধূসর রঙে চিহ্নিত করুন",
    desc: "Mark pandals as seen so they turn slate grey on the map and get pruned from leftover routes!",
    pointerText: "TAP TO MARK SEEN",
    placement: "top"
  },
  {
    id: "dawon-mascot",
    selector: '[data-tour="dawon-mascot"]',
    fallbackSelector: 'button[aria-label="Open Dawon AI Guide"]',
    title: "🦁 Dawon AI Transit Navigator",
    bengali: "মা দুর্গার বাহন — আপনার পার্সোনাল গাইড",
    desc: "Tap Dawon anytime for instant metro exits, shared auto routes, and midnight food tips powered by Gemini AI!",
    pointerText: "MEET DAWON",
    placement: "left"
  }
];

export default function InteractiveSpotlightTour({ isOpen, onComplete, onSkip }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const pollTimerRef = useRef(null);

  const currentStep = TOUR_STEPS[currentStepIdx];

  // Measure target element position reactively
  const updateTargetRect = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.selector) || 
               (currentStep.fallbackSelector ? document.querySelector(currentStep.fallbackSelector) : null);

    if (el) {
      const rect = el.getBoundingClientRect();
      // Scroll into view if needed
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setTargetRect({
        top: Math.max(0, rect.top - 6),
        left: Math.max(0, rect.left - 6),
        width: rect.width + 12,
        height: rect.height + 12,
        bottom: rect.bottom + 6,
        right: rect.right + 6
      });
    } else {
      // Element not in DOM right now (e.g. on different tab), advance or center
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    updateTargetRect();

    // Re-check on resize/scroll
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    // Short poll to catch dynamic DOM mounts
    pollTimerRef.current = setInterval(updateTargetRect, 250);

    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, currentStepIdx, updateTargetRect]);

  if (!isOpen) return null;

  const handleAdvance = () => {
    // If clicking target element, also trigger underlying click
    if (currentStep) {
      const el = document.querySelector(currentStep.selector) || 
                 (currentStep.fallbackSelector ? document.querySelector(currentStep.fallbackSelector) : null);
      if (el && typeof el.click === "function") {
        el.click();
      }
    }

    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      // Completed!
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      } catch {}

      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1800);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    } catch {}
    if (onSkip) onSkip();
  };

  // SVG Cutout path for hole punch
  const w = typeof window !== "undefined" ? window.innerWidth : 1000;
  const h = typeof window !== "undefined" ? window.innerHeight : 1000;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto select-none transition-all duration-300 font-sans">
      {/* SVG Mask with Cutout Hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            {/* White background reveals the dark mask */}
            <rect x="0" y="0" width={w} height={h} fill="white" />
            {/* Black rect punches transparent hole over live element */}
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Dark backdrop overlay */}
        <rect
          x="0"
          y="0"
          width={w}
          height={h}
          fill="rgba(5, 3, 10, 0.82)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Target Element Glowing Spotlight Frame */}
      {targetRect && (
        <div
          onClick={handleAdvance}
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`
          }}
          className="absolute z-[10000] rounded-2xl border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.7)] cursor-pointer transition-all duration-300 animate-pulse hover:border-amber-300"
          title="Click to interact and advance tutorial"
        >
          {/* Animated Bouncing Pointer Hand (👆) */}
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce pointer-events-none">
            <span className="text-2xl filter drop-shadow">👆</span>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-black text-[9px] tracking-wider uppercase shadow-md whitespace-nowrap">
              {currentStep?.pointerText || "TAP HERE"}
            </span>
          </div>
        </div>
      )}

      {/* Floating Mascot Speech Card */}
      {!isCompleted && (
        <div
          className={`fixed z-[10001] w-[90vw] max-w-sm p-4 bg-[#180E24] border-2 border-amber-400/70 rounded-3xl shadow-2xl shadow-black/95 transition-all duration-300 ${
            targetRect && targetRect.top > 320
              ? "top-6 left-1/2 -translate-x-1/2"
              : "bottom-8 left-1/2 -translate-x-1/2"
          }`}
        >
          {/* Top Bar with Mascot and Progress */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-lg">
                🦁
              </div>
              <div>
                <span className="text-xs font-heritage font-bold text-amber-300 block">
                  Dawon's Live Tour
                </span>
                <span className="text-[10px] text-slate-400">
                  Step {currentStepIdx + 1} of {TOUR_STEPS.length}
                </span>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition"
            >
              Skip
            </button>
          </div>

          {/* Content */}
          <div className="space-y-1 mb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{currentStep?.title}</span>
            </h4>
            <p className="font-bengali text-xs text-amber-300/90 font-medium">
              {currentStep?.bengali}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {currentStep?.desc}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-amber-400/80 font-mono">
              💡 Tap highlighted box to try!
            </span>

            <button
              type="button"
              onClick={handleAdvance}
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold text-xs flex items-center gap-1 hover:scale-105 active:scale-95 transition shadow-md"
            >
              <span>{currentStepIdx === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-[#190E26] border-2 border-amber-400 text-center space-y-3 shadow-2xl shadow-rose-950/80">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-3xl shadow-lg">
              🎉
            </div>
            <h3 className="font-heritage text-lg font-bold text-white">
              You're Ready for Kolkata Pujo!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-bengali">
              সব ফিচার জানা হয়ে গেল! এবার নির্ভয়ে শহর চষে ফেলুন। শুভ দুর্গোৎসব!
            </p>
            <button
              onClick={onComplete}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              Start Exploring ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
