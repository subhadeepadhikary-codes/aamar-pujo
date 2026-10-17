import React, { useState, useRef, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroCarousel from "./components/HeroCarousel";
import Hero from "./components/Hero";
import PujaPipeline from "./components/PujaPipeline";
import PujoAudioPlayer from "./components/PujoAudioPlayer";
import PandalExplorer from "./components/PandalExplorer";
import PandalMap from "./components/PandalMap";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import PandalModal from "./components/PandalModal";
import FestiveWelcomeModal from "./components/FestiveWelcomeModal";
import DawonChatbot from "./components/DawonChatbot";
import TutorialSlideshowModal, { TOUR_STORAGE_KEY } from "./components/TutorialSlideshowModal";
import FullscreenPromptModal from "./components/FullscreenPromptModal";
import BottomTaskbar from "./components/BottomTaskbar";
import PwaInstallBanner from "./components/PwaInstallBanner";
import InteractiveSpotlightTour, { TOUR_COMPLETED_KEY } from "./components/InteractiveSpotlightTour";
import ApkAuthModal from "./components/ApkAuthModal";
import { isApkPlatform } from "./utils/platform";
import { getStoredApkUser } from "./utils/firebaseAuth";
import { POPULAR_HUBS } from "./utils/geo";
import { PUJO_SONGS } from "./data/songsData";
import ErrorBoundary from "./components/ErrorBoundary";
import { ArrowUp, Music, Play, Pause, X, SkipForward, Disc3, Volume2, VolumeX } from "lucide-react";

import { getCurrentTithiSongIndex } from "./utils/tithiMusic";

export default function App() {
  // Strictly Segregated Current Page State with Persistence: 'home' | 'pipeline' | 'pandals' | 'map' | 'melodies' | 'about'
  const [currentPage, setCurrentPage] = useState(() => {
    // 1. Check window.location.hash first
    const hash = window.location.hash;
    if (hash.startsWith("#p=") || hash.startsWith("#plan=") || hash === "#map") return "map";
    if (hash === "#pipeline") return "pipeline";
    if (hash === "#pandals") return "pandals";
    if (hash === "#melodies") return "melodies";
    if (hash === "#about") return "about";
    // 2. Check localStorage for last active page so returning from phone sleep stays in context
    try {
      const savedPage = localStorage.getItem("aamar_pujo_last_page");
      if (savedPage && ["home", "pipeline", "pandals", "map", "melodies", "about"].includes(savedPage)) {
        return savedPage;
      }
    } catch {
      // fallback
    }
    return "home";
  });

  // Tutorial Slideshow Modal State
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // FC Mobile Game-Style Clickable Spotlight Live Tutorial State
  const [showSpotlightTour, setShowSpotlightTour] = useState(false);

  // Android APK Google Firebase Auth Modal State (Strictly isolated to APK)
  const [showApkAuth, setShowApkAuth] = useState(() => {
    if (typeof window !== "undefined" && isApkPlatform()) {
      return !getStoredApkUser();
    }
    return false;
  });

  const handleApkAuthSuccess = (user) => {
    setShowApkAuth(false);
    // Trigger live game tutorial for newly authenticated APK user!
    setTimeout(() => {
      setShowSpotlightTour(true);
    }, 600);
  };

  // Geolocation & Filter State
  const [userLocation, setUserLocation] = useState(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [selectedZone, setSelectedZone] = useState(() => {
    try {
      return localStorage.getItem("aamar_pujo_last_zone") || "all";
    } catch {
      return "all";
    }
  });
  const [selectedMetroStation, setSelectedMetroStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalPandal, setActiveModalPandal] = useState(null);

  // Centralized Audio Engine State: dynamically initialized to the active lunar tithi track!
  const [trackIndex, setTrackIndex] = useState(() => getCurrentTithiSongIndex());
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(255);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const currentSong = PUJO_SONGS[trackIndex] || PUJO_SONGS[0];

  // Continuous audio control sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      if (isAudioPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Browser autoplay policy notice:", err);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAudioPlaying, trackIndex, volume, isMuted]);

  // Persist current page & zone to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("aamar_pujo_last_page", currentPage);
      localStorage.setItem("aamar_pujo_last_zone", selectedZone);
      // Synchronize window.location.hash smoothly if not already on a specific pandal or plan route
      if (currentPage === "home") {
        if (window.location.hash && window.location.hash !== "#" && window.location.hash !== "#home") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      } else {
        const targetHash = `#${currentPage}`;
        if (!window.location.hash.startsWith(targetHash) && !window.location.hash.startsWith("#p=") && !window.location.hash.startsWith("#plan=")) {
          window.history.replaceState(null, "", targetHash);
        }
      }
    } catch {
      // localStorage fallback
    }
  }, [currentPage, selectedZone]);

  // Synchronize URL hash with page navigation (handles #plan=... and footer quick links)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#p=") || hash.startsWith("#plan=") || hash === "#map") {
        setCurrentPage("map");
      } else if (hash === "#pipeline") {
        setCurrentPage("pipeline");
      } else if (hash === "#pandals") {
        setCurrentPage("pandals");
      } else if (hash === "#melodies") {
        setCurrentPage("melodies");
      } else if (hash === "#about") {
        setCurrentPage("about");
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Auto-prompt Feature Guide tour for first-time visitors with a gentle delay
  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!tourSeen) {
        const timer = setTimeout(() => {
          setShowTutorialModal(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const handleToggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsAudioPlaying(true);
        }).catch((err) => {
          console.warn("Audio unlock notice:", err);
        });
      }
    }
  };

  const handleNextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % PUJO_SONGS.length);
    setIsAudioPlaying(true);
  };

  const handlePrevTrack = () => {
    setTrackIndex((prev) => (prev - 1 + PUJO_SONGS.length) % PUJO_SONGS.length);
    setIsAudioPlaying(true);
  };

  const handleSelectTrack = (idx) => {
    setTrackIndex(idx);
    setIsAudioPlaying(true);
  };

  const handlePlayDaySong = (dayTrackId) => {
    const idx = PUJO_SONGS.findIndex((s) => s.dayId === dayTrackId);
    if (idx !== -1) {
      setTrackIndex(idx);
    }
    setIsAudioPlaying(true);
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    setIsMuted(newVol === 0);
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const nearMeWatchIdRef = useRef(null);

  // Clean up geolocation watch on unmount
  useEffect(() => {
    return () => {
      if (nearMeWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(nearMeWatchIdRef.current);
      }
    };
  }, []);

  // Handle "Near Me" GPS Tracking (Continuous Live Watcher)
  const handleToggleNearMe = () => {
    if (isNearMeActive) {
      if (nearMeWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(nearMeWatchIdRef.current);
        nearMeWatchIdRef.current = null;
      }
      setIsNearMeActive(false);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Centering on Central Kolkata.");
      setUserLocation({ lat: 22.5726, lng: 88.3639, name: "Central Kolkata" });
      setIsNearMeActive(true);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation((prev) => {
          // If we already hold an accurate GPS lock (< 25m), ignore wild cell-tower jumps (> 120m)
          if (prev?.isLive && prev.accuracy && prev.accuracy < 25 && accuracy > 120) {
            return prev;
          }
          return {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy),
            isLive: true
          };
        });
        setIsNearMeActive(true);
      },
      (error) => {
        console.warn("GPS error / permission denied:", error);
        if (error.code === error.PERMISSION_DENIED) {
          alert("📍 Location permission was denied. Please allow location access in your browser or phone settings to use Near Me GPS tracking.");
        } else if (error.code === error.TIMEOUT) {
          alert("📍 GPS search timed out while waiting for high-accuracy satellite lock. Please ensure Location is turned on with 'High Accuracy' mode in your phone settings.");
        } else {
          alert("📍 Unable to retrieve high-accuracy GPS coordinates at the moment. Please check your device location settings.");
        }
        setIsNearMeActive(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
    nearMeWatchIdRef.current = id;
  };

  const handleNavigateToHelpline = () => {
    setCurrentPage("about");
    setTimeout(() => {
      const el = document.getElementById("emergency-helpline");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 150);
  };

  return (
    <div className="min-h-[100dvh] bg-[#070509] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* Centralized Persistent HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong.streamUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNextTrack}
        preload="auto"
      />

      {/* Floating Bengali Festive Welcome Popup */}
      <FestiveWelcomeModal
        onStartWithMusic={() => {
          const currentTithiTrack = getCurrentTithiSongIndex();
          setTrackIndex(currentTithiTrack);
          handleToggleAudio();
        }}
        onExplore={() => {}}
      />

      {/* Top Persistent Navbar with Segregated Boundaries & Metro Dropdown */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onToggleNearMe={handleToggleNearMe}
        isNearMeActive={isNearMeActive}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        selectedMetroStation={selectedMetroStation}
        onSelectMetroStation={(st) => {
          setSelectedMetroStation(st);
          if (st) {
            setSelectedZone("all");
            setSearchQuery("");
          }
        }}
        onOpenTutorial={() => setShowTutorialModal(true)}
        onOpenSpotlightTour={() => setShowSpotlightTour(true)}
      />

      {/* Main View Container: STRICT PAGE-BY-PAGE SEGREGATION */}
      <main className={`flex-1 w-full max-w-full overflow-x-hidden ${isAudioPlaying && currentPage !== "melodies" ? "pb-44 sm:pb-16" : "pb-24 sm:pb-8"}`}>
        
        {/* PAGE 1: HOME (Hero Carousel + Search & Portal) */}
        {currentPage === "home" && (
          <div className="animate-fadeIn">
            {/* Top Full-Width Hero Slideshow Carousel (pandalgo-style) */}
            <HeroCarousel
              userLocation={userLocation}
              onNavigateToPandals={() => {
                setCurrentPage("pandals");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* Hero Search & Portal Hub */}
            <Hero
              onSearch={(q) => {
                setSearchQuery(q);
                setSelectedZone("all");
                setSelectedMetroStation(null);
              }}
              onSelectZone={(zoneId) => {
                setSelectedZone(zoneId);
                setSearchQuery("");
                setSelectedMetroStation(null);
              }}
              onToggleNearMe={handleToggleNearMe}
              isNearMeActive={isNearMeActive}
              onNavigate={(pageId) => {
                setCurrentPage(pageId);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}

        {/* PAGE 2: PIPELINE FLOW (11 Days Mahalaya to Dashami) */}
        {currentPage === "pipeline" && (
          <div className="animate-fadeIn">
            <PujaPipeline onPlayDaySong={handlePlayDaySong} />
          </div>
        )}

        {/* PAGE 3: 781+ PANDALS DIRECTORY & FOOD NEAR ME */}
        {currentPage === "pandals" && (
          <div className="animate-fadeIn">
            <PandalExplorer
              userLocation={userLocation}
              isNearMeActive={isNearMeActive}
              onToggleNearMe={handleToggleNearMe}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenModal={(pandal) => setActiveModalPandal(pandal)}
              selectedMetroStation={selectedMetroStation}
              onSelectMetroStation={(st) => {
                setSelectedMetroStation(st);
                if (st) {
                  setSelectedZone("all");
                  setSearchQuery("");
                }
              }}
            />
          </div>
        )}

        {/* PAGE 4: INTERACTIVE MAP (Free OpenStreetMap West Bengal & Kolkata) */}
        {currentPage === "map" && (
          <div className="animate-fadeIn">
            <ErrorBoundary onReset={() => setCurrentPage("map")}>
              <PandalMap
                userLocation={userLocation}
                selectedZone={selectedZone}
                onOpenModal={(pandal) => setActiveModalPandal(pandal)}
                onUpdateUserLocation={(newLoc) => setUserLocation(newLoc)}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* PAGE 5: DAILY MELODIES (Curated Songs from YouTube Compilation) */}
        {currentPage === "melodies" && (
          <div className="animate-fadeIn">
            <PujoAudioPlayer
              currentSong={currentSong}
              trackIndex={trackIndex}
              isPlaying={isAudioPlaying}
              onTogglePlay={handleToggleAudio}
              onNextTrack={handleNextTrack}
              onPrevTrack={handlePrevTrack}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onSelectTrack={handleSelectTrack}
            />
          </div>
        )}

        {/* PAGE 6: ABOUT CREATOR & COMMUNITY FEEDBACK (Subhadeep's Story) */}
        {currentPage === "about" && (
          <div className="animate-fadeIn">
            <AboutSection />
          </div>
        )}

      </main>

      {/* Bottom Persistent Footer */}
      <Footer />

      {/* Expanded Pandal Modal (Active on any page if triggered) */}
      {activeModalPandal && (
        <PandalModal
          pandal={activeModalPandal}
          userLocation={userLocation}
          onClose={() => setActiveModalPandal(null)}
        />
      )}

      {/* Persistent Mini Audio Player Strip (Mobile Responsive & Never Cuts Off) */}
      {isAudioPlaying && currentPage !== "melodies" && (
        <div className="fixed bottom-[68px] sm:bottom-4 left-3 right-3 sm:left-6 sm:right-auto sm:w-[410px] max-w-[calc(100vw-24px)] z-40 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-500/50 shadow-2xl shadow-black/90 flex items-center justify-between animate-fadeIn bg-[#100B18]/95 backdrop-blur-xl">
          <div 
            onClick={() => {
              setCurrentPage("melodies");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group flex-1 min-w-0 mr-2 sm:mr-3"
            title="Click to open Daily Melodies Lounge"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex-shrink-0 border border-amber-500/40 shadow-md">
              <img 
                src={currentSong.image || "/images/durga/durga_face_1.jpg"} 
                alt={currentSong.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/durga/durga_face_1.jpg";
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-spin" />
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bengali truncate">
                  {currentSong.dayName}
                </span>
                <span className="text-[9px] text-slate-400 font-mono hidden xs:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <span className="text-xs font-bold text-white group-hover:text-amber-300 transition block truncate mt-0.5">
                {currentSong.title}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {currentSong.artist}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
            <button
              onClick={handleToggleAudio}
              className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-black hover:scale-105 transition shadow-md shadow-rose-600/30 cursor-pointer"
              title={isAudioPlaying ? "Pause Audio" : "Play Audio"}
            >
              {isAudioPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={handleNextTrack}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition border border-white/10 cursor-pointer"
              title="Next Song"
            >
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setIsAudioPlaying(false)}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Close Player"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Transit Chatbot "Dawon" */}
      <DawonChatbot
        userLocation={userLocation}
        onNavigateToPandal={() => {
          setCurrentPage("pandals");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        isAudioPlaying={isAudioPlaying && currentPage !== "melodies"}
      />

      {/* Mobile PWA Install Prompt Banner (Floats right above bottom taskbar) */}
      <PwaInstallBanner />

      {/* Mobile Persistent Bottom Taskbar */}
      <BottomTaskbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isNearMeActive={isNearMeActive}
        onToggleNearMe={handleToggleNearMe}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        onNavigateToHelpline={handleNavigateToHelpline}
      />

      {/* Feature Guide & Interactive Tutorial Slideshow Modal */}
      <TutorialSlideshowModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
      />

      {/* First-Visit Mobile Fullscreen Permission Popup (Clean English) */}
      <FullscreenPromptModal
        onComplete={() => {
          try {
            const tourSeen = localStorage.getItem(TOUR_STORAGE_KEY);
            if (!tourSeen) {
              setTimeout(() => setShowTutorialModal(true), 800);
            }
          } catch {
            // fallback
          }
        }}
      />

      {/* FC Mobile Game-Style Clickable Live Spotlight Tour */}
      <InteractiveSpotlightTour
        isOpen={showSpotlightTour}
        onComplete={() => setShowSpotlightTour(false)}
        onSkip={() => setShowSpotlightTour(false)}
      />

      {/* Android APK Google Firebase Auth Modal (ONLY in APK / ?platform=apk) */}
      {showApkAuth && (
        <ApkAuthModal
          isOpen={showApkAuth}
          onClose={() => setShowApkAuth(false)}
          onSuccess={handleApkAuthSuccess}
        />
      )}

    </div>
  );
}
