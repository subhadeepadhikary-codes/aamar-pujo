import React, { useState, useRef, useEffect } from "react";
import logoImg from "../assets/logo.png";
import { METRO_STATIONS } from "../data/metroData";
import { 
  Compass, 
  MapPin, 
  Music, 
  Calendar, 
  Info, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  Flame,
  Home,
  Train,
  ChevronDown,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  onToggleNearMe, 
  isNearMeActive,
  isAudioPlaying,
  onToggleAudio,
  selectedMetroStation,
  onSelectMetroStation
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [metroDropdownOpen, setMetroDropdownOpen] = useState(false);
  const [mobileMetroExpanded, setMobileMetroExpanded] = useState(false);
  const metroDropdownRef = useRef(null);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "pipeline", label: "Pipeline Flow", icon: Calendar, badge: "11 Days" },
    { id: "pandals", label: "500+ Pandals", icon: Compass, badge: "503" },
    { id: "map", label: "Interactive Map", icon: MapPin },
    { id: "melodies", label: "Daily Melodies", icon: Music },
    { id: "about", label: "About Creator", icon: Info }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (metroDropdownRef.current && !metroDropdownRef.current.contains(event.target)) {
        setMetroDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    setMetroDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectStation = (station) => {
    if (onSelectMetroStation) {
      onSelectMetroStation(station);
    }
    setCurrentPage("pandals");
    setMetroDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A070D]/95 backdrop-blur-xl border-b border-amber-500/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-rose-600 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition duration-300" />
              <img 
                src={logoImg} 
                alt="Aamar Pujo Logo" 
                className="relative w-12 h-12 object-contain rounded-full bg-[#120D17] border border-amber-400/40 p-0.5 transform group-hover:scale-105 transition duration-300" 
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-heritage text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition">
                  Aamar<span className="text-amber-400">Pujo</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Flame className="w-2.5 h-2.5 mr-0.5 text-rose-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] font-bengali text-amber-200/80 tracking-wide">
                এবার পুজো, অন্য ভাবে · <span className="font-sans text-[10px] text-slate-400">One Click Away</span>
              </p>
            </div>
          </div>

          {/* Desktop Segregated Nav Dock with Visible Option Boundaries */}
          <nav className="hidden lg:flex items-center bg-[#0E0A14] border-2 border-amber-500/30 p-1.5 rounded-2xl shadow-2xl shadow-black/60 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/30 via-rose-500/20 to-amber-500/30 text-amber-300 border-2 border-amber-400 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/20 font-extrabold"
                      : "bg-[#181124] text-slate-300 border border-white/20 hover:border-amber-400/60 hover:text-white hover:bg-[#201530] shadow-sm"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-amber-300/70"}`} />
                  <span className="tracking-wide">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold ml-0.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Pujo by Metro Dropdown Button */}
            <div className="relative" ref={metroDropdownRef}>
              <button
                onClick={() => setMetroDropdownOpen(!metroDropdownOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedMetroStation
                    ? "bg-blue-900/30 text-blue-300 border-blue-400 shadow-md ring-1 ring-blue-400/30"
                    : "bg-[#181124] text-slate-300 border-white/20 hover:border-amber-400/60 hover:text-white hover:bg-[#201530]"
                }`}
                title="Filter Pandals by Kolkata Metro Stations"
              >
                <Train className="w-3.5 h-3.5 text-blue-400" />
                <span>Pujo by Metro</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${metroDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Metro Dropdown Panel */}
              {metroDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#120B1C] border-2 border-amber-500/30 rounded-2xl p-3 shadow-2xl shadow-black/80 z-50 animate-fadeIn text-left">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                      <Train className="w-3.5 h-3.5 text-blue-400" />
                      <span>Select Metro Station</span>
                    </span>
                    {selectedMetroStation && (
                      <button
                        onClick={() => handleSelectStation(null)}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {/* Blue Line Section */}
                    <div>
                      <div className="flex items-center space-x-1 text-[11px] font-bold text-blue-400 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Blue Line (North-South Corridor)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {METRO_STATIONS.filter(s => s.line === "blue").map(st => (
                          <button
                            key={st.id}
                            onClick={() => handleSelectStation(st)}
                            className={`p-1.5 rounded-lg text-left text-[11px] transition truncate border ${
                              selectedMetroStation?.id === st.id
                                ? "bg-blue-600 text-white font-bold border-blue-400"
                                : "bg-white/5 hover:bg-white/10 text-slate-300 border-transparent hover:border-white/10"
                            }`}
                          >
                            <span className="block truncate">{st.name}</span>
                            <span className="text-[9px] text-slate-400 font-bengali block truncate">{st.bengaliName}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Green Line Section */}
                    <div>
                      <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-400 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Green Line (East-West & Salt Lake)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {METRO_STATIONS.filter(s => s.line === "green").map(st => (
                          <button
                            key={st.id}
                            onClick={() => handleSelectStation(st)}
                            className={`p-1.5 rounded-lg text-left text-[11px] transition truncate border ${
                              selectedMetroStation?.id === st.id
                                ? "bg-emerald-600 text-white font-bold border-emerald-400"
                                : "bg-white/5 hover:bg-white/10 text-slate-300 border-transparent hover:border-white/10"
                            }`}
                          >
                            <span className="block truncate">{st.name}</span>
                            <span className="text-[9px] text-slate-400 font-bengali block truncate">{st.bengaliName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </nav>

          {/* Right Action Segments (Near Me & Audio) with Distinct Outlines */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Near Me GPS Boundary Button */}
            <button
              onClick={() => {
                onToggleNearMe();
                setCurrentPage("pandals");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2 shadow-md ${
                isNearMeActive
                  ? "bg-rose-600 text-white border-rose-400 shadow-rose-600/30 ring-2 ring-rose-400/40 animate-pulse"
                  : "bg-[#1E0D1A] hover:bg-[#2A1224] text-rose-200 border-rose-500/50 hover:border-rose-400"
              }`}
              title="Track nearest pandals from your current GPS location"
            >
              <MapPin className={`w-3.5 h-3.5 ${isNearMeActive ? "text-white" : "text-rose-400"}`} />
              <span className="hidden sm:inline">Near Me</span>
              <span className="sm:hidden">GPS</span>
            </button>

            {/* Audio Toggle Boundary Button */}
            <button
              onClick={onToggleAudio}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border-2 shadow-md ${
                isAudioPlaying 
                  ? "bg-[#25170B] text-amber-300 border-amber-400 shadow-amber-500/20 ring-1 ring-amber-400/30"
                  : "bg-[#181122] hover:bg-[#20152D] text-slate-300 border-white/20 hover:border-amber-400/60"
              }`}
              title={isAudioPlaying ? "Mute Bengali Pujo Audio" : "Play Bengali Pujo Audio"}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden md:inline text-[11px] text-amber-300 font-semibold">Pujo Audio</span>
                  <span className="flex space-x-0.5 items-end h-3">
                    <span className="w-0.5 h-2 bg-amber-400 animate-pulse" />
                    <span className="w-0.5 h-3 bg-amber-400 animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse delay-150" />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline text-[11px] text-slate-400 font-semibold">Pujo Audio</span>
                </>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer with Segregated Option Outlines (Fully Mobile Responsive) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#100C14] border-b border-amber-500/20 px-4 pt-3 pb-5 space-y-2 animate-fadeIn max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                onToggleNearMe();
                setCurrentPage("pandals");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold border ${
                isNearMeActive ? "bg-rose-600 text-white border-rose-400" : "bg-white/5 text-slate-300 border-white/10"
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Near Me (GPS)</span>
            </button>
            <button
              onClick={() => {
                onToggleAudio();
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold border ${
                isAudioPlaying ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-white/5 text-slate-300 border-white/10"
              }`}
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span>{isAudioPlaying ? "Stop Audio" : "Play Audio"}</span>
            </button>
          </div>

          {/* Navigation Items List */}
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition border ${
                    isActive 
                      ? "bg-amber-500/25 text-amber-300 border-amber-400/80 shadow-md font-bold" 
                      : "bg-[#160E21]/70 text-slate-200 border-white/10 hover:bg-white/5 hover:text-amber-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Pujo by Metro Drawer Accordion */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#160E21]/50">
              <button
                onClick={() => setMobileMetroExpanded(!mobileMetroExpanded)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:text-amber-300"
              >
                <div className="flex items-center space-x-3">
                  <Train className="w-4 h-4 text-blue-400" />
                  <span>🚇 Pujo by Metro Stations</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileMetroExpanded ? "rotate-180" : ""}`} />
              </button>

              {mobileMetroExpanded && (
                <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/5 bg-black/40">
                  <p className="text-[11px] text-slate-400">
                    Tap a station to see connected pandals:
                  </p>
                  <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                    {METRO_STATIONS.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelectStation(st)}
                        className={`p-2 rounded-lg text-left text-xs transition truncate border ${
                          selectedMetroStation?.id === st.id
                            ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                            : "bg-white/5 text-slate-300 border-white/5"
                        }`}
                      >
                        <span className="block truncate">{st.name}</span>
                        <span className="text-[9px] text-slate-400 font-bengali block truncate">{st.bengaliName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bengali">এবার পুজো, অন্য ভাবে</span>
            <span>Studio Master Audio Ready</span>
          </div>
        </div>
      )}
    </header>
  );
}
