import React from "react";
import { 
  Home, 
  Compass, 
  LocateFixed, 
  Disc3, 
  Music,
  PhoneCall, 
  Radio
} from "lucide-react";

export default function BottomTaskbar({
  currentPage,
  setCurrentPage,
  isNearMeActive,
  onToggleNearMe,
  isAudioPlaying,
  onToggleAudio,
  onNavigateToHelpline
}) {
  const handleNearMeClick = () => {
    if (!isNearMeActive) {
      onToggleNearMe();
    }
    setCurrentPage("pandals");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMusicClick = () => {
    if (currentPage !== "melodies") {
      setCurrentPage("melodies");
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (!isAudioPlaying) {
        onToggleAudio();
      }
    } else {
      onToggleAudio();
    }
  };

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => {
        setCurrentPage("home");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      isActive: currentPage === "home"
    },
    {
      id: "map",
      label: "Route Map",
      icon: Compass,
      action: () => {
        setCurrentPage("map");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      isActive: currentPage === "map"
    },
    {
      id: "nearme",
      label: "Near Me",
      icon: isNearMeActive ? Radio : LocateFixed,
      action: handleNearMeClick,
      isActive: currentPage === "pandals" && isNearMeActive,
      isSpecial: isNearMeActive
    },
    {
      id: "music",
      label: "Music",
      icon: isAudioPlaying ? Disc3 : Music,
      action: handleMusicClick,
      isActive: currentPage === "melodies" || isAudioPlaying,
      isMusicPlaying: isAudioPlaying
    },
    {
      id: "helpline",
      label: "Helpline",
      icon: PhoneCall,
      action: onNavigateToHelpline,
      isActive: false,
      isEmergency: true
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0A0710]/95 backdrop-blur-xl border-t border-amber-500/25 shadow-2xl pb-[env(safe-area-inset-bottom,6px)] pt-1.5 px-2 select-none"
      role="navigation"
      aria-label="Mobile Bottom Taskbar"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer min-h-[48px] relative ${
                tab.isActive
                  ? "text-amber-400 font-black scale-105"
                  : "text-slate-400 hover:text-slate-200 font-semibold"
              }`}
            >
              {/* Active Tab Glow Pill */}
              {tab.isActive && (
                <div className="absolute inset-0 bg-amber-500/15 rounded-2xl -z-10 border border-amber-500/30" />
              )}

              {/* Icon Container with Animation Indicators */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    tab.isActive
                      ? "text-amber-400 stroke-[2.4]"
                      : tab.isEmergency
                      ? "text-rose-400"
                      : "text-slate-400"
                  } ${tab.isMusicPlaying ? "animate-spin text-amber-300" : ""}`}
                />

                {/* Pulsing indicator on Near Me GPS */}
                {tab.isSpecial && (
                  <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}

                {/* Music playing indicator badge */}
                {tab.isMusicPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-0.5 tracking-tight truncate ${
                  tab.isActive ? "text-amber-300 font-bold" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
