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
  FileDown,
  Upload,
  AlertCircle,
  Bike,
  Footprints,
  Brain
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
  DEFAULT_ROUTE_PLANS,
  STARTER_TEMPLATES
} from "../utils/routeOptimizer";

import { exportTripPlanToPdf } from "../utils/pdfExport";
import { PANDALS_DATA } from "../data/pandalsData";
import { RESTAURANTS_DATA } from "../data/restaurantsData";
import { normalizePhonetic } from "../utils/phoneticSearch";
import { buildGoogleMapsNavUrl } from "../utils/navigationHelper";

export default function RoutePlanner({
  userLocation,
  onSelectPlanForMap,
  onOpenModal,
  currentTravelMode = "smart",
  onTravelModeChange
}) {
  const [plans, setPlans] = useState(() => loadSavedRoutePlans());
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [travelMode, setTravelMode] = useState(currentTravelMode || "smart");

  // Keep travelMode in sync with parent if prop updates
  useEffect(() => {
    if (currentTravelMode && currentTravelMode !== travelMode) {
      setTravelMode(currentTravelMode);
    }
  }, [currentTravelMode]);

  const handleTravelModeChange = (newMode) => {
    setTravelMode(newMode);
    if (onTravelModeChange) {
      onTravelModeChange(newMode);
    }
    if (onSelectPlanForMap) {
      onSelectPlanForMap(activePlan, newMode);
    }
  };

  // Search & Add Spot state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchZone, setSelectedSearchZone] = useState("all");
  const [selectedSearchMetro, setSelectedSearchMetro] = useState("all");
  const [selectedSearchLocality, setSelectedSearchLocality] = useState("all");
  const [selectedSearchType, setSelectedSearchType] = useState("all");
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
  const activePlan = plans.length > 0 ? (plans[validIndex] || plans[0]) : null;

  // Request storage persistence once on mount
  useEffect(() => {
    requestPersistentStorage();

    // Check for shared plan in URL hash on mount (supports both #p= and legacy #plan=)
    const hash = window.location.hash;
    if (hash && (hash.includes("#p=") || hash.includes("#plan="))) {
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

  // Sync active plan and travel mode with the Leaflet map above
  useEffect(() => {
    if (onSelectPlanForMap) {
      onSelectPlanForMap(activePlan, travelMode);
    }
  }, [activePlan, activePlanIndex, travelMode]);

  // Compute circuit summary for active plan
  const startCoords = startFromGps && userLocation?.lat && userLocation?.lng
    ? { lat: userLocation.lat, lng: userLocation.lng, name: "Your GPS Position" }
    : null;

  const summary = activePlan && activePlan.spots
    ? calculateCircuitSummary(activePlan.spots, startCoords, travelMode)
    : {
        spotCount: 0,
        pandalsCount: 0,
        foodCount: 0,
        totalDistanceKm: 0,
        totalDistanceFormatted: "0 km",
        transitMinutes: 0,
        darshanMinutes: 0,
        totalDurationFormatted: "0 mins",
        travelMode,
        modalBreakdown: { walkLegs: 0, bikeLegs: 0, metroLegs: 0 },
        legs: []
      };

  const googleMapsChunks = activePlan && activePlan.spots
    ? buildGoogleMapsCircuitUrl(activePlan.spots, startCoords, travelMode)
    : null;

  // Available Metro Stations based on selected zone
  const availableMetroStations = React.useMemo(() => {
    const dataset = selectedSearchZone === "all"
      ? PANDALS_DATA
      : PANDALS_DATA.filter((p) => p.zone === selectedSearchZone);
    const metros = new Set();
    dataset.forEach((p) => {
      if (p.metro && p.metro !== "Nearby Bus/Auto") {
        metros.add(p.metro);
      }
    });
    return Array.from(metros).sort();
  }, [selectedSearchZone]);

  // Available Localities based on selected zone
  const availableLocalities = React.useMemo(() => {
    const dataset = selectedSearchZone === "all"
      ? PANDALS_DATA
      : PANDALS_DATA.filter((p) => p.zone === selectedSearchZone);
    const locs = new Set();
    dataset.forEach((p) => {
      if (p.locality) locs.add(p.locality);
    });
    return Array.from(locs).sort();
  }, [selectedSearchZone]);

  // Combined and filtered search results
  const searchSuggestions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const isFilterActive =
      q.length > 0 ||
      selectedSearchZone !== "all" ||
      selectedSearchMetro !== "all" ||
      selectedSearchLocality !== "all" ||
      selectedSearchType !== "all";

    if (!isFilterActive && !showAddMenu) return [];

    const normQ = normalizePhonetic(q);

    // Filter Pandals
    let pandalResults = PANDALS_DATA.filter((p) => {
      if (selectedSearchZone !== "all" && p.zone !== selectedSearchZone) return false;
      if (selectedSearchMetro !== "all") {
        const normSearch = selectedSearchMetro.toLowerCase().replace(/metro/g, "").trim();
        const normPandal = (p.metro || "").toLowerCase().replace(/metro/g, "").trim();
        if (!normPandal || (!normPandal.includes(normSearch) && !normSearch.includes(normPandal))) {
          return false;
        }
      }
      if (selectedSearchLocality !== "all") {
        const normSearchLoc = selectedSearchLocality.toLowerCase().trim();
        const normPandalLoc = (p.locality || "").toLowerCase().trim();
        if (normPandalLoc !== normSearchLoc) return false;
      }
      if (selectedSearchType === "food") return false;
      if (selectedSearchType === "bonedi" && !p.isBonediBari) return false;
      if (selectedSearchType === "pandals" && p.isBonediBari) return false;

      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.bengaliName && p.bengaliName.toLowerCase().includes(q)) ||
        (p.locality && p.locality.toLowerCase().includes(q)) ||
        (p.metro && p.metro.toLowerCase().includes(q)) ||
        (p.aliases && p.aliases.some((a) => a.toLowerCase().includes(q) || normalizePhonetic(a).includes(normQ))) ||
        ((q === "bonedi" || q === "bonedi bari" || q === "rajbari") && p.isBonediBari) ||
        normalizePhonetic(p.name).includes(normQ)
      );
    }).map((p) => ({
      id: `pandal-${p.id}`,
      rawId: p.id,
      name: p.name,
      bengaliName: p.bengaliName,
      lat: p.lat,
      lng: p.lng,
      zone: p.zone,
      zoneLabel: p.zoneLabel,
      locality: p.locality,
      metro: p.metro,
      walkMin: p.walkMin,
      address: p.address,
      isRestaurant: false,
      isBonediBari: p.isBonediBari,
      category: p.category
    }));

    // Filter Restaurants (only if not restricted to pandals/bonedi)
    let restaurantResults = [];
    if (selectedSearchType !== "bonedi" && selectedSearchType !== "pandals") {
      restaurantResults = RESTAURANTS_DATA.filter((r) => {
        if (selectedSearchZone !== "all" && r.zone !== selectedSearchZone) return false;
        if (selectedSearchMetro !== "all") {
          const normSearch = selectedSearchMetro.toLowerCase().replace(/metro/g, "").trim();
          const normRest = (r.metro || "").toLowerCase().replace(/metro/g, "").trim();
          if (!normRest || (!normRest.includes(normSearch) && !normSearch.includes(normRest))) {
            return false;
          }
        }
        if (selectedSearchLocality !== "all") {
          const normSearchLoc = selectedSearchLocality.toLowerCase().trim();
          const normArea = (r.area || "").toLowerCase().trim();
          const normLoc = (r.locality || "").toLowerCase().trim();
          if (!normArea.includes(normSearchLoc) && !normLoc.includes(normSearchLoc)) return false;
        }

        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          (r.bengaliName && r.bengaliName.toLowerCase().includes(q)) ||
          (r.area && r.area.toLowerCase().includes(q)) ||
          normalizePhonetic(r.name).includes(normQ)
        );
      }).map((r) => ({
        id: `rest-${r.id}`,
        rawId: r.id,
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
    }

    return [...pandalResults, ...restaurantResults].slice(0, 80);
  }, [searchQuery, selectedSearchZone, selectedSearchMetro, selectedSearchLocality, selectedSearchType, showAddMenu]);

  // Group filtered results by Zone for clean, categorized browsing
  const groupedSuggestions = React.useMemo(() => {
    const groups = {};
    searchSuggestions.forEach((spot) => {
      const zoneKey = spot.zoneLabel || "Other Spots";
      if (!groups[zoneKey]) groups[zoneKey] = [];
      groups[zoneKey].push(spot);
    });
    return groups;
  }, [searchSuggestions]);

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
    const target = plans[indexToDelete];
    if (!target) return;
    if (window.confirm(`Are you sure you want to delete "${target.name}"?`)) {
      const updated = plans.filter((_, idx) => idx !== indexToDelete);
      setPlans(updated);
      setActivePlanIndex(Math.max(0, indexToDelete - 1));
      setOptimizationNotice(null);
    }
  };

  const handleStartRename = () => {
    if (!activePlan) return;
    setPlanNameInput(activePlan.name);
    setIsEditingPlanName(true);
  };

  const handleSaveRename = (e) => {
    if (e) e.preventDefault();
    const cleanName = planNameInput.trim();
    if (!cleanName || !activePlan) return;

    const updated = plans.map((p, idx) => {
      if (idx === activePlanIndex) {
        return { ...p, name: cleanName, updatedAt: Date.now() };
      }
      return p;
    });
    setPlans(updated);
    setIsEditingPlanName(false);
  };

  // SPOT MANAGEMENT HANDLERS (PERSISTENT MULTI-ADD)
  const handleToggleSpot = (spot) => {
    if (!activePlan) {
      const newPlan = {
        id: `custom-plan-${Date.now()}`,
        name: "Custom Route Plan 1",
        description: "Personalized Durga Puja hopping itinerary",
        updatedAt: Date.now(),
        spots: [spot]
      };
      setPlans([newPlan]);
      setActivePlanIndex(0);
      setOptimizationNotice(null);
      return;
    }

    const alreadyIdx = activePlan.spots.findIndex(
      (s) => s.id === spot.id || (s.lat === spot.lat && s.lng === spot.lng)
    );

    if (alreadyIdx >= 0) {
      // Already in plan -> remove
      const updatedSpots = activePlan.spots.filter((_, idx) => idx !== alreadyIdx);
      const updatedPlans = plans.map((p, idx) => {
        if (idx === activePlanIndex) {
          return { ...p, spots: updatedSpots, updatedAt: Date.now() };
        }
        return p;
      });
      setPlans(updatedPlans);
      setOptimizationNotice(null);
      return;
    }

    // Check capacity limit (40 spots)
    if (activePlan.spots.length >= MAX_SPOTS_PER_PLAN) {
      alert(`Maximum ${MAX_SPOTS_PER_PLAN} spots per plan reached! Remove a spot to add more.`);
      return;
    }

    // Add to plan and STAY OPEN (do not close modal, do not clear search)
    const updatedSpots = [...activePlan.spots, spot];
    const updatedPlans = plans.map((p, idx) => {
      if (idx === activePlanIndex) {
        return { ...p, spots: updatedSpots, updatedAt: Date.now() };
      }
      return p;
    });

    setPlans(updatedPlans);
    setOptimizationNotice(null);
  };

  const handleAddSpot = handleToggleSpot;

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
    if (!activePlan || !activePlan.spots || activePlan.spots.length === 0) {
      alert("Please add at least 1 spot to your plan before sharing.");
      return;
    }
    const url = encodePlanToUrl(activePlan);
    if (!url) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast("🔗 Ultra-compact route link copied to clipboard! Share it on WhatsApp with friends.");
        setTimeout(() => setShareToast(""), 4500);
      });
    } else {
      prompt("Copy this shareable route link:", url);
    }
  };

  const handleDownloadPdf = () => {
    if (!activePlan || !activePlan.spots || activePlan.spots.length === 0) {
      alert("Please add at least 1 spot to your plan before downloading the PDF.");
      return;
    }
    exportTripPlanToPdf(activePlan, summary);
  };

  const handleLoadHeritageTemplate = () => {
    const template = (STARTER_TEMPLATES && STARTER_TEMPLATES[0]) || DEFAULT_ROUTE_PLANS[0];
    if (template) {
      const cloned = JSON.parse(JSON.stringify(template));
      cloned.id = `template-${Date.now()}`;
      cloned.name = "Bonedi Bari Heritage Walk";
      cloned.description = "Curated 10-Stop Historic North & Central Kolkata Rajbari Circuit";
      setPlans([cloned]);
      setActivePlanIndex(0);
      setShareToast("🏛️ Loaded curated Kolkata Heritage Walk template!");
      setTimeout(() => setShareToast(""), 4000);
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
      // 1. Check if URL with short hash (#p=) or legacy hash (#plan=)
      if (input.includes("#p=") || input.includes("#plan=")) {
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
            <span>AI Smart Hop Optimizer · 5 Plans (Max 40 Spots Each)</span>
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

      {/* 3. ACTIVE PLAN HEADER & CONTROLS / EMPTY STATE */}
      {!activePlan ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-amber-500/20 text-center space-y-6 bg-[#120B1A]/90">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl shadow-inner">
            🧭
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-heritage text-2xl font-bold text-amber-300">
              No Route Plans Created Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Create your own customized pandal hopping route! Add up to 40 pandals and Kolkata eateries, optimize your path with AI, and download a step-by-step PDF itinerary.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCreatePlan}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm flex items-center space-x-2 shadow-lg shadow-rose-900/40 cursor-pointer transition"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Create Your First Plan</span>
            </button>
            <button
              onClick={handleLoadHeritageTemplate}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/30 font-bold text-sm flex items-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Load Curated Heritage Walk</span>
            </button>
          </div>
        </div>
      ) : (
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
              title="Copy 1-click ultra-compact route link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1.5"
              title="Download step-by-step trip plan as PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => handleDeletePlan(activePlanIndex)}
              className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs transition"
              title="Delete this plan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. TRAVEL ROUTING MODE SWITCHER (DROPDOWN MENU) */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <label htmlFor="planner-travel-mode-select" className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 cursor-pointer">
              <span>🧭 Travel Mode:</span>
            </label>
            {travelMode === "smart" && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center space-x-1 animate-pulse">
                <Brain className="w-3 h-3 text-amber-400" />
                <span>Smart Multi-Modal (Junction AI)</span>
              </span>
            )}
            {travelMode === "metro" && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center space-x-1">
                <Train className="w-3 h-3 text-cyan-400" />
                <span>Metro Mode (Kolkata Rail Corridors)</span>
              </span>
            )}
            {(travelMode === "road" || travelMode === "bike") && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center space-x-1">
                <Bike className="w-3 h-3 text-emerald-400" />
                <span>Road Mode (Paved Streets & Bypasses)</span>
              </span>
            )}
            {travelMode === "foot" && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center space-x-1">
                <Footprints className="w-3 h-3 text-rose-400" />
                <span>Foot Mode (Pedestrian Lanes & Para Alleys)</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-full sm:w-auto">
              <select
                id="planner-travel-mode-select"
                value={travelMode === "bike" ? "road" : travelMode}
                onChange={(e) => handleTravelModeChange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-slate-900 text-slate-100 pl-9 pr-9 py-2 rounded-xl border border-white/20 hover:border-amber-400/60 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50 text-xs font-bold transition shadow-md cursor-pointer"
              >
                <option value="foot" className="bg-slate-900 text-white py-1">
                  🚶 Foot Mode (Pedestrian Lanes)
                </option>
                <option value="road" className="bg-slate-900 text-white py-1">
                  🛵 Road Mode (Paved Streets & Arteries)
                </option>
                <option value="metro" className="bg-slate-900 text-white py-1">
                  🚇 Metro Mode (Kolkata Rail Corridors)
                </option>
                <option value="smart" className="bg-slate-900 text-amber-300 py-1 font-bold">
                  🧠 Smart Mode (AI Multi-Modal Decision)
                </option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
                {travelMode === "foot" && "🚶"}
                {(travelMode === "road" || travelMode === "bike") && "🛵"}
                {travelMode === "metro" && "🚇"}
                {travelMode === "smart" && "🧠"}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>
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
            <span className="text-[10px] text-slate-500 block truncate">
              {travelMode === "smart" && summary.modalBreakdown
                ? `${summary.modalBreakdown.walkLegs} Walk · ${summary.modalBreakdown.roadLegs ?? summary.modalBreakdown.bikeLegs ?? 0} Road · ${summary.modalBreakdown.metroLegs} Metro`
                : travelMode === "metro"
                ? "🚇 Kolkata Metro rail circuit"
                : (travelMode === "road" || travelMode === "bike")
                ? "🛵 Vehicular road circuit"
                : "🚶 Pedestrian walking circuit"}
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

          {/* Action Launchers: PDF Download & Google Maps */}
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              disabled={activePlan.spots.length === 0}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md flex-1 sm:flex-initial justify-center ${
                activePlan.spots.length > 0
                  ? "bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-400/40 cursor-pointer"
                  : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
              }`}
              title="Download step-by-step printable PDF itinerary"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>📄 Download Plan as PDF</span>
            </button>

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

        {/* 5. ADD SPOT AUTOCOMPLETE & FILTERABLE BROWSE DRAWER */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Spots to Plan ({activePlan.spots.length} / {MAX_SPOTS_PER_PLAN})</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddMenu((prev) => !prev)}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition flex items-center space-x-1"
              >
                <span>{showAddMenu ? "Hide Picker ▴" : "Browse & Add ▾"}</span>
              </button>
            </div>

            {activePlan.spots.length >= MAX_SPOTS_PER_PLAN ? (
              <span className="text-[11px] text-rose-400 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Limit Reached (40/40)</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">
                {MAX_SPOTS_PER_PLAN - activePlan.spots.length} slots left
              </span>
            )}
          </div>

          {activePlan.spots.length < MAX_SPOTS_PER_PLAN && (
            <div className="space-y-2.5">
              {/* Primary Search Input */}
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showAddMenu) setShowAddMenu(true);
                  }}
                  onFocus={() => setShowAddMenu(true)}
                  placeholder="Search 541+ pandals or eateries (e.g. Sreebhumi, Bagbazar, 76 Pally, Peter Cat)..."
                  className="w-full py-2.5 px-3.5 pl-9 pr-8 rounded-2xl bg-black/60 border border-white/15 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
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

              {/* Advanced Filter Selectors: Zone, Metro Station, Locality, Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {/* Zone Filter */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-0.5">Zone</label>
                  <select
                    value={selectedSearchZone}
                    onChange={(e) => {
                      setSelectedSearchZone(e.target.value);
                      setSelectedSearchMetro("all");
                      setSelectedSearchLocality("all");
                      if (!showAddMenu) setShowAddMenu(true);
                    }}
                    className="w-full py-1.5 px-2 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Zones</option>
                    <option value="north">North Kolkata</option>
                    <option value="central">Central Kolkata</option>
                    <option value="south">South Kolkata</option>
                    <option value="east">East & Salt Lake</option>
                    <option value="southwest">South-West Kolkata</option>
                    <option value="howrah">Howrah & Salkia</option>
                    <option value="siliguri">Siliguri</option>
                  </select>
                </div>

                {/* Metro Station Filter */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-0.5">Metro Station</label>
                  <select
                    value={selectedSearchMetro}
                    onChange={(e) => {
                      setSelectedSearchMetro(e.target.value);
                      if (!showAddMenu) setShowAddMenu(true);
                    }}
                    className="w-full py-1.5 px-2 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Metros</option>
                    {availableMetroStations.map((metro) => (
                      <option key={metro} value={metro}>
                        🚊 {metro}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Locality Filter */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-0.5">Locality</label>
                  <select
                    value={selectedSearchLocality}
                    onChange={(e) => {
                      setSelectedSearchLocality(e.target.value);
                      if (!showAddMenu) setShowAddMenu(true);
                    }}
                    className="w-full py-1.5 px-2 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Localities</option>
                    {availableLocalities.map((loc) => (
                      <option key={loc} value={loc}>
                        📍 {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-0.5">Type</label>
                  <select
                    value={selectedSearchType}
                    onChange={(e) => {
                      setSelectedSearchType(e.target.value);
                      if (!showAddMenu) setShowAddMenu(true);
                    }}
                    className="w-full py-1.5 px-2 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Types</option>
                    <option value="pandals">🛕 Pandals Only</option>
                    <option value="bonedi">🏛️ Bonedi Bari</option>
                    <option value="food">🍽️ Eateries</option>
                  </select>
                </div>
              </div>

              {/* Persistent Autocomplete & Selection Drawer */}
              {showAddMenu && (
                <div className="p-2.5 bg-[#170e24] border border-amber-500/40 rounded-2xl shadow-2xl space-y-2 z-30 animate-fadeIn">
                  {/* Top Bar with Live Counter and Done Button */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-amber-300">
                        {searchSuggestions.length} Results
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({activePlan.spots.length} / {MAX_SPOTS_PER_PLAN} in plan)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddMenu(false)}
                      className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done Adding</span>
                    </button>
                  </div>

                  {/* Grouped Spots List */}
                  <div className="max-h-80 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                    {Object.keys(groupedSuggestions).length > 0 ? (
                      Object.entries(groupedSuggestions).map(([zoneName, spotsInZone]) => (
                        <div key={zoneName} className="space-y-1.5">
                          {/* Zone Category Header */}
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 bg-white/5 px-2.5 py-1 rounded-lg flex items-center justify-between border-l-2 border-amber-400">
                            <span>{zoneName}</span>
                            <span className="text-slate-400 font-normal">{spotsInZone.length} spots</span>
                          </div>

                          {/* Spots in this Zone */}
                          <div className="space-y-1">
                            {spotsInZone.map((spot) => {
                              const isInPlan = activePlan.spots.some(
                                (s) => s.id === spot.id || (s.lat === spot.lat && s.lng === spot.lng)
                              );

                              return (
                                <div
                                  key={spot.id}
                                  className={`p-2 rounded-xl flex items-center justify-between transition group ${
                                    isInPlan
                                      ? "bg-emerald-500/10 border border-emerald-500/30"
                                      : "hover:bg-white/10 bg-black/20 border border-transparent"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 pr-2">
                                    <div className="flex items-center space-x-1.5">
                                      <span className={`font-bold text-xs truncate ${isInPlan ? "text-emerald-200" : "text-white group-hover:text-amber-300"}`}>
                                        {spot.name}
                                      </span>
                                      {spot.bengaliName && (
                                        <span className="text-[10px] text-amber-200/70 font-bengali truncate">
                                          ({spot.bengaliName})
                                        </span>
                                      )}
                                      {spot.isBonediBari && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                          🏛️ Bonedi
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5 truncate">
                                      <span>{spot.locality || spot.zoneLabel}</span>
                                      <span>•</span>
                                      <span>{spot.isRestaurant ? "🍽️ Eatery" : "🛕 Pandal"}</span>
                                      {spot.metro && (
                                        <>
                                          <span>•</span>
                                          <span className="text-blue-300 font-medium">
                                            🚊 {spot.metro} {spot.walkMin ? `(${spot.walkMin}m)` : ""}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {isInPlan ? (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSpot(spot)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/25 hover:bg-rose-500/30 text-emerald-300 hover:text-rose-200 border border-emerald-500/40 hover:border-rose-500/40 text-[11px] font-bold transition flex items-center space-x-1 flex-shrink-0"
                                      title="Click to remove from plan"
                                    >
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>Added</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSpot(spot)}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition flex items-center space-x-1 flex-shrink-0 shadow-sm"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Add</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No matching pandals or eateries found for current filters.
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar Close Button */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between px-1">
                    <span className="text-[11px] text-slate-400">
                      Keep clicking <b>+ Add</b> to add multiple spots!
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddMenu(false)}
                      className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done Adding ({activePlan.spots.length} Spots)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. SEQUENTIAL HOP TIMELINE (1 TO 40 SPOTS) */}
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
                          href={buildGoogleMapsNavUrl(spot, userLocation, (travelMode === "road" || travelMode === "bike") ? "two_wheeler" : travelMode === "metro" ? "transit" : "walking")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-600/20 transition"
                          title={`Navigate to spot via Google Maps (${(travelMode === "road" || travelMode === "bike") ? "Road Route" : travelMode === "metro" ? "Metro Transit" : "Walking"})`}
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
                      <div className="ml-4 sm:ml-6 pl-4 border-l-2 border-dashed border-amber-500/30 py-1.5 my-1">
                        <div className="p-3 rounded-2xl bg-[#170E24] border border-amber-500/35 space-y-2 shadow-md">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-base">{leg.modeIcon}</span>
                              <span className="font-extrabold text-xs text-amber-300">{leg.distanceFormatted}</span>
                              {travelMode === "metro" ? (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center space-x-1">
                                  <span>🚇 Metro Transit</span>
                                  <span>(~{leg.travelMins}m)</span>
                                </span>
                              ) : (travelMode === "road" || travelMode === "bike") ? (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center space-x-1">
                                  <span>🛵 Road Route</span>
                                  <span>(~{leg.travelMins}m)</span>
                                </span>
                              ) : travelMode === "smart" ? (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center space-x-1">
                                  <span>✨ Optimal:</span>
                                  <span>{leg.mode === "walk" ? "🚶 Walk" : (leg.mode === "road" || leg.mode === "bike") ? "🛵 Road" : "🚇 Metro"}</span>
                                  <span>(~{leg.travelMins}m)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium">
                                  <span>🚶 Walking Hop</span>
                                  <span>(~{leg.travelMins}m)</span>
                                </span>
                              )}
                            </div>

                            <a
                              href={leg.navUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[11px] font-bold transition inline-flex items-center space-x-1 shadow-sm"
                            >
                              <span>Navigate Leg</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                            {leg.recommendation}
                          </p>

                          {/* Multi-modal Junction Comparison in Smart Mode */}
                          {travelMode === "smart" && leg.junctionAnalysis?.comparison && (
                            <div className="pt-1.5 border-t border-white/10 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Junction Options:</span>
                              {leg.junctionAnalysis.comparison.map((opt) => (
                                <div
                                  key={opt.mode}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border flex items-center space-x-1 ${
                                    opt.isOptimal
                                      ? "bg-amber-400/20 text-amber-200 border-amber-400/50 font-bold"
                                      : "bg-white/5 text-slate-400 border-white/10 opacity-75"
                                  }`}
                                  title={opt.note}
                                >
                                  <span>{opt.icon}</span>
                                  <span>{opt.label}:</span>
                                  <span className="font-bold">~{opt.timeMins}m</span>
                                  {opt.isOptimal && <span className="text-amber-400 ml-0.5">★</span>}
                                </div>
                              ))}
                            </div>
                          )}
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
                Use the search bar above to add up to 40 pandals and eateries to build your custom itinerary!
              </p>
            </div>
          )}
        </div>

      </div>
      )}

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
