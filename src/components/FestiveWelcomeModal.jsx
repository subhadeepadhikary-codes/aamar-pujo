import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Music, 
  Flame, 
  Compass, 
  BellRing, 
  ChevronRight,
  Heart
} from "lucide-react";

export default function FestiveWelcomeModal({ onStartWithMusic, onExplore }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the welcome modal in this session
    const hasSeen = sessionStorage.getItem("aamar_pujo_welcomed_v2");
    if (!hasSeen) {
      // Short delay so the page loads gracefully before modal appears
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (playMusic = false) => {
    sessionStorage.setItem("aamar_pujo_welcomed_v2", "true");
    setIsOpen(false);
    if (playMusic && onStartWithMusic) {
      onStartWithMusic();
    } else if (onExplore) {
      onExplore();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Festive Floating Card */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180C24] via-[#12081C] to-[#0A0510] border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-900/50 text-center text-white overflow-hidden animate-scaleUp">
        
        {/* Background Festive Mandala Glow */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => handleDismiss(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition border border-white/10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Traditional Durga Face Emblem (Authentic Non-AI) */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-300 shadow-xl shadow-rose-600/30 mb-5 group">
          <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#180E24]">
            <img 
              src="/images/durga/durga_face_1.jpg" 
              alt="Maa Durga Pratima" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-md flex items-center space-x-1 whitespace-nowrap">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>Subho Sharodiyo</span>
          </div>
        </div>

        {/* English Main Greeting */}
        <div className="space-y-2 mb-5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Festive Season Greetings · Durga Puja 2026</span>
          </div>

          <h2 className="font-heritage text-2xl sm:text-3xl font-black text-amber-300 leading-snug pt-1">
            Wishing You a Joyous & Blessed Durga Puja!
          </h2>

          <p className="font-heritage text-sm sm:text-base font-bold text-white tracking-wide">
            Welcome to Aamar Pujo · Your Ultimate Bengal Pujo Companion
          </p>

          <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto pt-1 font-normal">
            May Maa Durga bring peace, happiness, and prosperity to you and your family. Explore 500+ verified puja pandals, direct metro transit routing, and legendary food trails across West Bengal — <strong className="text-amber-300 font-semibold">Celebrate Pujo Like Never Before!</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Primary Action: Start with Music */}
          <button
            onClick={() => handleDismiss(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-xl shadow-rose-600/30 hover:scale-[1.02] cursor-pointer"
          >
            <Music className="w-4 h-4 fill-current text-slate-950" />
            <span>🎶 Start with Agomoni Melodies</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Secondary Action: Explore Silently */}
          <button
            onClick={() => handleDismiss(false)}
            className="w-full py-3 px-4 rounded-2xl bg-[#1A1126] hover:bg-[#251736] text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center space-x-2 border border-white/10 transition cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>🌟 Explore All 500+ Pandals</span>
          </button>
        </div>

        {/* Traditional Touch Tagline */}
        <p className="text-[11px] text-amber-200/70 font-sans pt-4 flex items-center justify-center space-x-1">
          <Heart className="w-3 h-3 text-rose-500 fill-current" />
          <span>Curated with pride by Subhadeep Adhikary & Kolkata Pujo Lovers</span>
        </p>

      </div>
    </div>
  );
}
