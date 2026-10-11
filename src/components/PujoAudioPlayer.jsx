import React, { useState } from "react";
import { getDurgaFace } from "../utils/imageFallback";
import { PUJO_SONGS } from "../data/songsData";
import { getCurrentTithiSongIndex } from "../utils/tithiMusic";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Music, 
  Radio, 
  Sparkles, 
  Flame, 
  Info,
  CheckCircle2,
  BellRing,
  Disc3
} from "lucide-react";

export default function PujoAudioPlayer({ 
  currentSong: propSong,
  trackIndex = 0,
  isPlaying = false,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  currentTime = 0,
  duration = 255,
  onSeek,
  volume = 0.9,
  onVolumeChange,
  isMuted = false,
  onToggleMute,
  onSelectTrack
}) {
  const [showLyrics, setShowLyrics] = useState(true);

  const currentSong = propSong || PUJO_SONGS[trackIndex] || PUJO_SONGS[0];

  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <section id="melodies" className="py-12 md:py-20 bg-[#08050B] min-h-[85vh] relative overflow-hidden flex flex-col justify-center">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Agomoni Heritage Collection · All 11 Days Studio Mastered</span>
          </div>
          <h2 className="font-heritage text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            Daily Bengali <span className="text-festive-gradient">Pujo Melodies</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Enjoy authentic recordings from Akashvani Mahalaya, Shreya Ghoshal, Monali Thakur, 
            and traditional Dhak masters in rich 320kbps studio audio.
          </p>
        </div>

        {/* Main Audio Player Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 border border-amber-500/25 shadow-2xl relative max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Album Cover & Visualizer */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-3xl overflow-hidden p-2 bg-[#1C1224] border-2 border-amber-500/40 shadow-2xl shadow-amber-500/15 mb-4 group">
                <img
                  src={currentSong.image || getDurgaFace(currentSong.dayId || 1)}
                  alt={currentSong.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getDurgaFace(currentSong.dayId || 1);
                  }}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition duration-500"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none rounded-2xl" />

                {/* Animated Disc Badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                  <span className="flex items-center space-x-1">
                    <Disc3 className={`w-4 h-4 text-amber-400 ${isPlaying ? "animate-spin" : ""}`} />
                    <span className="text-[11px] font-sans">Studio Master</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-[10px]">
                    320 kbps
                  </span>
                </div>
              </div>

              <div className="text-center">
                <span className="font-bengali text-base font-bold text-amber-300 block">
                  {currentSong.dayName}
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentSong.tithi}
                </span>
              </div>
            </div>

            {/* Right: Controls & Details */}
            <div className="lg:col-span-7 space-y-5">
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Day {trackIndex + 1} of {PUJO_SONGS.length} · {currentSong.tithi}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <h3 className="font-heritage text-2xl sm:text-3xl font-black text-white mt-1">
                  {currentSong.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-amber-300/90 mt-0.5">
                  🎤 {currentSong.artist}
                </p>
              </div>

              {/* Scrubber Bar */}
              <div>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#251A31] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Playback Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onPrevTrack}
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Previous Day Track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={onTogglePlay}
                    className="p-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:scale-105 transition shadow-lg shadow-rose-600/30"
                    title={isPlaying ? "Pause" : "Play Track"}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={onNextTrack}
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Next Day Track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center space-x-2">
                  <button onClick={onToggleMute} className="text-slate-400 hover:text-white">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1.5 bg-[#251A31] rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>

              {/* Meaning & Lyrics Box */}
              <div className="bg-[#120B18] rounded-2xl p-4.5 border border-amber-500/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cultural Theme: {currentSong.theme}</span>
                  </span>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="text-[11px] text-slate-400 hover:text-amber-300 underline"
                  >
                    {showLyrics ? "Hide Shloka" : "Show Shloka"}
                  </button>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentSong.meaning}
                </p>

                {showLyrics && currentSong.lyricsSnippet && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="font-bengali text-xs sm:text-sm text-amber-200/90 italic">
                      “{currentSong.lyricsSnippet}”
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Day Selector Buttons Strip (Mahalaya to Dashami) */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Switch Day Track (Mahalaya to Dashami):
              </p>
              <span className="text-[11px] text-amber-400 font-medium flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Synchronized with 2026 Lunar Tithi Timings</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
              {PUJO_SONGS.map((song, idx) => {
                const isTodayTithi = getCurrentTithiSongIndex() === idx;
                return (
                  <button
                    key={song.dayId}
                    onClick={() => onSelectTrack && onSelectTrack(idx)}
                    className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center space-x-1.5 ${
                      trackIndex === idx
                        ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-amber-400/30"
                    }`}
                  >
                    <span className="font-bengali">{song.dayName}</span>
                    {isTodayTithi && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        trackIndex === idx ? "bg-slate-950 text-amber-300" : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      }`}>
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
