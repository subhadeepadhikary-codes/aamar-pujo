import React, { useState, useMemo } from "react";
import { 
  X, 
  Zap, 
  Flame, 
  MapPin, 
  Clock, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Heart,
  ListFilter,
  Check
} from "lucide-react";
import { generateExpressShortlist } from "../utils/expressPlanner";
import { getDurgaFace } from "../utils/imageFallback";

export default function ExpressHopModal({ 
  isOpen, 
  onClose, 
  userLocation, 
  activeZone = "all", 
  onActivatePlan,
  currentPlanSpots = [],
  activePlanTitle = ""
}) {
  const hasPlan = currentPlanSpots && currentPlanSpots.length >= 2;
  const [filterMode, setFilterMode] = useState(() => (hasPlan ? "plan" : "near_me"));
  const [selectedCount, setSelectedCount] = useState(3);
  const [customZone, setCustomZone] = useState(activeZone || "all");
  const [excludeVisited, setExcludeVisited] = useState(true);

  // Compute shortlisted plan reactively
  const plan = useMemo(() => {
    return generateExpressShortlist({
      count: selectedCount,
      userLocation,
      zone: filterMode === "plan" ? "all" : customZone,
      filterMode,
      excludeVisited,
      currentPlanSpots: filterMode === "plan" ? currentPlanSpots : []
    });
  }, [selectedCount, userLocation, customZone, filterMode, excludeVisited, currentPlanSpots]);

  if (!isOpen) return null;

  const handleActivate = () => {
    if (onActivatePlan && plan?.spots?.length > 0) {
      onActivatePlan({
        id: `express-${Date.now()}`,
        title: filterMode === "plan"
          ? `⚡ Express Plan: Top ${plan.spots.length} from Your Itinerary`
          : `⚡ Express Hop: Top ${plan.spots.length} (${customZone !== "all" ? customZone : "Near Me"})`,
        spots: plan.spots,
        isExpress: true
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#120A1A] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#22102E] via-[#1A0B26] to-[#22102E] border-b border-amber-500/20 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-heritage font-bold text-white tracking-wide">
                  Express Hop — Time-Crunch Shortlist
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 text-rose-400" />
                  <span>Insta Viral</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Short on time after lunch/chitchat? Shortlist the top 2, 3, or 5 pandals from your plan or neighborhood!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortlist Configuration Strip */}
        <div className="p-3 sm:p-4 bg-[#170C22] border-b border-white/10 space-y-3">
          
          {/* Mode Tabs: From Current Plan VS Near Me Cluster VS By Zone */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {hasPlan && (
              <button
                type="button"
                onClick={() => setFilterMode("plan")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                  filterMode === "plan"
                    ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/30 scale-105"
                    : "bg-white/10 text-amber-300 hover:bg-white/15 border border-amber-500/30"
                }`}
                title="Prune down your currently active plan to the top best pandals"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>📋 From My Plan ({currentPlanSpots.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFilterMode("near_me")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                filterMode === "near_me"
                  ? "bg-blue-500 text-white font-black shadow-md shadow-blue-500/30 scale-105"
                  : "bg-white/10 text-blue-300 hover:bg-white/15 border border-blue-500/30"
              }`}
              title="Find best viral pandals clustered tightly near your GPS location"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>📍 Best Near Me (Cluster)</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("zone")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                filterMode === "zone"
                  ? "bg-rose-500 text-white font-black shadow-md shadow-rose-500/30 scale-105"
                  : "bg-white/10 text-rose-300 hover:bg-white/15 border border-rose-500/30"
              }`}
              title="Pick a specific Kolkata neighborhood/zone"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>🏛️ By Zone / Area</span>
            </button>
          </div>

          {/* Sub-selector for Zone if "By Zone" is active */}
          {filterMode === "zone" && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: "south", label: "South Kolkata" },
                { id: "north", label: "North Kolkata" },
                { id: "central", label: "Central Kolkata" },
                { id: "east", label: "East & Salt Lake" },
                { id: "southwest", label: "South-West / Behala" },
                { id: "howrah", label: "Howrah" }
              ].map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setCustomZone(z.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    customZone === z.id
                      ? "bg-rose-600 text-white font-bold"
                      : "bg-black/40 text-slate-300 hover:bg-black/60 border border-white/10"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          )}

          {/* Shortlist Size + Exclude Visited Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-300 font-medium">Shortlist size:</span>
              <div className="flex items-center space-x-1">
                {[2, 3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedCount(num)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${
                      selectedCount === num
                        ? "bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-md font-black"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeVisited}
                onChange={(e) => setExcludeVisited(e.target.checked)}
                className="rounded accent-amber-500 cursor-pointer"
              />
              <span>Hide Seen/Visited ✅</span>
            </label>
          </div>

          {/* Contextual Explainer Banner */}
          <div className="text-[11px] px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 leading-tight">
            {filterMode === "plan" ? (
              <span>✨ Shortlisting the top <strong>{plan.spots.length} highest-rated spots</strong> from your currently active {currentPlanSpots.length}-pandal route.</span>
            ) : (
              <span>📍 <strong>Tight Neighborhood Cluster:</strong> All {plan.spots.length} spots are located in the same neighborhood (~{plan.totalDistanceFormatted} total walk) so you never waste hours traveling between far ends!</span>
            )}
          </div>

        </div>

        {/* Plan Summary Stat Banner */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-black/40 border-b border-white/5 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Est. Duration</span>
            <span className="font-bold text-amber-400">{plan.totalDurationFormatted}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Walking Distance</span>
            <span className="font-bold text-white">{plan.totalDistanceFormatted}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Total Likes</span>
            <span className="font-bold text-rose-400">❤️ {plan.totalLikesFormatted}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Breakout Gems</span>
            <span className="font-bold text-emerald-400">{plan.breakoutCount} Spots</span>
          </div>
        </div>

        {/* Spot List Body */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[380px] scrollbar-thin">
          {plan.spots.map((spot, idx) => {
            const fallbackImg = getDurgaFace(spot.id);
            const img = spot.images?.[0] || fallbackImg;
            const buzz = spot.buzz;

            return (
              <div 
                key={spot.id}
                className="p-3 rounded-2xl bg-[#1A0E26]/80 hover:bg-[#1A0E26] border border-white/10 hover:border-amber-400/40 transition flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Step Rank Number Badge */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    #{idx + 1}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                    <img 
                      src={img} 
                      alt={spot.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImg;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition truncate">
                        {spot.name}
                      </h4>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                      <span>{spot.locality || spot.zoneLabel}</span>
                      {spot.distanceKm !== undefined && spot.distanceKm !== null && (
                        <span>· ~{spot.distanceKm.toFixed(1)} km</span>
                      )}
                    </div>

                    {/* Viral theme concept */}
                    {buzz?.themeConcept && (
                      <p className="text-[10px] text-amber-200/90 italic truncate mt-0.5">
                        "{buzz.themeConcept}"
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex items-center space-x-1.5 mt-1 flex-wrap gap-y-1">
                      {buzz?.viralBadge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                          {buzz.viralBadge}
                        </span>
                      )}
                      {spot.metro && (
                        <span className="text-[9px] text-blue-300 truncate">
                          🚇 {spot.metro}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Viral Stats Pill */}
                {buzz && (
                  <div className="text-right flex-shrink-0">
                    <div className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-black">
                      {buzz.likesFormatted} · {buzz.viewsFormatted}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="p-3 sm:p-4 bg-[#170C22] border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition border border-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleActivate}
            disabled={plan.spots.length === 0}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-400 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs sm:text-sm transition shadow-xl shadow-rose-950/60 flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
          >
            <span>🚀 Activate Express Route ({plan.spots.length} Spots)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
