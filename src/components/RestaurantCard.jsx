import React from "react";
import { 
  Utensils, 
  MapPin, 
  Navigation, 
  Clock, 
  Train, 
  Sparkles, 
  ExternalLink,
  Star
} from "lucide-react";
import { formatDistance } from "../utils/geo";
import { getDurgaFace } from "../utils/imageFallback";

export default function RestaurantCard({ restaurant, userLocation }) {
  const distanceFormatted = formatDistance(restaurant.distanceKm);

  const navUrl = userLocation?.lat && userLocation?.lng
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${restaurant.lat},${restaurant.lng}`
    : restaurant.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all duration-300 group flex flex-col hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1">
      {/* Photo Header */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-black/70">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getDurgaFace(restaurant.id || 1);
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#140E1B] via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/75 text-amber-300 border border-amber-500/30 backdrop-blur-md truncate max-w-[170px]">
            {restaurant.type || restaurant.cuisine}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600/90 text-white backdrop-blur-md flex-shrink-0">
            {restaurant.priceRange}
          </span>
        </div>

        {/* Live Distance Pill */}
        {distanceFormatted && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black shadow-lg">
              <Navigation className="w-3 h-3 animate-pulse" />
              <span>{distanceFormatted} away</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heritage text-lg font-bold text-white group-hover:text-amber-300 transition">
                {restaurant.name}
              </h3>
              {restaurant.bengaliName && (
                <p className="font-bengali text-xs text-amber-300/80">
                  {restaurant.bengaliName}
                </p>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-white/5 border border-white/10 flex-shrink-0">
              {restaurant.area}
            </span>
          </div>

          {/* Google Verified Rating Pill */}
          {restaurant.rating && (
            <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>{restaurant.rating}</span>
              <span className="text-[10px] text-slate-300 font-normal">
                Google ({restaurant.reviewsCount || "Verified"})
              </span>
            </div>
          )}

          <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed line-clamp-2">
            ⭐ <strong className="text-amber-200">Specialty:</strong> {restaurant.specialty}
          </p>

          {/* Must Try Dishes Pills */}
          {restaurant.mustTryDishes && restaurant.mustTryDishes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {restaurant.mustTryDishes.map((dish, i) => (
                <span 
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-200 border border-amber-500/20 font-medium"
                >
                  🍽️ {dish}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta & Directions */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1 truncate max-w-[200px]">
              <Train className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="truncate">{restaurant.metro}</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400 font-medium flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span>Open Puja Nights</span>
            </span>
          </div>

          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-rose-600/20"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>Navigate with Google Maps</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
}
