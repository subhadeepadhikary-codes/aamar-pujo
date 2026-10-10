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
  Sparkles,
  ExternalLink,
  MessageSquareHeart,
  Check,
  Navigation
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
  const [metroModalOpen, setMetroModalOpen] = useState(false);
  const [metroDropdownOpen, setMetroDropdownOpen] = useState(false);
  const [metroLineFilter, setMetroLineFilter] = useState("all");
  const metroDropdownRef = useRef(null);

  const navItems = [
    { id: "home", label: "Home", bengali: "হোম", icon: Home, desc: "Pujo Spotlight & Highlights" },
    { id: "pipeline", label: "Pipeline Flow", bengali: "পুজো প্রবাহ", icon: Calendar, badge: "11 Days", desc: "Mahalaya to Bijoya Dashami" },
    { id: "pandals", label: "500+ Pandals", bengali: "প্যান্ডেল ও খাদ্য", icon: Compass, badge: "503", desc: "Full Directory & Food Trail" },
    { id: "map", label: "Interactive Map", bengali: "পশ্চিমবঙ্গ ম্যাপ", icon: MapPin, desc: "Free Geospatial Leaflet Map" },
    { id: "melodies", label: "Daily Melodies", bengali: "শারদীয় সুর", icon: Music, desc: "Curated Agomoni Songs" },
    { id: "about", label: "About Creator", bengali: "আমাদের কথা", icon: Info, desc: "Story, Fair Use & Feedback" }
  ];

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (metroDropdownRef.current && !metroDropdownRef.current.contains(event.target)) {
        setMetroDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile drawer or metro modal is open
  useEffect(() => {
    if (mobileMenuOpen || metroModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, metroModalOpen]);

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    setMetroDropdownOpen(false);
    setMetroModalOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectStation = (station) => {
    if (onSelectMetroStation) {
      onSelectMetroStation(station);
    }
    setCurrentPage("pandals");
    setMetroDropdownOpen(false);
    setMetroModalOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredStations = METRO_STATIONS.filter((st) => {
    if (metroLineFilter === "all") return true;
    return st.line === metroLineFilter;
  });

  return (
    <header className="sticky top-0 z-50 bg-[#0A070D]/95 backdrop-blur-xl border-b border-amber-500/20 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-rose-600 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition duration-300" />
              <img 
                src={logoImg} 
                alt="Aamar Pujo Logo" 
                className="relative w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-full bg-[#120D17] border border-amber-400/40 p-0.5 transform group-hover:scale-105 transition duration-300" 
              />
            </div>
            <div>
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="font-heritage text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition">
                  Aamar<span className="text-amber-400">Pujo</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Flame className="w-2.5 h-2.5 mr-0.5 text-rose-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="hidden md:block text-[11px] font-bengali text-amber-200/80 tracking-wide">
                এবার পুজো, অন্য ভাবে · <span className="font-sans text-[10px] text-slate-400">One Click Away</span>
              </p>
            </div>
          </div>

          {/* Desktop Segregated Nav Dock (Hidden on mobile) */}
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

            {/* Desktop Pujo by Metro Dropdown Button */}
            <div className="relative" ref={metroDropdownRef}>
              <button
                onClick={() => setMetroDropdownOpen(!metroDropdownOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedMetroStation
                    ? "bg-blue-900/40 text-blue-300 border-blue-400 shadow-md ring-2 ring-blue-400/30"
                    : "bg-[#181124] text-slate-300 border-white/20 hover:border-amber-400/60 hover:text-white hover:bg-[#201530]"
                }`}
                title="Filter Pandals by Kolkata Metro Stations"
              >
                <Train className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedMetroStation ? selectedMetroStation.name : "Pujo by Metro"}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${metroDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Metro Dropdown Panel (Desktop) */}
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
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {METRO_STATIONS.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelectStation(st)}
                        className={`w-full p-2 rounded-xl text-left text-xs transition flex items-center justify-between border ${
                          selectedMetroStation?.id === st.id
                            ? "bg-blue-600/30 text-white font-bold border-blue-400"
                            : "bg-white/5 hover:bg-white/10 text-slate-300 border-transparent hover:border-white/10"
                        }`}
                      >
                        <div>
                          <span className="block">{st.name}</span>
                          <span className="text-[10px] text-slate-400 font-bengali block">{st.bengaliName}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          st.line === "blue" ? "bg-blue-500/20 text-blue-300" :
                          st.line === "green" ? "bg-emerald-500/20 text-emerald-300" :
                          "bg-purple-500/20 text-purple-300"
                        }`}>
                          {st.line}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Controls (Ultra Compact & Mobile Friendly - Never Overflows) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            
            {/* 🚇 Pujo by Metro Quick Access Button (Always Visible on Mobile & Desktop) */}
            <button
              onClick={() => setMetroModalOpen(true)}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                selectedMetroStation
                  ? "bg-blue-600/40 text-blue-200 border-blue-400 ring-2 ring-blue-400/40 animate-pulse"
                  : "bg-[#141226] text-blue-300 border-blue-500/40 hover:border-blue-400 hover:bg-[#1E1B38]"
              }`}
              title="Filter Pandals by Kolkata Metro Stations"
            >
              <Train className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs">
                {selectedMetroStation ? selectedMetroStation.name.split(" ")[0] : "Metro"}
              </span>
              {selectedMetroStation && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              )}
            </button>

            {/* 📍 Near Me GPS Button */}
            <button
              onClick={() => {
                onToggleNearMe();
                setCurrentPage("pandals");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                isNearMeActive
                  ? "bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/40 animate-pulse"
                  : "bg-[#1E0D1A] text-rose-200 border-rose-500/50 hover:border-rose-400 hover:bg-[#2A1224]"
              }`}
              title="Track nearest pandals from your current GPS location"
            >
              <MapPin className={`w-3.5 h-3.5 ${isNearMeActive ? "text-white" : "text-rose-400"} flex-shrink-0`} />
              <span className="text-[11px] sm:text-xs">GPS</span>
            </button>

            {/* 🔊 Audio Toggle Button */}
            <button
              onClick={onToggleAudio}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition border shadow-sm ${
                isAudioPlaying 
                  ? "bg-[#25170B] text-amber-300 border-amber-400 ring-1 ring-amber-400/30"
                  : "bg-[#181122] text-slate-300 border-white/20 hover:border-amber-400/60 hover:bg-[#20152D]"
              }`}
              title={isAudioPlaying ? "Mute Bengali Pujo Audio" : "Play Bengali Pujo Audio"}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden md:inline text-[11px] text-amber-300 font-semibold">Audio</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline text-[11px] text-slate-400 font-semibold">Audio</span>
                </>
              )}
            </button>

            {/* ☰ Prominent Side Column Drawer Toggle Button (Mobile / Tablet) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-amber-500/25 text-amber-300 border-2 border-amber-400/80 shadow-md hover:scale-105 active:scale-95 transition"
              aria-label="Open side column navigation menu"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-wider font-heritage text-white">Menu</span>
            </button>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 SIDE COLUMN-WISE OFF-CANVAS DRAWER (Mobile Navigation Experience) */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          {/* Frosted Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 max-w-[88vw] bg-gradient-to-b from-[#180E24] via-[#100A1A] to-[#0A0512] border-l-2 border-amber-500/40 z-50 shadow-2xl flex flex-col animate-slideInRight overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-[#221233] via-[#170C24] to-[#221233] border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img 
                  src={logoImg} 
                  alt="Aamar Pujo Logo" 
                  className="w-9 h-9 object-contain rounded-full bg-[#120D17] border border-amber-400/40 p-0.5" 
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-heritage text-base font-black text-white">
                      Aamar<span className="text-amber-400">Pujo</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Live
                    </span>
                  </div>
                  <p className="text-[10px] font-bengali text-amber-300/80">
                    এবার পুজো, অন্য ভাবে
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/40 text-slate-300 hover:text-white border border-white/10 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body: Column-wise Segregated List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              
              {/* Highlighted Feature: Pujo by Metro Button */}
              <div className="bg-gradient-to-r from-blue-950/60 via-blue-900/40 to-blue-950/60 rounded-2xl p-3 border-2 border-blue-400/60 shadow-lg shadow-blue-950/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-blue-300 font-bold text-xs">
                    <Train className="w-4 h-4 text-blue-400" />
                    <span>Pujo by Metro (মেট্রো স্টেশন)</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                    24 Stations
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mb-2.5">
                  Filter all 503 pandals by your nearest Kolkata Metro station:
                </p>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMetroModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>{selectedMetroStation ? `Selected: ${selectedMetroStation.name}` : "Select Metro Station ➔"}</span>
                </button>
              </div>

              {/* Segregated Pages (Column-wise Cards) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80 px-1 block">
                  Segregated Pages (বিভাগ সমূহ)
                </span>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all border ${
                        isActive
                          ? "bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-amber-500/25 text-amber-300 border-amber-400/90 shadow-lg shadow-amber-500/20 font-bold"
                          : "bg-[#150D20] text-slate-200 border-white/10 hover:border-amber-400/40 hover:bg-[#1D122C]"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isActive 
                            ? "bg-amber-400 text-slate-950 font-bold" 
                            : "bg-white/5 text-amber-400 border border-white/10"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold truncate">{item.label}</span>
                            <span className="text-[10px] text-amber-300/80 font-bengali truncate font-normal">
                              ({item.bengali})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {item.badge ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold flex-shrink-0 ml-1">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Strip */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
                  Quick Controls
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onToggleNearMe();
                      setCurrentPage("pandals");
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isNearMeActive 
                        ? "bg-rose-600 text-white border-rose-400" 
                        : "bg-white/5 text-slate-300 border-white/10"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 mb-1 text-rose-400" />
                    <span className="text-xs font-bold block">Live GPS</span>
                    <span className="text-[9px] text-slate-400 block">{isNearMeActive ? "Active" : "Tap to track"}</span>
                  </button>

                  <button
                    onClick={onToggleAudio}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isAudioPlaying 
                        ? "bg-amber-500/20 text-amber-300 border-amber-400" 
                        : "bg-white/5 text-slate-300 border-white/10"
                    }`}
                  >
                    <Music className="w-3.5 h-3.5 mb-1 text-amber-400" />
                    <span className="text-xs font-bold block">Pujo Audio</span>
                    <span className="text-[9px] text-slate-400 block">{isAudioPlaying ? "Playing" : "Muted"}</span>
                  </button>
                </div>

                {/* Direct Feedback Link Card */}
                <a
                  href="https://forms.gle/qpq8CS3kgwwcpkri7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-bold hover:border-amber-400 transition"
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquareHeart className="w-4 h-4 text-rose-400 fill-current" />
                    <span>Give Feedback & Suggestions</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-black/50 border-t border-white/10 text-center text-[10px] text-slate-400">
              <p>Crafted with pride by <strong className="text-white">Subhadeep Adhikary</strong> ❤️</p>
              <p className="text-[9px] text-amber-300/70 pt-0.5">Section 52 Non-Commercial Cultural Heritage</p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚇 FULL METRO STATION SELECTOR MODAL / BOTTOM SHEET (Mobile & Desktop) */}
      {/* ========================================================================= */}
      {metroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          {/* Backdrop */}
          <div 
            onClick={() => setMetroModalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          {/* Sheet Container */}
          <div className="relative w-full sm:w-[560px] max-h-[85vh] bg-gradient-to-b from-[#180F25] via-[#120B1C] to-[#0A0612] border-t-2 sm:border-2 border-blue-400/50 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col z-50 animate-slideUp overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heritage text-base sm:text-lg font-black text-white">
                    Pujo by Metro <span className="font-bengali text-blue-300 text-xs sm:text-sm">(মেট্রো স্টেশন)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Select a station to filter all 503 pandals within walking proximity
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMetroModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/40 text-slate-300 hover:text-white border border-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Line Filter Tabs */}
            <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setMetroLineFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  metroLineFilter === "all"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                All Stations ({METRO_STATIONS.length})
              </button>
              <button
                onClick={() => setMetroLineFilter("blue")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  metroLineFilter === "blue"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                🔵 Blue Line (North-South)
              </button>
              <button
                onClick={() => setMetroLineFilter("green")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  metroLineFilter === "green"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                🟢 Green Line (Underwater / Salt Lake)
              </button>
              <button
                onClick={() => setMetroLineFilter("purple")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  metroLineFilter === "purple"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                🟣 Purple Line (Behala)
              </button>
            </div>

            {/* Stations Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3 scrollbar-thin">
              {filteredStations.map((st) => {
                const isSelected = selectedMetroStation?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStation(st)}
                    className={`p-3 rounded-2xl text-left transition flex items-center justify-between border ${
                      isSelected
                        ? "bg-blue-600/40 text-white font-bold border-blue-400 ring-2 ring-blue-400/30 shadow-md"
                        : "bg-[#140D1E] hover:bg-[#1D132B] text-slate-200 border-white/10 hover:border-blue-400/50"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          st.line === "blue" ? "bg-blue-400" :
                          st.line === "green" ? "bg-emerald-400" :
                          "bg-purple-400"
                        }`} />
                        <span className="text-xs font-bold truncate">{st.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bengali block truncate mt-0.5">
                        {st.bengaliName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        st.line === "blue" ? "bg-blue-500/20 text-blue-300" :
                        st.line === "green" ? "bg-emerald-500/20 text-emerald-300" :
                        "bg-purple-500/20 text-purple-300"
                      }`}>
                        {st.line}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-300 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Bottom Reset Controls */}
            {selectedMetroStation && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Active Filter: <strong className="text-blue-300">{selectedMetroStation.name}</strong>
                </span>
                <button
                  onClick={() => handleSelectStation(null)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-bold transition"
                >
                  Clear Filter (Show All 503)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </header>
  );
}
