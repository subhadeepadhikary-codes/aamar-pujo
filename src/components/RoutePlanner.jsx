import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Navigation,
  ExternalLink,
  RotateCcw,
  Utensils,
  Train,
  SlidersHorizontal,
  Info,
  Layers,
  ArrowRight,
  Download,
  Upload,
  AlertCircle
} from "lucide-react";

import {
  MAX_ROUTE_PLANS,
  MAX_SPOTS_PER_PLAN,
  loadSavedRoutePlans,
  saveRoutePlans,
  optimizeRouteSequential,
  calculateCircuitSummary,
  buildGoogleMapsCircuitUrl,
  encodePlanToUrl,
  decodePlanFromUrl,
  requestPersistentStorage,
  DEFAULT_ROUTE_PLANS
} from "../utils/routeOptimizer";

import { PANDALS_DATA } from "../data/pandalsData";
import { RESTAURANTS_DATA } from "../data/restaurantsData";
import { normalizePhonetic } from "../utils/phoneticSearch";

export default function RoutePlanner({
  userLocation,
  onSelectPlanForMap,
  onOpenModal
}) {
  const [plans, setPlans] = useState(() => loadSavedRoutePlans());
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  // Search & Add Spot state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchZone, setSelectedSearchZone] = useState("all");
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Plan editing & modal state
  const [isEditingPlanName, setIsEditingPlanName] = useState(false);
  const [planNameInput, setPlanNameInput] = useState("");
  const [shareToast, setShareToast] = useState("");
  const [optimizationNotice, setOptimizationNotice] = useState(null);
  const [startFromGps, setStartFromGps] = useState(false);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importInput, setImportInput] = useState("");
  const [importError, setImportError] = useState("");

  const searchInputRef = useRef(null);

  // Ensure activePlanIndex is within bounds
  const validIndex = Math.min(Math.max(0, activePlanIndex), Math.max(0, plans.length - 1));
  const activePlan = plans[validIndex] || plans[0] || DEFAULT_ROUTE_PLANS[0];

  // Request storage persistence once on mount
  useEffect(() => {
    requestPersistentStorage();

    // Check for shared plan in URL hash on mount
    const hash = window.location.hash;
    if (hash && hash.includes("#plan=")) {
      const decoded = decodePlanFromUrl(hash);
      if (decoded && decoded.spots && decoded.spots.length > 0) {
        setPlans((prevPlans) => {
          const exists = prevPlans.some((p) => p.name === decoded.name && p.spots.length === decoded.spots.length);
          if (exists) return prevPlans;
          if (prevPlans.length >= MAX_ROUTE_PLANS) {
            const replaced = [...prevPlans.slice(0, MAX_ROUTE_PLANS - 1), decoded];
            setActivePlanIndex(replaced.length - 1);
            setShareToast(`🎉 Loaded shared route "${decoded.name}"!`);
            setTimeout(() => setShareToast(""), 5000);
            return replaced;
          }
          const nextPlans = [...prevPlans, decoded];
          setActivePlanIndex(nextPlans.length - 1);
          setShareToast(`🎉 Loaded shared route "${decoded.name}"!`);
          setTimeout(() => setShareToast(""), 5000);
          return nextPlans;
        });
      }
    }
  }, []);

  // Save changes to localStorage on any plan update
  useEffect(() => {
    saveRoutePlans(plans);
  }, [plans]);

  // Sync active plan with the Leaflet map above
  useEffect(() => {
    if (activePlan && onSelectPlanForMap) {
      onSelectPlanForMap(activePlan);
    }
  }, [activePlan, activePlanIndex]);

  // Compute circuit summary for active plan
  const startCoords = startFromGps && userLocation?.lat && userLocation?.lng
    ? { lat: userLocation.lat, lng: userLocation.lng, name: "Your GPS Position" }
    : null;

  const summary = calculateCircuitSummary(activePlan.spots, startCoords);
  const googleMapsChunks = buildGoogleMapsCircuitUrl(activePlan.spots, startCoords);

  // Quick suggestions for adding spots
  const searchSuggestions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q && selectedSearchZone === "all") return [];

    const normQ = normalizePhonetic(q);
    const existingIds = new Set(activePlan.spots.map((s) => s.id));

    // Combine Pandals & Restaurants
    const pandalResults = PANDALS_DATA.filter((p) => {
      if (existingIds.has(`pandal-${p.id}`)) return false;
      if (selectedSearchZone !== "all" && p.zone !== selectedSearchZone) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.bengaliName && p.bengaliName.toLowerCase().includes(q)) ||
        (p.locality && p.locality.toLowerCase().includes(q)) ||
        normalizePhonetic(p.name).includes(normQ)
      );
    }).map((p) => ({
      id: `pandal-${p.id}`,
      name: p.name,
      bengaliName: p.bengaliName,
      lat: p.lat,
      lng: p.lng,
      zone: p.zone,
      zoneLabel: p.zoneLabel,
      locality: p.locality,
      metro: p.metro,
      isRestaurant: false
    }));

    const restaurantResults = RESTAURANTS_DATA.filter((r) => {
      if (existingIds.has(`rest-${r.id}`)) return false;
      if (selectedSearchZone !== "all" && r.zone !== selectedSearchZone) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.bengaliName && r.bengaliName.toLowerCase().includes(q)) ||
        (r.area && r.area.toLowerCase().includes(q)) ||
        normalizePhonetic(r.name).includes(normQ)
      );
    }).map((r) => ({
      id: `rest-${r.id}`,
      name: r.name,
      bengaliName: r.bengaliName,
      lat: r.lat,
      lng: r.lng,
      zone: r.zone,
      zoneLabel: r.zoneLabel,
      locality: r.area,
      metro: r.metro,
      isRestaurant: true,
      cuisine: r.cuisine
    }));

    return [...pandalResults, ...restaurantResults].slice(0, 10);
  }, [searchQuery, selectedSearchZone, activePlan.spots]);

  // PLAN MANAGEMENT HANDLERS
  const handleCreatePlan = () => {
    if (plans.length >= MAX_ROUTE_PLANS) {
      alert(`Maximum ${MAX_ROUTE_PLANS} route plans reached! Please edit or delete an existing plan.`);
      return;
    }
    const newPlanNumber = plans.length + 1;
    const newPlan = {
      id: `custom-plan-${Date.now()}`,
      name: `Custom Route Plan ${newPlanNumber}`,
      description: "Personalized Durga Puja hopping itinerary",
      updatedAt: Date.now(),
      spots: []
    };
    const updated = [...plans, newPlan];
    setPlans(updated);
    setActivePlanIndex(updated.length - 1);
    setOptimizationNotice(null);
  };

  const handleDeletePlan = (indexToDelete) => {
    if (plans.length <= 1) {
      alert("You must keep at least 1 route plan! You can edit or clear its spots instead.");
      return;
    }
    const target = plans[indexToDelete];
    if (window.confirm(`Are you sure you want to delete "${target.name}"?`)) {
      const updated = plans.filter((_, idx) => idx !== indexToDelete);
      setPlans(updated);
      setActivePlanIndex(Math.max(0, indexToDelete - 1));
      setOptimizationNotice(null);
    }
  };

  const handleStartRename = () => {
    setPlanNameInput(activePlan.name);
    setIsEditingPlanName(true);
  };

  const handleSaveRename = (e) => {
    if (e) e.preventDefault();
    const cleanName = planNameInput.trim();
    if (!cleanName) return;

    const updated = plans.map((p, idx) => {
      if (idx === activePlanIndex) {
        return { ...p, name: cleanName, updatedAt: Date.now() };
      }
      return p;
    });
    setPlans(updated);
    setIsEditingPlanName(false);
  };

  // SPOT MANAGEMENT HANDLERS
  const handleAddSpot = (spot) => {
    if (activePlan.spots.length >= MAX_SPOTS_PER_PLAN) {
      alert(`Maximum ${MAX_SPOTS_PER_PLAN} spots per plan reached! Remove a spot to add more.`);
      return;
    }

    const updatedSpots = [...activePlan.spots, spot];
    const updatedPlans = plans.map((p, idx) => {
      if (idx === activePlanIndex) {
        return { ...p, spots: updatedSpots, updatedAt: Date.now() };
      }
      return p;
    });

    setPlans(updatedPlans);
    setSearchQuery("");
    setShowAddMenu(false);
    setOptimizationNotice(null);
  };

  const handleRemoveSpot = (spotIndex) => {
    const updatedSpots = activePlan.spots.filter((_, idx) => idx !== spotIndex);
    const updatedPlans = plans.map((p, idx) => {
      if (idx === activePlanIndex) {
        return { ...p, spots: updatedSpots, updatedAt: Date.now() };
      }
      return p;
    });

    setPlans(updatedPlans);
    setOptimizationNotice(null);
  };

  const handleMoveSpot = (spotIndex, direction) => {
    const newIdx = spotIndex + direction;
    if (newIdx < 0 || newIdx >= activePlan.spots.length) return;

    const reordered = [...activePlan.spots];
    const temp = reordered[spotIndex];
    reordered[spotIndex] = reordered[newIdx];
    reordered[newIdx] = temp;

    const updatedPlans = plans.map((p, idx) => {
      if (idx === activePlanIndex) {
        return { ...p, spots: reordered, updatedAt: Date.now() };
      }
      return p;
    });

    setPlans(updatedPlans);
    setOptimizationNotice(null);
  };

  // AI SEQUENTIAL OPTIMIZATION
  const handleOptimizeRoute = () => {
    if (activePlan.spots.length <= 1) {
      alert("Please add at least 2 spots to your plan to optimize the sequential route!");
      return;
    }

    const res = optimizeRouteSequential(activePlan.spots, startCoords);

    const updatedPlans = plans.map((p, idx) => {
      if (idx === activePlanIndex) {
        return {
          ...p,
          spots: res.optimizedSpots,
          updatedAt: Date.now()
        };
      }
      return p;
    });

    setPlans(updatedPlans);

    if (res.savedDistanceKm > 0.1) {
      setOptimizationNotice({
        type: "success",
        msg: `⚡ AI Route Optimized! Saved ${res.savedDistanceKm.toFixed(1)} km (~${res.percentSaved}%) by eliminating backtracking.`
      });
    } else {
      setOptimizationNotice({
        type: "info",
        msg: `✨ Your spots are already in the optimal geographical sequence!`
      });
    }

    setTimeout(() => {
      setOptimizationNotice(null);
    }, 6000);
  };

  // SHARING & EXPORT
  const handleSharePlan = () => {
    const url = encodePlanToUrl(activePlan);
    if (!url) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast("🔗 Shareable itinerary link copied to clipboard! Paste it to WhatsApp or friends.");
        setTimeout(() => setShareToast(""), 4500);
      });
    } else {
      prompt("Copy this shareable plan link:", url);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plans, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aamar_pujo_plans_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportPlan = (e) => {
    if (e) e.preventDefault();
    setImportError("");

    const input = importInput.trim();
    if (!input) return;

    try {
      // 1. Check if URL with hash
      if (input.includes("#plan=")) {
        const decoded = decodePlanFromUrl(input);
        if (!decoded) throw new Error("Could not decode route plan from URL hash.");

        if (plans.length >= MAX_ROUTE_PLANS) {
          throw new Error(`You already have ${MAX_ROUTE_PLANS} plans. Delete one first before importing.`);
        }

        const updated = [...plans, decoded];
        setPlans(updated);
        setActivePlanIndex(updated.length - 1);
        setShowImportModal(false);
        setImportInput("");
        setShareToast(`🎉 Successfully imported "${decoded.name}"!`);
        setTimeout(() => setShareToast(""), 4000);
        return;
      }

      // 2. Check if JSON string
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        setPlans(parsed.slice(0, MAX_ROUTE_PLANS));
        setActivePlanIndex(0);
        setShowImportModal(false);
        setImportInput("");
        setShareToast("🎉 Successfully restored plans from JSON!");
        setTimeout(() => setShareToast(""), 4000);
      } else if (parsed.name && Array.isArray(parsed.spots)) {
        if (plans.length >= MAX_ROUTE_PLANS) {
          throw new Error(`You already have ${MAX_ROUTE_PLANS} plans. Delete one first before importing.`);
        }
        const updated = [...plans, { ...parsed, id: `imported-${Date.now()}` }];
        setPlans(updated);
        setActivePlanIndex(updated.length - 1);
        setShowImportModal(false);
        setImportInput("");
        setShareToast(`🎉 Successfully imported "${parsed.name}"!`);
        setTimeout(() => setShareToast(""), 4000);
      } else {
        throw new Error("Invalid plan format. Please provide valid Aamar Pujo plan link or JSON.");
      }
    } catch (err) {
      setImportError(err.message || "Failed to import plan.");
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset all route plans to the 3 default curated circuits? Any custom changes will be overwritten.")) {
      setPlans(DEFAULT_ROUTE_PLANS);
      setActivePlanIndex(0);
      setOptimizationNotice(null);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-amber-500/20 text-slate-100 font-sans space-y-6">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Smart Hop Optimizer · 5 Plans (Max 25 Spots Each)</span>
          </div>
          <h3 className="font-heritage text-2xl sm:text-3xl md:text-4xl font-black text-white">
            Smart Pujo <span className="text-gold-gradient">Route Planner</span>
            <span className="block sm:inline font-bengali text-lg sm:text-2xl text-amber-300 font-semibold sm:ml-2">
              (শারদ রুট অপ্টিমাইজার)
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Create up to 5 custom hopping itineraries. Our AI engine sequences your chosen spots sequentially to eliminate backtracking, calculate transit times, and generate turn-by-turn Google Maps circuits.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition flex items-center space-x-1.5"
            title="Import route from shared link or JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import / Paste</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition flex items-center space-x-1.5"
            title="Backup your plans to device"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Backup</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/10 transition flex items-center space-x-1"
            title="Reset to default circuits"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Share Toast Feedback */}
      {shareToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 flex items-center space-x-2 animate-fadeIn shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Optimization Notice Feedback */}
      {optimizationNotice && (
        <div className={`p-3 rounded-2xl text-xs flex items-center space-x-2 animate-fadeIn shadow-lg ${
          optimizationNotice.type === "success"
            ? "bg-amber-950/80 border border-amber-500/60 text-amber-200"
            : "bg-blue-950/80 border border-blue-500/60 text-blue-200"
        }`}>
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span className="font-medium">{optimizationNotice.msg}</span>
        </div>
      )}

      {/* 2. PLAN TABS (MAX 5 PLANS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="font-bold text-amber-300">Active Plans:</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono font-bold">
              {plans.length} / {MAX_ROUTE_PLANS}
            </span>
            <span className="hidden sm:inline text-slate-500">• Saved locally on device</span>
          </div>

          {plans.length < MAX_ROUTE_PLANS ? (
            <button
              onClick={handleCreatePlan}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs flex items-center space-x-1 shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>
          ) : (
            <span className="text-[11px] text-amber-400/80 font-medium">
              Maximum 5 Plans Reached
            </span>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {plans.map((p, idx) => {
            const isActive = idx === activePlanIndex;
            return (
              <button
                key={p.id || idx}
                onClick={() => {
                  setActivePlanIndex(idx);
                  setIsEditingPlanName(false);
                  setOptimizationNotice(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex-shrink-0 border min-w-0 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-amber-500/25 text-amber-300 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/20"
                    : "bg-[#140E1B] text-slate-300 border-white/10 hover:border-amber-400/30 hover:bg-[#1E1428]"
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span className="truncate max-w-[170px]">{p.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-amber-400 text-slate-950 font-black" : "bg-white/10 text-slate-400"
                }`}>
                  {p.spots ? p.spots.length : 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE PLAN HEADER & CONTROLS */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border border-amber-500/30 space-y-5 bg-[#120B1A]/90">
        
        {/* Plan Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="min-w-0 flex-1">
            {isEditingPlanName ? (
              <form onSubmit={handleSaveRename} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={planNameInput}
                  onChange={(e) => setPlanNameInput(e.target.value)}
                  maxLength={40}
                  className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-400 text-white font-bold text-sm focus:outline-none flex-1 max-w-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPlanName(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-400 text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center space-x-2 flex-wrap">
                <h4 className="font-heritage text-lg sm:text-xl font-black text-amber-300 truncate">
                  {activePlan.name}
                </h4>
                <button
                  onClick={handleStartRename}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition"
                  title="Rename Plan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activePlan.description || "Custom planned circuit for Durga Puja"}
            </p>
          </div>

          {/* Quick Plan Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleSharePlan}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-bold transition flex items-center space-x-1.5"
              title="Copy 1-click shareable itinerary link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Plan</span>
            </button>

            {plans.length > 1 && (
              <button
                onClick={() => handleDeletePlan(activePlanIndex)}
                className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs transition"
                title="Delete this plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Plan Circuit Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Spots in Plan:</span>
            <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
              {activePlan.spots.length} / {MAX_SPOTS_PER_PLAN}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {summary.pandalsCount} Pandals · {summary.foodCount} Food
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Total Travel Distance:</span>
            <span className="text-base sm:text-lg font-black text-rose-300 font-mono">
              {summary.totalDistanceFormatted}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Sequential circuit
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Est. Outing Duration:</span>
            <span className="text-base sm:text-lg font-black text-emerald-300 font-mono">
              {summary.totalDurationFormatted}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Travel + Darshan buffer
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 block font-medium">Starting Point:</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setStartFromGps(!startFromGps)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                  startFromGps
                    ? "bg-rose-600 text-white border-rose-400"
                    : "bg-white/5 text-slate-400 border-white/10"
                }`}
              >
                {startFromGps ? "📍 Live GPS" : "🏁 1st Spot"}
              </button>
            </div>
            <span className="text-[9px] text-slate-500">
              {startFromGps ? "Anchored from your phone" : "Starts at Spot #1"}
            </span>
          </div>
        </div>

        {/* 4. AI OPTIMIZER & GOOGLE MAPS LAUNCH BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          
          {/* AI Optimizer Button */}
          <button
            onClick={handleOptimizeRoute}
            disabled={activePlan.spots.length < 2}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-xl ${
              activePlan.spots.length >= 2
                ? "bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 hover:from-amber-400 hover:to-rose-500 text-slate-950 shadow-rose-900/30 hover:scale-[1.02] cursor-pointer"
                : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
            <span>✨ AI Optimize Route (Sequential Hop)</span>
          </button>

          {/* Google Maps Multi-Stop Launchers */}
          <div className="flex items-center space-x-2 flex-wrap">
            {googleMapsChunks && googleMapsChunks.length > 0 ? (
              googleMapsChunks.map((chunk) => (
                <a
                  key={chunk.partNumber}
                  href={chunk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-2xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 text-xs font-bold transition flex items-center space-x-1.5 shadow-md flex-1 sm:flex-initial justify-center"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-300" />
                  <span>
                    {googleMapsChunks.length > 1
                      ? `🗺️ Open in Google Maps (Part ${chunk.partNumber})`
                      : "🗺️ Open in Google Maps"}
                  </span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic py-2">
                Add at least 2 spots to generate Google Maps circuit
              </span>
            )}
          </div>
        </div>

        {/* 5. ADD SPOT AUTOCOMPLETE SEARCH */}
        <div className="pt-4 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Spots to Plan ({activePlan.spots.length} / {MAX_SPOTS_PER_PLAN})</span>
            </span>

            {activePlan.spots.length >= MAX_SPOTS_PER_PLAN && (
              <span className="text-[11px] text-rose-400 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Limit Reached (25/25)</span>
              </span>
            )}
          </div>

          {activePlan.spots.length < MAX_SPOTS_PER_PLAN && (
            <div className="space-y-2">
              {/* Search Inputs */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowAddMenu(true)}
                    placeholder="Search 504+ pandals or 186+ eateries to add (e.g. Sreebhumi, Bagbazar, Peter Cat, Abhijato)..."
                    className="w-full py-2.5 px-3.5 pl-9 rounded-2xl bg-black/60 border border-white/15 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <Compass className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Quick Zone Filter */}
                <select
                  value={selectedSearchZone}
                  onChange={(e) => setSelectedSearchZone(e.target.value)}
                  className="py-2.5 px-3 rounded-2xl bg-black/60 border border-white/15 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Zones</option>
                  <option value="south">South Kolkata</option>
                  <option value="north">North Kolkata</option>
                  <option value="central">Central Kolkata</option>
                  <option value="east">East / Salt Lake</option>
                  <option value="howrah">Howrah</option>
                  <option value="siliguri">Siliguri</option>
                </select>
              </div>

              {/* Autocomplete Dropdown List */}
              {showAddMenu && (searchQuery.trim().length > 0 || searchSuggestions.length > 0) && (
                <div className="p-2 bg-[#1A1126] border border-amber-500/40 rounded-2xl shadow-2xl max-h-60 overflow-y-auto space-y-1 z-30 animate-fadeIn scrollbar-thin">
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((spot) => (
                      <div
                        key={spot.id}
                        onClick={() => handleAddSpot(spot)}
                        className="p-2.5 rounded-xl hover:bg-white/10 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-white group-hover:text-amber-300 transition truncate">
                              {spot.name}
                            </span>
                            {spot.bengaliName && (
                              <span className="text-[10px] text-amber-200/70 font-bengali truncate">
                                ({spot.bengaliName})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span>{spot.locality || spot.zoneLabel}</span>
                            <span>•</span>
                            <span>{spot.isRestaurant ? "🍽️ Eatery" : "🏛️ Pandal"}</span>
                            {spot.metro && (
                              <>
                                <span>•</span>
                                <span className="text-blue-300">🚊 {spot.metro}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-300 text-[11px] font-bold transition flex-shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No matching pandal or eatery found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. SEQUENTIAL HOP TIMELINE (1 TO 25 SPOTS) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-bold text-slate-200">
              Sequential Hopping Itinerary ({activePlan.spots.length} Spots)
            </span>
            <span className="text-[11px] text-slate-500">
              Use 🔼 🔽 to manually reorder, or click AI Optimize
            </span>
          </div>

          {activePlan.spots.length > 0 ? (
            <div className="space-y-2">
              {activePlan.spots.map((spot, idx) => {
                const leg = summary.legs[idx];
                const isFirst = idx === 0;
                const isLast = idx === activePlan.spots.length - 1;

                return (
                  <React.Fragment key={spot.id || idx}>
                    {/* SPOT CARD */}
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-amber-400/40 transition flex items-center justify-between gap-3 group">
                      
                      {/* Step Number Badge & Name */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                          {idx + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition truncate">
                              {spot.name}
                            </span>
                            {spot.bengaliName && (
                              <span className="text-[10px] text-amber-200/80 font-bengali truncate">
                                ({spot.bengaliName})
                              </span>
                            )}
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                              spot.isRestaurant
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}>
                              {spot.isRestaurant ? "🍽️ Food" : "🏛️ Pandal"}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5 flex-wrap">
                            <span>{spot.locality || spot.zoneLabel}</span>
                            {spot.metro && (
                              <>
                                <span>•</span>
                                <span className="text-blue-300">🚊 {spot.metro}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls (Move Up/Down, Delete, Nav) */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => handleMoveSpot(idx, -1)}
                          disabled={isFirst}
                          className={`p-1.5 rounded-lg transition ${
                            isFirst ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                          title="Move earlier in route"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleMoveSpot(idx, 1)}
                          disabled={isLast}
                          className={`p-1.5 rounded-lg transition ${
                            isLast ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                          title="Move later in route"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' Kolkata')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-600/20 transition"
                          title="View on Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleRemoveSpot(idx)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-600/20 transition"
                          title="Remove spot from plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* INTER-LEG TRANSIT RECOMMENDATION BADGE */}
                    {leg && (
                      <div className="ml-4 sm:ml-6 pl-4 border-l-2 border-dashed border-amber-500/30 py-1 my-0.5">
                        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-[#1C1226] border border-amber-500/25 text-[11px] text-amber-200/90 shadow-sm">
                          <span>{leg.modeIcon}</span>
                          <span className="font-semibold text-amber-300">{leg.distanceFormatted}</span>
                          <span>•</span>
                          <span className="text-slate-300">{leg.recommendation}</span>
                          <a
                            href={leg.navUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline ml-1 font-bold inline-flex items-center gap-0.5"
                          >
                            <span>Navigate Leg</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-black/40 border border-white/5 text-center space-y-2">
              <Compass className="w-10 h-10 text-amber-400 mx-auto opacity-50" />
              <p className="text-xs text-slate-300 font-bold">This route plan is empty</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Use the search bar above to add up to 25 pandals and eateries to build your custom itinerary!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 7. IMPORT PLAN MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120A1A] border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="font-heritage text-lg font-bold text-amber-300 flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Import Route Plan</span>
              </h4>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError("");
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste a shared Aamar Pujo link (e.g. sent by friends over WhatsApp) or paste a backup JSON string:
            </p>

            <form onSubmit={handleImportPlan} className="space-y-3">
              <textarea
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="Paste link like: https://aamarpujo.live/#plan=... OR JSON data"
                rows={4}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />

              {importError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-black text-xs shadow-md"
                >
                  Import Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
