import React, { useState } from "react";
import { 
  X, 
  MapPin, 
  Navigation, 
  Train, 
  Clock, 
  Users, 
  Award, 
  Sparkles, 
  Utensils, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Check
} from "lucide-react";
import { formatDistance } from "../utils/geo";
import { getDurgaFace } from "../utils/imageFallback";
import { buildGoogleMapsNavUrl } from "../utils/navigationHelper";
import { isPandalVisited, togglePandalVisited } from "../utils/visitedStorage";
import { getInstaBuzzByPandal } from "../utils/instaBuzzData";

export default function PandalModal({ pandal, userLocation, onClose }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isVisited, setIsVisited] = useState(() => isPandalVisited(pandal?.id));

  if (!pandal) return null;

  const instaBuzz = getInstaBuzzByPandal(pandal);
  const fallbackImg = getDurgaFace(pandal.id);
  const images = pandal.images && pandal.images.length > 0 ? pandal.images : [fallbackImg];

  const handleToggleVisited = () => {
    const next = togglePandalVisited(pandal.id);
    setIsVisited(next);
  };

  // Generalized Google Maps Turn-by-Turn Navigation URL
  const navUrl = buildGoogleMapsNavUrl(pandal, userLocation);

  const nextPhoto = () => setActivePhotoIdx((prev) => (prev + 1) % images.length);
  const prevPhoto = () => setActivePhotoIdx((prev) => (prev - 1 + images.length) % images.length);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${pandal.name} · Aamar Pujo`,
        text: `Let's visit ${pandal.name} in ${pandal.zoneLabel} this Durga Puja!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#120D19] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header Bar with Close */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          {/* Quick Seen Toggle */}
          <button
            onClick={handleToggleVisited}
            className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold transition flex items-center space-x-1.5 shadow-md ${
              isVisited
                ? "bg-slate-800/90 text-emerald-300 border-emerald-500/50"
                : "bg-black/60 hover:bg-black/80 text-slate-200 border-white/20"
            }`}
            title={isVisited ? "Mark as unvisited" : "Mark as visited / seen"}
          >
            <Check className={`w-3.5 h-3.5 ${isVisited ? "text-emerald-400" : "text-slate-400"}`} />
            <span>{isVisited ? "Seen ✓" : "Mark Seen"}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition"
            title="Share Pandal"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 scrollbar-thin">
          
          {/* HD Image Carousel / Slideshow View */}
          <div className="relative w-full h-72 sm:h-96 bg-black group">
            <img 
              src={images[activePhotoIdx] || fallbackImg} 
              alt={`${pandal.name} view ${activePhotoIdx + 1}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImg;
              }}
              className="w-full h-full object-cover transition-all duration-500" 
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#120D19] via-transparent to-black/30 pointer-events-none"></div>

            {/* Carousel Arrow Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        activePhotoIdx === idx ? "bg-amber-400 w-6" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges on Top Left of Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold backdrop-blur-md shadow-md">
                {pandal.zoneLabel}
              </span>
              {instaBuzz?.likesFormatted && (
                <span className="px-3 py-1 rounded-full bg-slate-950/85 text-rose-300 border border-rose-500/40 text-xs font-black backdrop-blur-md shadow-md flex items-center space-x-1">
                  <span>{instaBuzz.likesFormatted}</span>
                </span>
              )}
              {pandal.award && (
                <span className="px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-xs font-bold backdrop-blur-md flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Award Winner</span>
                </span>
              )}
            </div>

          </div>

          {/* Details Content Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Title & Category */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-medium text-amber-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{pandal.category}</span>
                <span>·</span>
                <span className="text-slate-400">{pandal.locality}</span>
                {instaBuzz?.viralBadge && (
                  <>
                    <span>·</span>
                    <span className="text-rose-400 font-bold">{instaBuzz.viralBadge}</span>
                  </>
                )}
              </div>
              <h2 className="font-heritage text-2xl sm:text-4xl font-extrabold text-white">
                {pandal.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1 flex-shrink-0" />
                <span>{pandal.address}</span>
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1A1224] rounded-2xl p-4 border border-white/5">
              
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Distance</span>
                <span className="text-xs sm:text-sm font-bold text-amber-300">
                  {pandal.distanceKm !== undefined ? formatDistance(pandal.distanceKm) : "Near You"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Nearest Metro</span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center">
                  <Train className="w-3.5 h-3.5 text-blue-400 mr-1" />
                  <span className="truncate">{pandal.metro}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Crowd Level</span>
                <span className={`text-xs sm:text-sm font-bold ${
                  pandal.crowd === "Low Wait" ? "text-emerald-400" :
                  pandal.crowd === "Moderate" ? "text-amber-400" : "text-rose-400"
                }`}>
                  {pandal.crowd}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Walk from Metro</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  ~{pandal.walkMin} mins
                </span>
              </div>

            </div>

            {/* 2026 Instagram & Reels Viral Insight Card */}
            {instaBuzz && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#1F1026] to-amber-950/30 border border-amber-500/30 space-y-1.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>This Year's Instagram & Viral Art Buzz</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-black text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                      {instaBuzz.likesFormatted}
                    </span>
                    <span className="text-[11px] font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      {instaBuzz.viewsFormatted}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {instaBuzz.themeConcept}
                </p>
              </div>
            )}

            {/* Description & Theme Highlight */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Theme & Artistic Significance
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {pandal.highlights} Designed with intricate craftsmanship, atmospheric lighting, 
                and world-class idol sculpture honoring Bengal's legendary artisan legacy.
              </p>
            </div>

            {/* Street Food Nearby */}
            {pandal.foodNearby && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center">
                  <Utensils className="w-3.5 h-3.5 mr-1" />
                  <span>Iconic Pujo Street Food Nearby</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pandal.foodNearby.map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 font-medium">
                      🍴 {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Navigate with Google Maps & Mark Seen */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleToggleVisited}
                className={`w-full sm:w-auto py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg ${
                  isVisited
                    ? "bg-slate-700 hover:bg-slate-600 text-emerald-300 border border-emerald-500/40"
                    : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                }`}
                title={isVisited ? "Mark as unvisited" : "Mark as seen (turns grey on map)"}
              >
                <Check className={`w-4 h-4 ${isVisited ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{isVisited ? "Seen / Visited ✓" : "Mark as Seen"}</span>
              </button>

              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-rose-600/30 transition transform hover:-translate-y-0.5"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>Navigate with Google Maps</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm border border-white/10 transition"
              >
                Close
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
