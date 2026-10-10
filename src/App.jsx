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
import { POPULAR_HUBS } from "./utils/geo";
import { PUJO_SONGS } from "./data/songsData";
import { ArrowUp, Music, Play, Pause, X, SkipForward, Disc3, Volume2, VolumeX } from "lucide-react";

export default function App() {
  // Strictly Segregated Current Page State: 'home' | 'pipeline' | 'pandals' | 'map' | 'melodies' | 'about'
  const [currentPage, setCurrentPage] = useState("home");

  // Geolocation & Filter State
  const [userLocation, setUserLocation] = useState(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedMetroStation, setSelectedMetroStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalPandal, setActiveModalPandal] = useState(null);

  // Centralized Audio Engine State
  const [trackIndex, setTrackIndex] = useState(0);
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

  // Handle "Near Me" GPS Tracking
  const handleToggleNearMe = () => {
    if (isNearMeActive) {
      setIsNearMeActive(false);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Centering on Central Kolkata.");
      setUserLocation({ lat: 22.5726, lng: 88.3639, name: "Central Kolkata" });
      setIsNearMeActive(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          isLive: true
        });
        setIsNearMeActive(true);
      },
      (error) => {
        console.warn("GPS error / permission denied:", error);
        const fallback = POPULAR_HUBS[1]; // Gariahat Crossing
        setUserLocation({
          lat: fallback.lat,
          lng: fallback.lng,
          name: fallback.name,
          isLive: false
        });
        setIsNearMeActive(true);
        alert("GPS access was not granted. Using Gariahat Crossing (South Kolkata) as your center point.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  return (
    <div className="min-h-screen bg-[#070509] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
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
          setTrackIndex(0); // Mahalaya: Bajlo Tomar Alor Benu
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
      />

      {/* Main View Container: STRICT PAGE-BY-PAGE SEGREGATION */}
      <main className={`flex-1 w-full max-w-full overflow-x-hidden ${isAudioPlaying && currentPage !== "melodies" ? "pb-28 sm:pb-16" : ""}`}>
        
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

        {/* PAGE 3: 500+ PANDALS DIRECTORY & FOOD NEAR ME */}
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
            <PandalMap
              userLocation={userLocation}
              selectedZone={selectedZone}
              onOpenModal={(pandal) => setActiveModalPandal(pandal)}
            />
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
        <div className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:w-[410px] max-w-[calc(100vw-24px)] z-40 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-500/50 shadow-2xl shadow-black/90 flex items-center justify-between animate-fadeIn bg-[#100B18]/95 backdrop-blur-xl">
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

    </div>
  );
}
