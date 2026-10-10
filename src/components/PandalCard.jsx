import React, { useState } from "react";
import { 
  MapPin, 
  Navigation, 
  Train, 
  Award, 
  Sparkles, 
  ChevronRight, 
  Eye, 
  ExternalLink 
} from "lucide-react";
import { formatDistance } from "../utils/geo";
import { getDurgaFace } from "../utils/imageFallback";

export default function PandalCard({ pandal, userLocation, onOpenModal }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const fallbackImg = getDurgaFace(pandal.id);
  const images = pandal.images && pandal.images.length > 0 ? pandal.images : [fallbackImg];

  // Google Maps Turn-by-Turn Directions URL
  const navUrl = userLocation?.lat && userLocation?.lng
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${pandal.lat},${pandal.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}`;

  const nextImg = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      onClick={() => onOpenModal(pandal)}
      className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all duration-300 group flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5"
    >
      {/* Top Image Slideshow Header */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/60">
        <img 
          src={images[photoIndex] || fallbackImg} 
          alt={pandal.name} 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImg;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#120D1A] via-transparent to-black/40 pointer-events-none"></div>

        {/* Slideshow Pill Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center space-x-1 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  photoIndex === i ? "bg-amber-400 w-3.5" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Carousel mini arrows on hover */}
        {images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition duration-200">
            <button 
              onClick={prevImg}
              className="p-1 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs border border-white/20"
            >
              ‹
            </button>
            <button 
              onClick={nextImg}
              className="p-1 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs border border-white/20"
            >
              ›
            </button>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-md bg-[#120D1A]/90 text-amber-300 border border-amber-400/30 text-[10px] font-bold backdrop-blur-md">
            {pandal.zoneLabel}
          </span>
          {pandal.isBonediBari && (
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[10px] font-black flex items-center space-x-1 shadow-md shadow-amber-500/20">
              <span>🏛️ Bonedi Bari {pandal.heritageYear ? `· ${pandal.heritageYear}` : ""}</span>
            </span>
          )}
          {pandal.award && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/95 text-slate-950 text-[10px] font-black flex items-center space-x-1 shadow-sm">
              <Award className="w-2.5 h-2.5" />
              <span>Awarded</span>
            </span>
          )}
        </div>

        {/* Live Distance Badge if GPS available */}
        {pandal.distanceKm !== undefined && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-black shadow-md backdrop-blur-md animate-pulse">
            📍 {formatDistance(pandal.distanceKm)}
          </div>
        )}

        {/* Crowd level pill on image */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            pandal.crowd === "Low Wait" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
            pandal.crowd === "Moderate" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
            "bg-rose-500/20 text-rose-300 border border-rose-500/40"
          }`}>
            ● {pandal.crowd}
          </span>
        </div>

      </div>

      {/* Card Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          <div className="text-[11px] font-medium text-amber-400/90 flex items-center space-x-1 mb-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="truncate">{pandal.category}</span>
          </div>

          <h3 className="font-heritage text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
            {pandal.name}
          </h3>

          <p className="text-xs text-slate-400 flex items-center mt-1">
            <MapPin className="w-3 h-3 text-rose-400 mr-1 flex-shrink-0" />
            <span className="truncate">{pandal.locality}</span>
          </p>
        </div>

        {/* Metro transit connection info */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-1.5 truncate">
            <Train className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="truncate font-medium">{pandal.metro}</span>
          </div>
          <span className="text-[11px] text-slate-400 flex-shrink-0">
            ~{pandal.walkMin}m
          </span>
        </div>

        {/* Bottom Actions: Navigate with Google Maps */}
        <div className="pt-2 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/20 transition"
            title="Start Google Maps navigation from your current location"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>Navigate</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <button
            onClick={() => onOpenModal(pandal)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
            title="View HD Slideshow & Info"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
