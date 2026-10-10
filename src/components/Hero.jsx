import React, { useState } from "react";
import logoImg from "../assets/logo.png";
import { 
  Search, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Calendar, 
  Compass, 
  ArrowRight,
  Flame,
  Music2,
  Info
} from "lucide-react";

export default function Hero({ 
  onSearch, 
  onSelectZone, 
  onToggleNearMe, 
  isNearMeActive,
  onNavigate 
}) {
  const [searchInput, setSearchInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
      if (onNavigate) onNavigate("pandals");
    }
  };

  const quickHotspots = [
    { label: "📍 Near Me (GPS)", action: () => { onToggleNearMe(); if (onNavigate) onNavigate("pandals"); }, highlight: isNearMeActive },
    { label: "🚇 Pujo by Metro", action: () => { if (onNavigate) onNavigate("pandals"); }, isMetro: true },
    { label: "South Kolkata (179)", action: () => { onSelectZone("south"); if (onNavigate) onNavigate("pandals"); } },
    { label: "North Kolkata (98)", action: () => { onSelectZone("north"); if (onNavigate) onNavigate("pandals"); } },
    { label: "Central Heritage (62)", action: () => { onSelectZone("central"); if (onNavigate) onNavigate("pandals"); } },
    { label: "Salt Lake & East (43)", action: () => { onSelectZone("east"); if (onNavigate) onNavigate("pandals"); } },
    { label: "Suburbs & Bengal (26+)", action: () => { onSelectZone("howrah"); if (onNavigate) onNavigate("pandals"); } }
  ];

  return (
    <section id="hero" className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Background Decorative Radial Auras */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-rose-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Festive Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium mb-6 shadow-sm shadow-amber-500/10">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-bengali font-semibold">এবার পুজো, অন্য ভাবে</span>
            <span className="text-amber-400/40">|</span>
            <span className="text-amber-200">Kolkata'r Pujo, One Click Away</span>
          </div>

          {/* Durga Face Emblem with Logo */}
          <div className="relative mb-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#130E18] border-2 border-amber-500/30 p-2 shadow-2xl shadow-amber-500/10 relative overflow-hidden group">
              <img 
                src={logoImg} 
                alt="Aamar Pujo Emblem" 
                className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg">
              KOLKATA'R PUJO
            </div>
          </div>

          {/* Main Title */}
          <h1 className="font-heritage text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Aamar <span className="text-gold-gradient">Pujo</span>
          </h1>

          {/* Bengali Tagline */}
          <p className="font-bengali text-xl sm:text-2xl md:text-3xl font-bold text-amber-300/90 mb-3 tracking-wide">
            “এবার পুজো, অন্য ভাবে — এক ক্লিকে গোটা বাংলার পুজো ম্যাপ”
          </p>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-7 font-normal leading-relaxed">
            Navigate through <strong className="text-amber-400 font-semibold">503+ pandals</strong> across Kolkata & West Bengal. 
            Direct <strong className="text-rose-400 font-semibold">Google Maps turn-by-turn routing</strong> from your phone's live GPS location, 
            Metro connections, and authentic daily audio.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mb-5">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/40 via-rose-500/40 to-amber-500/40 rounded-2xl blur-md opacity-40 group-focus-within:opacity-80 transition duration-300" />
              <div className="relative flex items-center bg-[#140E1B] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
                <Search className="w-5 h-5 text-amber-400 ml-4 flex-shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search 503 pandals (e.g. Bagbazar, Suruchi, College Square, Kalighat...)"
                  className="w-full py-4 px-3.5 bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition shadow-md shadow-amber-500/20"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-3xl">
            {quickHotspots.map((h, i) => (
              <button
                key={i}
                onClick={h.action}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  h.isMetro
                    ? "bg-blue-600/30 text-blue-200 border-2 border-blue-400 font-bold shadow-md shadow-blue-600/30 hover:bg-blue-600/50 hover:text-white"
                    : h.highlight
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-amber-400/40 hover:text-amber-200"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Main Page Navigation Portal Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mb-4">
            <button
              onClick={() => onNavigate("pandals")}
              className="glass-card rounded-2xl p-4 text-left border-amber-500/20 hover:border-amber-400/50 transition group"
            >
              <Compass className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition" />
              <div className="font-heritage text-lg font-bold text-white">503 Pandals</div>
              <div className="text-[11px] text-slate-400">Directory & GPS ➔</div>
            </button>

            <button
              onClick={() => onNavigate("pipeline")}
              className="glass-card rounded-2xl p-4 text-left border-rose-500/20 hover:border-rose-400/50 transition group"
            >
              <Calendar className="w-6 h-6 text-rose-400 mb-2 group-hover:scale-110 transition" />
              <div className="font-heritage text-lg font-bold text-white">11-Day Flow</div>
              <div className="text-[11px] text-slate-400">Mahalaya to Dashami ➔</div>
            </button>

            <button
              onClick={() => onNavigate("map")}
              className="glass-card rounded-2xl p-4 text-left border-blue-500/20 hover:border-blue-400/50 transition group"
            >
              <MapPin className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition" />
              <div className="font-heritage text-lg font-bold text-white">WB Map</div>
              <div className="text-[11px] text-slate-400">All Districts Mapped ➔</div>
            </button>

            <button
              onClick={() => onNavigate("about")}
              className="glass-card rounded-2xl p-4 text-left border-emerald-500/20 hover:border-emerald-400/50 transition group"
            >
              <Info className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition" />
              <div className="font-heritage text-lg font-bold text-white">About & Feedback</div>
              <div className="text-[11px] text-slate-400">Subhadeep's Story ➔</div>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
