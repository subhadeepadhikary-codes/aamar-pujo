import React, { useState, useMemo } from "react";
import { PANDALS_DATA, ZONES, CATEGORIES } from "../data/pandalsData";
import { RESTAURANTS_DATA } from "../data/restaurantsData";
import { METRO_STATIONS } from "../data/metroData";
import PandalCard from "./PandalCard";
import RestaurantCard from "./RestaurantCard";
import { filterPandalsPhonetically, getSmartSearchSuggestions } from "../utils/phoneticSearch";
import { 
  Search, 
  MapPin, 
  Compass, 
  Filter, 
  Sparkles, 
  Navigation, 
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Train,
  Utensils,
  X
} from "lucide-react";

export default function PandalExplorer({ 
  userLocation, 
  isNearMeActive, 
  onToggleNearMe, 
  selectedZone, 
  setSelectedZone, 
  searchQuery, 
  setSearchQuery, 
  onOpenModal,
  selectedMetroStation,
  onSelectMetroStation
}) {
  const [activeTab, setActiveTab] = useState("pandals"); // "pandals" | "food"
  const [selectedCategory, setSelectedCategory] = useState("All Themes");
  const [maxRadiusKm, setMaxRadiusKm] = useState(10); // for Near Me radius
  const [visibleCount, setVisibleCount] = useState(24);
  const [visibleFoodCount, setVisibleFoodCount] = useState(24);
  const [crowdFilter, setCrowdFilter] = useState("all");
  const [metroSelectorOpen, setMetroSelectorOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Haversine distance calculator helper
  const getDist = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return undefined;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // --- 1. FILTER & DISTANCE LOGIC FOR 503+ PANDALS ---
  const filteredPandals = useMemo(() => {
    let list = PANDALS_DATA.map((pandal) => {
      let distanceKm = getDist(userLocation?.lat, userLocation?.lng, pandal.lat, pandal.lng);
      return { ...pandal, distanceKm };
    });

    // Hybrid Metro Station Filter: Matches keywords OR physical distance <= 2.2 km from station platform
    if (selectedMetroStation) {
      const kws = selectedMetroStation.matchKeywords || [selectedMetroStation.name];
      list = list.filter((p) => {
        const distFromMetro = getDist(selectedMetroStation.lat, selectedMetroStation.lng, p.lat, p.lng);
        const kwMatch = kws.some((kw) =>
          (p.metro && p.metro.toLowerCase().includes(kw.toLowerCase())) ||
          (p.locality && p.locality.toLowerCase().includes(kw.toLowerCase())) ||
          (p.name && p.name.toLowerCase().includes(kw.toLowerCase())) ||
          (p.address && p.address.toLowerCase().includes(kw.toLowerCase()))
        );
        return kwMatch || (distFromMetro !== undefined && distFromMetro <= 2.2);
      });

      // Sort pandals by proximity to the selected metro station platform
      list = list.sort((a, b) => {
        const distA = getDist(selectedMetroStation.lat, selectedMetroStation.lng, a.lat, a.lng) || 999;
        const distB = getDist(selectedMetroStation.lat, selectedMetroStation.lng, b.lat, b.lng) || 999;
        return distA - distB;
      });
    }

    // Zone filter
    if (selectedZone && selectedZone !== "all") {
      list = list.filter((p) => p.zone === selectedZone);
    }

    // Category / Theme filter
    if (selectedCategory && selectedCategory !== "All Themes") {
      if (selectedCategory === "Near Metro") {
        list = list.filter((p) => p.metro && p.metro !== "Nearby Bus/Auto");
      } else if (selectedCategory === "Bonedi Bari (ঐতিহ্যবাহী)") {
        list = list.filter((p) => p.isBonediBari === true || p.category === "Bonedi Bari (ঐতিহ্যবাহী)" || p.name.includes("Bari") || p.name.includes("Rajbari"));
      } else {
        list = list.filter((p) => p.category === selectedCategory);
      }
    }

    // Crowd filter
    if (crowdFilter !== "all") {
      list = list.filter((p) => p.crowd === crowdFilter);
    }

    // Homophone & Phonetic Text Search Filter
    if (searchQuery && searchQuery.trim() !== "") {
      list = filterPandalsPhonetically(list, searchQuery);
    }

    // "Near Me" GPS proximity sorting & radius cut (when no metro station is active)
    if (isNearMeActive && userLocation?.lat && userLocation?.lng && !selectedMetroStation) {
      if (selectedZone === "all") {
        list = list.filter((p) => p.distanceKm !== undefined && p.distanceKm <= maxRadiusKm);
      }
      list = list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return list;
  }, [userLocation, selectedZone, selectedCategory, crowdFilter, searchQuery, isNearMeActive, maxRadiusKm, selectedMetroStation]);

  const displayedPandals = useMemo(() => {
    return filteredPandals.slice(0, visibleCount);
  }, [filteredPandals, visibleCount]);

  // Homophone / smart search suggestion chips
  const smartSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    return getSmartSearchSuggestions(searchQuery, PANDALS_DATA, 4);
  }, [searchQuery]);

  // --- 2. FILTER & DISTANCE LOGIC FOR RESTAURANTS & FOOD SPOTS ---
  const filteredRestaurants = useMemo(() => {
    let list = RESTAURANTS_DATA.map((rest) => {
      let distanceKm = getDist(userLocation?.lat, userLocation?.lng, rest.lat, rest.lng);
      return { ...rest, distanceKm };
    });

    // Zone filter
    if (selectedZone && selectedZone !== "all") {
      list = list.filter((r) => r.zone === selectedZone);
    }

    // Metro Station Filter
    if (selectedMetroStation) {
      const kws = selectedMetroStation.matchKeywords || [selectedMetroStation.name];
      list = list.filter((r) => {
        const distFromMetro = getDist(selectedMetroStation.lat, selectedMetroStation.lng, r.lat, r.lng);
        const kwMatch = kws.some((kw) =>
          (r.metro && r.metro.toLowerCase().includes(kw.toLowerCase())) ||
          (r.area && r.area.toLowerCase().includes(kw.toLowerCase())) ||
          (r.name && r.name.toLowerCase().includes(kw.toLowerCase())) ||
          (r.address && r.address.toLowerCase().includes(kw.toLowerCase()))
        );
        return kwMatch || (distFromMetro !== undefined && distFromMetro <= 2.2);
      });

      // Sort eateries by proximity to selected metro station
      list = list.sort((a, b) => {
        const distA = getDist(selectedMetroStation.lat, selectedMetroStation.lng, a.lat, a.lng) || 999;
        const distB = getDist(selectedMetroStation.lat, selectedMetroStation.lng, b.lat, b.lng) || 999;
        return distA - distB;
      });
    }

    // Text search filter
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.bengaliName && r.bengaliName.toLowerCase().includes(q)) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.specialty.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q) ||
          (r.type && r.type.toLowerCase().includes(q)) ||
          r.mustTryDishes.some((d) => d.toLowerCase().includes(q))
      );
    }

    // Proximity sorting
    if (isNearMeActive && userLocation?.lat && userLocation?.lng && !selectedMetroStation) {
      if (selectedZone === "all") {
        list = list.filter((r) => r.distanceKm !== undefined && r.distanceKm <= maxRadiusKm);
      }
      list = list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return list;
  }, [userLocation, selectedZone, searchQuery, isNearMeActive, maxRadiusKm, selectedMetroStation]);

  // Dynamic Zone Pills based on active tab
  const currentZones = useMemo(() => {
    if (activeTab === "pandals") {
      const pCounts = {};
      PANDALS_DATA.forEach((p) => {
        pCounts[p.zone] = (pCounts[p.zone] || 0) + 1;
      });
      return [
        { id: "all", label: `All Zones (${PANDALS_DATA.length})` },
        { id: "south", label: `South Kolkata (${pCounts.south || 0})` },
        { id: "north", label: `North Kolkata (${pCounts.north || 0})` },
        { id: "central", label: `Central Kolkata (${pCounts.central || 0})` },
        { id: "southwest", label: `South-West Kolkata (${pCounts.southwest || 0})` },
        { id: "east", label: `East & Salt Lake (${pCounts.east || 0})` },
        { id: "howrah", label: `Howrah & Salkia (${pCounts.howrah || 0})` },
        { id: "siliguri", label: `Siliguri (${pCounts.siliguri || 0})` },
        { id: "port", label: `Port Area (${pCounts.port || 0})` },
        { id: "others", label: `Greater Bengal (${pCounts.others || 0})` }
      ];
    } else {
      const rCounts = {};
      RESTAURANTS_DATA.forEach((r) => {
        rCounts[r.zone] = (rCounts[r.zone] || 0) + 1;
      });
      return [
        { id: "all", label: `All Eateries (${RESTAURANTS_DATA.length})` },
        { id: "south", label: `South Kolkata (${rCounts.south || 0})` },
        { id: "central", label: `Central & Park St (${rCounts.central || 0})` },
        { id: "north", label: `North Kolkata (${rCounts.north || 0})` },
        { id: "east", label: `Salt Lake & Tangra (${rCounts.east || 0})` },
        { id: "southwest", label: `South-West / Behala (${rCounts.southwest || 0})` },
        { id: "howrah", label: `Howrah (${rCounts.howrah || 0})` }
      ];
    }
  }, [activeTab]);

  const handleTabSwitch = (newTab) => {
    setActiveTab(newTab);
    setVisibleCount(24);
    setVisibleFoodCount(24);
    // If switching to food and selected zone has no restaurants, reset to "all"
    if (newTab === "food" && selectedZone !== "all") {
      const exists = RESTAURANTS_DATA.some((r) => r.zone === selectedZone);
      if (!exists) {
        setSelectedZone("all");
      }
    }
  };

  const handleResetFilters = () => {
    setSelectedZone("all");
    setSelectedCategory("All Themes");
    setCrowdFilter("all");
    setSearchQuery("");
    setVisibleCount(24);
    setVisibleFoodCount(24);
    if (onSelectMetroStation) onSelectMetroStation(null);
  };

  return (
    <section id="pandals" className="py-12 md:py-20 bg-[#0B080E] relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 sm:pb-6 border-b border-white/10 gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-semibold mb-2">
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Full Bengal Directory · 781+ Verified Pandals & 228+ Iconic Eateries</span>
            </div>
            <h2 className="font-heritage text-xl sm:text-3xl md:text-5xl font-black text-white">
              Pujo & Food <span className="text-gold-gradient">Navigation Hub</span>
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-300 mt-0.5 sm:mt-1">
              Navigate pandals and legendary food joints by live GPS distance, metro stations, and districts.
            </p>
          </div>

          {/* Near Me GPS Master Switch */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleNearMe}
              className={`px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 transition-all shadow-xl ${
                isNearMeActive
                  ? "bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400"
                  : "bg-[#181122] hover:bg-[#221730] text-amber-300 border border-amber-500/30"
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isNearMeActive ? "text-white animate-spin" : "text-amber-400"}`} />
              <span>{isNearMeActive ? "📍 Near Me (Active GPS)" : "📍 Sort By Near Me (GPS)"}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: 781+ Pandals vs 228+ Eateries */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => handleTabSwitch("pandals")}
            className={`flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition border min-w-0 ${
              activeTab === "pandals"
                ? "bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-[#140E1B] text-slate-300 border-white/10 hover:border-amber-400/30"
            }`}
          >
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap font-bold">781+ Pandals</span>
          </button>

          <button
            onClick={() => handleTabSwitch("food")}
            className={`flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition border min-w-0 ${
              activeTab === "food"
                ? "bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-[#140E1B] text-slate-300 border-white/10 hover:border-amber-400/30"
            }`}
          >
            <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap font-bold">228+ Eateries</span>
          </button>
        </div>


        {/* Active Metro Filter Banner (if selected) */}
        {selectedMetroStation && (
          <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-[#1B1128] border-2 border-amber-400/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-fadeIn">
            <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5 sm:mt-0">
                <Train className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-amber-300">
                    🚇 Filtered by Metro: {selectedMetroStation.name}
                  </span>
                  <span className="text-[10px] text-amber-200/80 font-bengali">
                    ({selectedMetroStation.bengaliName})
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-200 border border-amber-400/30 font-semibold inline-block">
                    {selectedMetroStation.lineName}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-300 mt-1 line-clamp-2">
                  {selectedMetroStation.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectMetroStation && onSelectMetroStation(null)}
              className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center justify-center space-x-1 flex-shrink-0 border border-white/10"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Metro Filter</span>
            </button>
          </div>
        )}

        {/* Near Me Radius Selector Bar (Shows when Near Me is active) */}
        {isNearMeActive && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-xs font-bold text-white">Live GPS Proximity Filter:</span>
              <span className="text-xs text-rose-300">
                {userLocation?.lat ? (userLocation.accuracy ? `Coordinates locked (±${Math.round(userLocation.accuracy)}m)` : "Coordinates locked") : "Detecting browser GPS..."}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-300">Radius:</span>
              {[2, 5, 10, 20].map((r) => (
                <button
                  key={r}
                  onClick={() => setMaxRadiusKm(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    maxRadiusKm === r
                      ? "bg-rose-600 text-white"
                      : "bg-white/5 hover:bg-white/10 text-slate-300"
                  }`}
                >
                  Within {r} km
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search & Main Filter Controls */}
        <div className="space-y-4 mb-8">
          
          {/* Top Search Input */}
          <div className="space-y-2">
            <div className="relative" data-tour="search-filters">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(24);
                }}
                placeholder={
                  activeTab === "pandals"
                    ? "Search 781+ pandals (e.g. Sribhumi, Jorasanko Daw Bari, Beleghata Karmi)..."
                    : "Search 228+ eateries (e.g. Peter Cat, Arsalan, Mitra Cafe, Dada Boudi)..."
                }
                className="w-full py-3.5 pl-11 pr-4 bg-[#140E1B] border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Smart Homophone / Pandal Suggestions Strip */}
            {smartSuggestions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 px-1 animate-fadeIn">
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Suggestions:
                </span>
                {smartSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(sug);
                      setVisibleCount(24);
                    }}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition flex items-center gap-1"
                  >
                    <span>💡 {sug}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Metro Station Filter Bar (High Mobile Discoverability) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-blue-300 flex items-center space-x-1 flex-shrink-0 bg-blue-950/60 px-2.5 py-1.5 rounded-xl border border-blue-500/40">
              <Train className="w-3.5 h-3.5 text-blue-400 mr-1" />
              <span>Metro Stations:</span>
            </span>

            {[
              { id: "all", name: "All Stations" },
              { id: "esplanade", name: "Esplanade" },
              { id: "kalighat", name: "Kalighat" },
              { id: "dum_dum", name: "Dum Dum" },
              { id: "shobhabazar", name: "Sovabazar" },
              { id: "shyambazar", name: "Shyambazar" },
              { id: "howrah", name: "Howrah" },
              { id: "sealdah", name: "Sealdah" },
              { id: "city_centre", name: "City Centre" },
              { id: "rabindra_sarobar", name: "Rabindra Sarobar" }
            ].map((st) => {
              const stationObj = st.id === "all" ? null : METRO_STATIONS.find(s => s.id === st.id);
              const isSelected = st.id === "all" ? !selectedMetroStation : selectedMetroStation?.id === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    if (onSelectMetroStation) {
                      onSelectMetroStation(stationObj);
                      if (stationObj) {
                        setSelectedZone("all");
                        setSearchQuery("");
                      }
                    }
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold border-blue-400 shadow-md shadow-blue-600/30"
                      : "bg-[#141022] text-slate-300 border-white/10 hover:border-blue-400/40 hover:text-white"
                  }`}
                >
                  {st.name}
                </button>
              );
            })}
          </div>

          {/* Zone Selector Tabs (Scrollable on mobile) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {currentZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone.id);
                  setVisibleCount(24);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedZone === zone.id
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-[#140E1B] text-slate-300 border border-white/5 hover:border-amber-400/30 hover:text-white"
                }`}
              >
                {zone.label}
              </button>
            ))}
          </div>

          {/* Sub-Category Pills & Count Stats */}
          {activeTab === "pandals" && (
            <div className="space-y-2 pt-1">
              {/* Mobile Filter Toggle Button */}
              <div className="sm:hidden flex items-center justify-between">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showMobileFilters ? "Hide Theme Filters" : `Themes: ${selectedCategory}`}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMobileFilters ? "rotate-180" : ""}`} />
                </button>

                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 transition"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

              </div>

              {/* Theme Pills Grid (Always visible on sm+, toggleable on mobile) */}
              <div className={`flex flex-wrap items-center justify-between gap-2.5 ${showMobileFilters ? "flex" : "hidden sm:flex"}`}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setVisibleCount(24);
                      }}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition ${
                        selectedCategory === cat
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Desktop Reset / Count stats */}
                <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400 ml-auto">
                  <span>Showing <strong>{Math.min(visibleCount, filteredPandals.length)}</strong> of <strong>{filteredPandals.length}</strong> pandals</span>
                  <button
                    onClick={handleResetFilters}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 transition"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* --- VIEW 1: PANDALS DIRECTORY GRID (503 PANDALS) --- */}
        {activeTab === "pandals" && (
          <>
            {displayedPandals.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {displayedPandals.map((pandal) => (
                    <PandalCard
                      key={pandal.id}
                      pandal={pandal}
                      userLocation={userLocation}
                      onOpenModal={onOpenModal}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {visibleCount < filteredPandals.length && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      Load More Pandals ({filteredPandals.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-white/10">
                <Compass className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
                <h3 className="font-heritage text-xl font-bold text-white mb-2">No Pandals Found</h3>
                <p className="text-xs text-slate-300 mb-6">
                  We couldn't find any pandal matching your current filter criteria. Try clicking Reset Filters to view all 781+ pandals.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* --- VIEW 2: RESTAURANTS & FOOD SPOTS GRID (228+ SPOTS PAGINATED) --- */}
        {activeTab === "food" && (
          <>
            <div className="mb-6 flex items-center justify-between text-xs text-slate-400">
              <span>Showing <strong>{Math.min(visibleFoodCount, filteredRestaurants.length)}</strong> of <strong>{filteredRestaurants.length}</strong> iconic Kolkata Puja food spots & restaurants</span>
              <button
                onClick={handleResetFilters}
                className="text-amber-400 hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>

            {filteredRestaurants.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {filteredRestaurants.slice(0, visibleFoodCount).map((rest) => (
                    <RestaurantCard
                      key={rest.id}
                      restaurant={rest}
                      userLocation={userLocation}
                    />
                  ))}
                </div>

                {/* Load More Eateries Button */}
                {visibleFoodCount < filteredRestaurants.length && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => setVisibleFoodCount((prev) => prev + 24)}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      Load More Food Spots ({filteredRestaurants.length - visibleFoodCount} remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-white/10">
                <Utensils className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
                <h3 className="font-heritage text-xl font-bold text-white mb-2">No Restaurants Found</h3>
                <p className="text-xs text-slate-300 mb-6">
                  No food spots matched your current search or zone. Try clearing your search.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
