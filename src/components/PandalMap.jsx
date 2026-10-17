import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { PANDALS_DATA } from "../data/pandalsData";
import { RESTAURANTS_DATA } from "../data/restaurantsData";
import { getPandalEnrichedMeta } from "../utils/pandalMetadataHelper";
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Layers, 
  ExternalLink, 
  Globe, 
  ZoomIn, 
  Sparkles, 
  Route, 
  Radio, 
  Crosshair, 
  Footprints,
  Bike,
  Train,
  Brain,
  Loader2,
  Utensils,
  Clock,
  Bus,
  Users,
  Flame,
  X,
  Plus,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2
} from "lucide-react";
import RoutePlanner from "./RoutePlanner";
import ExpressHopModal from "./ExpressHopModal";
import { fetchStreetRoute } from "../utils/streetRouter";
import { buildGoogleMapsNavUrl, buildGoogleTransitUrl } from "../utils/navigationHelper";
import { isPandalVisited, togglePandalVisited, getVisitedCount } from "../utils/visitedStorage";

export default function PandalMap({ userLocation, onOpenModal, selectedZone, onUpdateUserLocation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const restaurantsLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userAccuracyCircleRef = useRef(null);
  const watchIdRef = useRef(null);
  const userLocationRef = useRef(userLocation);
  const targetPandalsRef = useRef([]);
  const targetRestaurantsRef = useRef([]);
  const updateDebounceTimerRef = useRef(null);
  const showRestaurantsRef = useRef(false);
  const isRouteFocusedRef = useRef(false);
  const renderVisibleMarkersRef = useRef(null);
  const followUserRef = useRef(false);

  // Sync ref continuously without re-rendering markers
  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const [activeZone, setActiveZone] = useState("all");
  const [activeMapPlan, setActiveMapPlan] = useState(null);
  const [travelMode, setTravelMode] = useState("smart");
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [streetRouteMeta, setStreetRouteMeta] = useState(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(null);
  const [isRouteFocused, setIsRouteFocused] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [selectedSpotCard, setSelectedSpotCard] = useState(null);
  const [externalSpotToAdd, setExternalSpotToAdd] = useState(null);
  const [addedSpotToast, setAddedSpotToast] = useState("");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [visitedCount, setVisitedCount] = useState(() => getVisitedCount());
  const [hideVisitedOnMap, setHideVisitedOnMap] = useState(false);
  const hideVisitedOnMapRef = useRef(false);
  hideVisitedOnMapRef.current = hideVisitedOnMap;

  // Listen to open-express-hop-modal event dispatched from RoutePlanner or elsewhere
  useEffect(() => {
    const handleOpenExpress = () => setIsExpressModalOpen(true);
    window.addEventListener("open-express-hop-modal", handleOpenExpress);
    return () => window.removeEventListener("open-express-hop-modal", handleOpenExpress);
  }, []);

  // Listen to visited pandals reactive updates
  useEffect(() => {
    const handleVisitedChange = (e) => {
      setVisitedCount(e?.detail?.totalCount ?? getVisitedCount());
      renderVisibleMarkersRef.current?.();
    };
    window.addEventListener("aamar-visited-changed", handleVisitedChange);
    return () => window.removeEventListener("aamar-visited-changed", handleVisitedChange);
  }, []);

  const handleToggleMapFullscreen = () => {
    const nextState = !isMapFullscreen;
    setIsMapFullscreen(nextState);

    if (nextState) {
      const el = document.documentElement;
      if (el.requestFullscreen && !document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      }
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  };

  // Helper function to update user location marker and accuracy aura
  const updateUserMarkerAndCircle = (coords, accuracy, shouldPan = false) => {
    if (!mapInstanceRef.current || !coords?.lat || !coords?.lng) return;
    const map = mapInstanceRef.current;

    const userIcon = L.divIcon({
      className: "user-gps-marker",
      html: `
        <div style="
          background: #3B82F6;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 0 16px #3B82F6;
          animation: pulse 2s infinite;
        "></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
    } else {
      userMarkerRef.current = L.marker([coords.lat, coords.lng], {
        icon: userIcon,
        zIndexOffset: 2000
      })
        .addTo(map)
        .bindPopup("<strong style='color:#3B82F6;'>📍 Your Live GPS Position</strong>");
    }

    const accRadius = typeof accuracy === "number" && accuracy > 0 ? accuracy : 20;
    if (userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current.setLatLng([coords.lat, coords.lng]);
      userAccuracyCircleRef.current.setRadius(accRadius);
    } else {
      userAccuracyCircleRef.current = L.circle([coords.lat, coords.lng], {
        radius: accRadius,
        color: "#3B82F6",
        weight: 1.5,
        opacity: 0.6,
        fillColor: "#3B82F6",
        fillOpacity: 0.12
      }).addTo(map);
    }

    if (shouldPan && followUserRef.current) {
      map.panTo([coords.lat, coords.lng], { animate: true, duration: 0.5 });
    }
  };

  // Continuous Live GPS Tracking Watcher
  useEffect(() => {
    if (!isLiveTracking) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsLiveTracking(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        // If current accuracy is already high (< 25m), don't let a degraded reading (> 120m) cause marker jumps
        if (currentAccuracy && currentAccuracy < 25 && accuracy > 120) {
          return;
        }
        setCurrentAccuracy(Math.round(accuracy));
        const newCoords = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          isLive: true
        };
        if (onUpdateUserLocation) {
          onUpdateUserLocation(newCoords);
        }
        // Marker and accuracy circle always track silently in background
        updateUserMarkerAndCircle(newCoords, accuracy, followUserRef.current);
      },
      (err) => {
        console.warn("Live GPS watchPosition error:", err);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    watchIdRef.current = id;

    return () => {
      if (id !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [isLiveTracking]);

  // Sync external userLocation prop if live tracking is idle (Does NOT touch pandal markers!)
  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng && !isLiveTracking) {
      updateUserMarkerAndCircle(userLocation, userLocation.accuracy || 20, false);
    }
  }, [userLocation]);

  // Custom Festive Marker Icon Generator (Hardware-Accelerated, Visited-Aware)
  const createFestiveIcon = (zone, isVisited = false) => {
    if (isVisited) {
      return L.divIcon({
        className: "custom-pandal-marker visited-pandal-marker",
        html: `
          <div style="
            background: #64748B;
            width: 22px;
            height: 22px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #94A3B8;
            box-shadow: 0 1px 4px rgba(0,0,0,0.6);
            opacity: 0.7;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 6px;
              height: 6px;
              background: #F1F5F9;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 22],
        popupAnchor: [0, -22]
      });
    }

    let colorClass = "#F59E0B";
    if (zone === "south") colorClass = "#E11D48";
    if (zone === "north") colorClass = "#F59E0B";
    if (zone === "central") colorClass = "#10B981";
    if (zone === "east") colorClass = "#3B82F6";
    if (zone === "howrah" || zone === "others") colorClass = "#A855F7";

    return L.divIcon({
      className: "custom-pandal-marker",
      html: `
        <div style="
          background: ${colorClass};
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          will-change: transform;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 7px;
            height: 7px;
            background: #000000;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  };

  // Custom Foodie Marker Icon Generator (Hardware-Accelerated)
  const createFoodieIcon = () => {
    return L.divIcon({
      className: "custom-foodie-marker",
      html: `
        <div style="
          background: #F59E0B;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          will-change: transform;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        ">
          🍴
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    });
  };

  // Keep refs in sync with state on every render
  useEffect(() => {
    showRestaurantsRef.current = showRestaurants;
  }, [showRestaurants]);

  useEffect(() => {
    isRouteFocusedRef.current = isRouteFocused;
  }, [isRouteFocused]);

  // 60 FPS Viewport Bounds Culling: Only mounts ~35 markers in view box
  const renderVisibleMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const map = mapInstanceRef.current;
    const bounds = map.getBounds().pad(0.15); // 15% outer buffer for seamless mobile drag

    // 1. Pandal markers culling
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();
    const pandals = targetPandalsRef.current || [];
    for (let i = 0; i < pandals.length; i++) {
      const p = pandals[i];
      if (bounds.contains([p.lat, p.lng])) {
        const isVisited = isPandalVisited(p.id);
        if (hideVisitedOnMapRef.current && isVisited) {
          continue;
        }
        const marker = L.marker([p.lat, p.lng], {
          icon: createFestiveIcon(p.zone, isVisited),
          zIndexOffset: isVisited ? -100 : 0
        });
        marker.on("click", () => {
          setSelectedSpotCard({ spot: p, type: "pandal" });
        });
        markersLayer.addLayer(marker);
      }
    }

    // 2. Restaurant markers culling (always read from showRestaurantsRef for guaranteed scroll persistence)
    if (restaurantsLayerRef.current) {
      const restLayer = restaurantsLayerRef.current;
      restLayer.clearLayers();
      if (showRestaurantsRef.current) {
        const rests = targetRestaurantsRef.current || [];
        for (let i = 0; i < rests.length; i++) {
          const r = rests[i];
          if (bounds.contains([r.lat, r.lng])) {
            const marker = L.marker([r.lat, r.lng], {
              icon: createFoodieIcon()
            });
            marker.on("click", () => {
              setSelectedSpotCard({ spot: r, type: "restaurant" });
            });
            restLayer.addLayer(marker);
          }
        }
      }
    }
  }, []);

  // Update ref callback on every render
  renderVisibleMarkersRef.current = renderVisibleMarkers;

  // Initialize Map Instance Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5726, 88.3639],
        zoom: 12,
        minZoom: 7,
        maxZoom: 18,
        preferCanvas: true, // Hardware-accelerated canvas for vector paths & polylines
        zoomControl: false // Custom placement for clean mobile view
      });

      // Dark Theme Tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
        className: "osm-dark-tiles"
      }).addTo(map);

      // Custom Zoom Control at Bottom Right to prevent overlay collision
      L.control.zoom({ position: "bottomright" }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      restaurantsLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Viewport Bounds Culling listener: Debounced 60ms on pan/pinch scroll
      map.on("moveend zoomend", () => {
        if (updateDebounceTimerRef.current) clearTimeout(updateDebounceTimerRef.current);
        updateDebounceTimerRef.current = setTimeout(() => {
          renderVisibleMarkersRef.current?.();
        }, 60);
      });

      // Free-scroll decoupling: Immediately unlock camera from GPS auto-centering when user touches, drags, or zooms map!
      map.on("dragstart touchstart zoomstart", () => {
        followUserRef.current = false;
        setFollowUser(false);
      });

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Target Pandals & Trigger Viewport Culling
  useEffect(() => {
    const targetPandals = (isRouteFocused && activeMapPlan?.spots?.length >= 2)
      ? []
      : (activeZone === "all" 
          ? PANDALS_DATA 
          : PANDALS_DATA.filter((p) => p.zone === activeZone));

    targetPandalsRef.current = targetPandals;
    renderVisibleMarkers();
  }, [activeZone, isRouteFocused, activeMapPlan?.spots?.length, renderVisibleMarkers]);

  // Update Target Restaurants & Trigger Viewport Culling
  useEffect(() => {
    showRestaurantsRef.current = showRestaurants;
    const targetRestaurants = activeZone === "all"
      ? RESTAURANTS_DATA
      : RESTAURANTS_DATA.filter((r) => r.zone === activeZone);

    targetRestaurantsRef.current = targetRestaurants;
    renderVisibleMarkers();
  }, [showRestaurants, activeZone, renderVisibleMarkers]);

  // Road-Snapped Street Polyline & Numbered Step Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    const routeLayer = routeLayerRef.current;
    routeLayer.clearLayers();

    if (!activeMapPlan || !activeMapPlan.spots || activeMapPlan.spots.length === 0) {
      setStreetRouteMeta(null);
      return;
    }

    const spots = activeMapPlan.spots;
    let isCancelled = false;

    // Filter out seen/visited pandals so they are pruned from leftover walking route plan
    const leftoverSpots = spots.filter((s) => s.isRestaurant || s.cuisine || !isPandalVisited(s.id));

    // Assemble complete route sequence including optional startPoint and endPoint
    const fullRoutePoints = [];
    if (activeMapPlan.startPoint && activeMapPlan.startPoint.lat && activeMapPlan.startPoint.lng) {
      if (!leftoverSpots[0] || leftoverSpots[0].lat !== activeMapPlan.startPoint.lat || leftoverSpots[0].lng !== activeMapPlan.startPoint.lng) {
        fullRoutePoints.push({
          ...activeMapPlan.startPoint,
          isStartAnchor: true
        });
      }
    }
    fullRoutePoints.push(...leftoverSpots);
    if (activeMapPlan.endPoint && activeMapPlan.endPoint.lat && activeMapPlan.endPoint.lng) {
      const last = fullRoutePoints[fullRoutePoints.length - 1];
      if (!last || last.lat !== activeMapPlan.endPoint.lat || last.lng !== activeMapPlan.endPoint.lng) {
        fullRoutePoints.push({
          ...activeMapPlan.endPoint,
          isEndAnchor: true
        });
      }
    }

    // Draw route along actual pedestrian roads, road vehicular streets, or metro rail corridors
    if (fullRoutePoints.length >= 2) {
      setIsRoutingLoading(true);

      const routeMode = travelMode === "foot" ? "foot" : travelMode === "metro" ? "metro" : "road";

      fetchStreetRoute(fullRoutePoints, { mode: routeMode })
        .then((routeResult) => {
          if (isCancelled || !routeLayerRef.current) return;

          const polyCoords = routeResult.coordinates;

          if (travelMode === "metro") {
            L.polyline(polyCoords, {
              color: "#0284C7",
              weight: 4.5,
              opacity: 0.8,
              lineCap: "round",
              lineJoin: "round"
            }).addTo(routeLayer);

            L.polyline(polyCoords, {
              color: "#38BDF8",
              weight: 2,
              opacity: 1,
              dashArray: "10, 8",
              lineCap: "round"
            }).addTo(routeLayer);
          } else if (travelMode === "road" || travelMode === "bike") {
            L.polyline(polyCoords, {
              color: "#059669",
              weight: 4,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round"
            }).addTo(routeLayer);

            L.polyline(polyCoords, {
              color: "#34D399",
              weight: 1.8,
              opacity: 1,
              dashArray: "6, 8",
              lineCap: "round"
            }).addTo(routeLayer);
          } else {
            L.polyline(polyCoords, {
              color: "#E11D48",
              weight: 4,
              opacity: 0.8,
              lineCap: "round",
              lineJoin: "round"
            }).addTo(routeLayer);

            L.polyline(polyCoords, {
              color: "#FB7185",
              weight: 1.8,
              opacity: 1,
              dashArray: "6, 8",
              lineCap: "round"
            }).addTo(routeLayer);
          }

          setStreetRouteMeta(routeResult);
          setIsRoutingLoading(false);
        })
        .catch((err) => {
          if (isCancelled) return;
          console.warn("Street routing fallback to direct polyline:", err);
          const fallbackCoords = fullRoutePoints.map((s) => [s.lat, s.lng]);
          L.polyline(fallbackCoords, {
            color: "#E11D48",
            weight: 3,
            opacity: 0.8,
            dashArray: "6, 6"
          }).addTo(routeLayer);

          setIsRoutingLoading(false);
        });
    }

    // Departure Start Marker (if distinct from Spot #1)
    if (activeMapPlan.startPoint && activeMapPlan.startPoint.lat && activeMapPlan.startPoint.lng) {
      const isSameAsFirst = spots[0] && spots[0].lat === activeMapPlan.startPoint.lat && spots[0].lng === activeMapPlan.startPoint.lng;
      if (!isSameAsFirst) {
        const startIcon = L.divIcon({
          className: "route-start-marker",
          html: `
            <div style="
              background: #10B981;
              color: #ffffff;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2.5px solid #ffffff;
              box-shadow: 0 0 16px #10B981cc;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
            ">
              🏁
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const startMarker = L.marker([activeMapPlan.startPoint.lat, activeMapPlan.startPoint.lng], {
          icon: startIcon,
          zIndexOffset: 1500
        });

        startMarker.on("click", () => {
          setSelectedSpotCard({ spot: activeMapPlan.startPoint, type: "anchor" });
        });

        routeLayer.addLayer(startMarker);
      }
    }

    // Sequential Route Markers (1 to N, slate grey if already seen!)
    spots.forEach((spot, idx) => {
      const stepNum = idx + 1;
      const isRestaurant = spot.isRestaurant || spot.cuisine;
      const isVisited = !isRestaurant && isPandalVisited(spot.id);

      const stepIcon = L.divIcon({
        className: "route-step-marker",
        html: `
          <div style="
            background: ${isVisited ? "#64748B" : isRestaurant ? "#10B981" : "#E11D48"};
            color: #ffffff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid ${isVisited ? "#94A3B8" : "#ffffff"};
            box-shadow: 0 0 14px ${isVisited ? "#64748B88" : isRestaurant ? "#10B981aa" : "#E11D48aa"};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 13px;
            opacity: ${isVisited ? "0.65" : "1"};
          ">
            ${isVisited ? "✓" : isRestaurant ? "🍽️" : stepNum}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([spot.lat, spot.lng], {
        icon: stepIcon,
        zIndexOffset: isVisited ? 500 + idx : 1000 + idx
      });

      marker.on("click", () => {
        setSelectedSpotCard({ spot, type: isRestaurant ? "restaurant" : "pandal" });
      });

      routeLayer.addLayer(marker);
    });

    // Arrival End Marker (if distinct from Spot #N)
    if (activeMapPlan.endPoint && activeMapPlan.endPoint.lat && activeMapPlan.endPoint.lng) {
      const lastSpot = spots[spots.length - 1];
      const isSameAsLast = lastSpot && lastSpot.lat === activeMapPlan.endPoint.lat && lastSpot.lng === activeMapPlan.endPoint.lng;
      if (!isSameAsLast) {
        const endIcon = L.divIcon({
          className: "route-end-marker",
          html: `
            <div style="
              background: #3B82F6;
              color: #ffffff;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2.5px solid #ffffff;
              box-shadow: 0 0 16px #3B82F6cc;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
            ">
              🎯
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const endMarker = L.marker([activeMapPlan.endPoint.lat, activeMapPlan.endPoint.lng], {
          icon: endIcon,
          zIndexOffset: 1501
        });

        endMarker.on("click", () => {
          setSelectedSpotCard({ spot: activeMapPlan.endPoint, type: "anchor" });
        });

        routeLayer.addLayer(endMarker);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [activeMapPlan, travelMode, visitedCount]);

  const zoomToActiveRoute = () => {
    if (mapInstanceRef.current && activeMapPlan?.spots?.length >= 2) {
      const latlngs = activeMapPlan.spots.map((s) => [s.lat, s.lng]);
      mapInstanceRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50], maxZoom: 15 });
    }
  };

  const zoomToKolkata = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([22.5626, 88.3639], 12);
    }
  };

  const zoomToWestBengal = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([23.2, 88.0], 8);
    }
  };

  const centerOnUser = () => {
    if (mapInstanceRef.current && userLocation?.lat && userLocation?.lng) {
      followUserRef.current = true;
      setFollowUser(true);
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    } else {
      setIsLiveTracking(true);
      followUserRef.current = true;
      setFollowUser(true);
    }
  };

  // Add Spot to Route Planner directly from map detail drawer
  const handleAddSpotToPlan = (spot) => {
    setExternalSpotToAdd(spot);
    setAddedSpotToast(`✨ Added "${spot.name}" to your Route Plan!`);
    setTimeout(() => setAddedSpotToast(""), 4000);
  };

  return (
    <section id="map" className="py-10 md:py-16 bg-[#08050B] min-h-[85vh] relative flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>West Bengal Geospatial Map · 661+ Verified Pandals · 228+ Iconic Eateries</span>
            </div>
            <h2 className="font-heritage text-2xl sm:text-3xl md:text-5xl font-black text-white">
              Map & <span className="text-gold-gradient">AI Route Planner</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              পশ্চিমবঙ্গ ম্যাপ ও স্মার্ট শারদ রুট প্ল্যানার · Interactive geospatial map & turn-by-turn road navigation
            </p>
          </div>

          {/* Quick Toolbar (Row 1: Actions & Tools, Row 2: Smooth Horizontal Zone Scroll) */}
          <div className="space-y-2.5 max-w-full">
            {/* Row 1: Primary Utility Switches */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {/* ⚡ Time-Crunch Express Shortlist Modal Trigger */}
              <button
                onClick={() => setIsExpressModalOpen(true)}
                data-tour="express-hop-btn"
                className="px-3 py-1.5 rounded-xl text-xs font-black border transition flex items-center space-x-1.5 flex-shrink-0 shadow-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 border-amber-300 shadow-amber-500/25 active:scale-95 cursor-pointer"
                title="Short on time? Pick top 2 to 10 breakout art pandals trending on Instagram!"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
                <span>⚡ Express Hop</span>
                {visitedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-950/40 text-[10px] text-amber-200 font-bold">
                    {visitedCount} seen
                  </span>
                )}
              </button>

              {/* Route Focus Mode (if plan has >= 2 spots) */}
              {activeMapPlan?.spots?.length >= 2 && (
                <button
                  onClick={() => {
                    const nextFocused = !isRouteFocused;
                    setIsRouteFocused(nextFocused);
                    if (nextFocused) {
                      zoomToActiveRoute();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 flex-shrink-0 shadow-lg ${
                    isRouteFocused
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-amber-400/30 scale-105"
                      : "bg-gradient-to-r from-amber-500/30 to-rose-600/30 text-amber-300 border-amber-500/40"
                  }`}
                  title={isRouteFocused ? "Show all pandal pins on map" : "Hide all other pandals to focus only on your route circuit"}
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>{isRouteFocused ? "👁️ All Pins" : `🎯 Focus Route (${activeMapPlan.spots.length})`}</span>
                </button>
              )}

              {/* Visited Pins Filter Switch */}
              {visitedCount > 0 && (
                <button
                  onClick={() => {
                    const next = !hideVisitedOnMap;
                    setHideVisitedOnMap(next);
                    hideVisitedOnMapRef.current = next;
                    renderVisibleMarkersRef.current?.();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 flex-shrink-0 shadow-sm ${
                    hideVisitedOnMap
                      ? "bg-slate-700 text-emerald-300 border-emerald-500/40 font-bold"
                      : "bg-white/10 hover:bg-white/15 text-slate-300 border-white/10"
                  }`}
                  title={hideVisitedOnMap ? "Currently hiding visited pandals from map. Tap to show grey pins." : "Tap to hide visited pandals completely from map"}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{hideVisitedOnMap ? "🙈 Hiding Seen" : `👁️ Seen (${visitedCount})`}</span>
                </button>
              )}

              {/* Food & Restaurant Toggle Layer */}
              <button
                onClick={() => setShowRestaurants((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 flex-shrink-0 shadow-sm ${
                  showRestaurants
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-amber-500/20"
                    : "bg-white/10 hover:bg-white/15 text-amber-300 border-amber-500/30"
                }`}
                title="Toggle 228+ iconic Kolkata food spots and eateries on map"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>{showRestaurants ? "🍽️ Food: ON (228)" : "🍽️ Food Layer"}</span>
              </button>

              {/* Live GPS Toggle */}
              <button
                onClick={() => {
                  const nextState = !isLiveTracking;
                  setIsLiveTracking(nextState);
                  if (nextState) {
                    followUserRef.current = true;
                    setFollowUser(true);
                    if (userLocationRef.current?.lat && userLocationRef.current?.lng && mapInstanceRef.current) {
                      mapInstanceRef.current.panTo([userLocationRef.current.lat, userLocationRef.current.lng], { animate: true, duration: 0.5 });
                    }
                  } else {
                    followUserRef.current = false;
                    setFollowUser(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 flex-shrink-0 shadow-lg ${
                  isLiveTracking
                    ? "bg-blue-600/40 text-blue-300 border-blue-500/50 shadow-blue-500/20 animate-pulse"
                    : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                }`}
                title="Toggle continuous live GPS tracking as you walk"
              >
                <Radio className={`w-3.5 h-3.5 ${isLiveTracking ? "text-blue-400 animate-spin" : "text-slate-400"}`} />
                <span>{isLiveTracking ? (currentAccuracy ? `GPS (±${currentAccuracy}m)` : "GPS: ON") : "Live GPS"}</span>
              </button>

              {/* Center Me */}
              {userLocation?.lat && (
                <button
                  onClick={centerOnUser}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition flex items-center space-x-1 flex-shrink-0"
                  title="Center map on your current location"
                >
                  <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                  <span>Center Me</span>
                </button>
              )}

              {/* Quick Reset Presets */}
              <button
                onClick={zoomToKolkata}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold border border-rose-500/30 transition flex items-center space-x-1 flex-shrink-0"
              >
                <ZoomIn className="w-3.5 h-3.5 text-rose-400" />
                <span>Kolkata</span>
              </button>
              {/* Bengal Preset */}
              <button
                onClick={zoomToWestBengal}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition flex items-center space-x-1 flex-shrink-0"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Bengal</span>
              </button>

              {/* Edge-to-Edge Fullscreen Map Toggle */}
              <button
                onClick={handleToggleMapFullscreen}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1 flex-shrink-0 shadow-md cursor-pointer ${
                  isMapFullscreen
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-amber-400/30"
                    : "bg-[#181124] hover:bg-[#221733] text-amber-300 border-amber-500/40"
                }`}
                title={isMapFullscreen ? "Exit Edge-to-Edge Map" : "Open Edge-to-Edge Fullscreen Map"}
              >
                {isMapFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isMapFullscreen ? "Exit Full" : "⛶ Full Map"}</span>
              </button>
            </div>

            {/* Row 2: Smooth Horizontal Scrollable Zones Chip Bar (Never wraps!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: "all", label: "All Pandals (661)" },
                { id: "south", label: "South (244)" },
                { id: "north", label: "North (156)" },
                { id: "central", label: "Central (82)" },
                { id: "east", label: "East (56)" },
                { id: "howrah", label: "Howrah (20)" },
                { id: "siliguri", label: "Siliguri (20)" }
              ].map((z) => (
                <button
                  key={z.id}
                  onClick={() => {
                    setActiveZone(z.id);
                    if (isRouteFocused) setIsRouteFocused(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition ${
                    activeZone === z.id && !isRouteFocused
                      ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20"
                      : "bg-[#140E1B] text-slate-300 hover:text-white border border-white/5"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Canvas Frame (Supports edge-to-edge full screen) */}
        <div className={`transition-all duration-300 ${
          isMapFullscreen
            ? "fixed inset-0 z-50 rounded-none border-0 h-[100dvh] w-screen bg-[#0E0A14]"
            : "relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl h-[520px] sm:h-[620px] bg-[#0E0A14]"
        }`}>
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Exit Button in Fullscreen Mode */}
          {isMapFullscreen && (
            <button
              onClick={handleToggleMapFullscreen}
              className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-xl bg-black/85 hover:bg-black text-white border border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
            >
              <Minimize2 className="w-4 h-4 text-amber-400" />
              <span>Exit Full Map</span>
            </button>
          )}

          {/* Unified Responsive Top Control Bar (Never collides or overlaps on mobile!) */}
          {activeMapPlan?.spots?.length >= 2 && (
            <div className="absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
              {/* Route Status Badge */}
              <div className="pointer-events-auto glass-panel rounded-2xl px-3 py-1.5 border border-amber-500/30 text-xs flex items-center space-x-2 shadow-xl backdrop-blur-md bg-slate-950/85 max-w-full">
                {isRoutingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
                    <span className="text-amber-200 font-medium truncate text-[11px]">
                      {travelMode === "metro"
                        ? "Snapping to Kolkata Metro rail..."
                        : (travelMode === "road" || travelMode === "bike")
                        ? "Snapping to paved road streets..."
                        : travelMode === "smart"
                        ? "Evaluating multi-modal smart route..."
                        : "Snapping to walking lanes..."}
                    </span>
                  </>
                ) : (
                  <>
                    {travelMode === "metro" ? (
                      <Train className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    ) : (travelMode === "road" || travelMode === "bike") ? (
                      <Bike className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : travelMode === "smart" ? (
                      <Brain className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <Footprints className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-amber-300 flex items-center space-x-1.5 flex-wrap">
                        <span className="truncate text-xs">
                          {travelMode === "metro"
                            ? "🚇 Metro Transit"
                            : (travelMode === "road" || travelMode === "bike")
                            ? "🛵 Road Circuit"
                            : travelMode === "smart"
                            ? "🧠 Smart Route"
                            : "🚶 Walking Circuit"}
                        </span>
                        {isRouteFocused && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/25 text-amber-300 border border-amber-400/50 font-bold">
                            🎯 Focused
                          </span>
                        )}
                      </div>
                      {streetRouteMeta && (
                        <div className="text-[10px] text-slate-300 truncate">
                          {streetRouteMeta.distanceFormatted} · ~{streetRouteMeta.durationFormatted}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Travel Mode Dropdown Switcher */}
              <div className="pointer-events-auto self-end sm:self-auto glass-panel rounded-2xl p-1 border border-blue-500/50 bg-slate-950/90 shadow-xl shadow-blue-950/60 backdrop-blur-md flex items-center">
                <label htmlFor="map-travel-mode-select" className="sr-only">Travel Mode</label>
                <div className="relative">
                  <select
                    id="map-travel-mode-select"
                    value={travelMode === "bike" ? "road" : travelMode}
                    onChange={(e) => setTravelMode(e.target.value)}
                    className="appearance-none bg-blue-950/60 text-blue-400 hover:text-blue-300 pl-3 pr-7 py-1 rounded-xl border border-blue-400/50 text-[11px] font-black transition shadow-inner cursor-pointer"
                  >
                    <option value="foot" className="bg-slate-900 text-slate-100 font-semibold">🚶 Foot (Walking)</option>
                    <option value="road" className="bg-slate-900 text-slate-100 font-semibold">🛵 Road (Vehicular)</option>
                    <option value="metro" className="bg-slate-900 text-cyan-300 font-semibold">🚇 Metro (Rail)</option>
                    <option value="smart" className="bg-slate-900 text-blue-300 font-bold">🧠 Smart (AI Mode)</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 text-[9px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Persistent Map Detail Drawer (NEVER abruptly closed by GPS!) */}
          {selectedSpotCard && (() => {
            const { spot, type } = selectedSpotCard;
            const isRestaurant = type === "restaurant" || spot.isRestaurant || spot.cuisine;
            const meta = !isRestaurant ? getPandalEnrichedMeta(spot) : null;
            const navUrl = buildGoogleMapsNavUrl(spot, userLocationRef.current, travelMode === "road" ? "two_wheeler" : travelMode === "metro" ? "transit" : "walking");
            const transitUrl = buildGoogleTransitUrl(spot, userLocationRef.current);

            return (
              <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-[420px] max-w-[calc(100vw-24px)] z-30 rounded-2xl p-4 border-2 border-amber-500/50 shadow-2xl shadow-black/95 bg-[#0F0B17]/95 sm:backdrop-blur-xl animate-fadeIn space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        isRestaurant
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {isRestaurant ? "🍽️ Heritage Eatery" : "🏛️ Durga Puja Pandal"}
                      </span>
                      <span className="text-[10px] text-slate-400">{spot.locality || spot.area || spot.zoneLabel}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {spot.name}
                    </h3>
                    {spot.bengaliName && (
                      <div className="text-xs text-amber-200/90 font-bengali mt-0.5">
                        {spot.bengaliName}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedSpotCard(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Details */}
                <div className="space-y-1.5 text-xs text-slate-200">
                  {/* Metro */}
                  {spot.metro && (
                    <div className="flex items-center space-x-2 text-cyan-300 font-medium">
                      <Train className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Nearest Metro: <strong>{spot.metro}</strong></span>
                    </div>
                  )}

                  {/* Pandal Specifics: Best Time to Visit & Bus Numbers */}
                  {!isRestaurant && meta && (
                    <>
                      <div className="flex items-start space-x-2 text-amber-300 font-medium bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                        <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[11px] text-amber-200">Best Time to Visit:</div>
                          <div className="text-[11px] text-slate-200 leading-snug">{meta.bestTimeToVisit}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
                        <Bus className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="truncate">Direct Buses: <strong>{meta.busRoutes}</strong></span>
                      </div>
                    </>
                  )}

                  {/* Restaurant Specifics: Cuisine, Specialty & Timings */}
                  {isRestaurant && (
                    <>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-[11px]">
                        <div className="text-amber-300 font-bold">✨ Specialty / Must Try:</div>
                        <div className="text-slate-200 leading-snug">{spot.specialty || spot.mustTryDishes?.join(", ")}</div>
                        <div className="text-slate-400 text-[10px] pt-1 border-t border-white/10 flex items-center justify-between">
                          <span>Cuisine: {spot.cuisine}</span>
                          <span>{spot.pujoTimings || "Open late night during Puja"}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {!isRestaurant && (
                    <button
                      onClick={() => {
                        togglePandalVisited(spot.id);
                        renderVisibleMarkers();
                      }}
                      data-tour="visited-btn"
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-1 shadow-md ${
                        isPandalVisited(spot.id)
                          ? "bg-slate-700 hover:bg-slate-600 text-emerald-300 border border-emerald-500/40"
                          : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20"
                      }`}
                      title={isPandalVisited(spot.id) ? "Mark as unvisited" : "Mark as seen (turns grey on map)"}
                    >
                      <Check className={`w-3.5 h-3.5 ${isPandalVisited(spot.id) ? "text-emerald-400" : "text-slate-400"}`} />
                      <span>{isPandalVisited(spot.id) ? "Seen ✓" : "Seen?"}</span>
                    </button>
                  )}

                  <a
                    href={navUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center transition flex items-center justify-center space-x-1.5 shadow-md"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {!isRestaurant && (
                    <a
                      href={transitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-bold text-xs text-center border border-blue-500/40 transition flex items-center space-x-1"
                      title="View Live Bus routes & public transit on Google Maps"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Buses</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleAddSpotToPlan(spot)}
                    className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center space-x-1 shadow-md"
                    title="Add this spot into your active Route Planner"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Plan</span>
                  </button>

                  {!isRestaurant && onOpenModal && (
                    <button
                      onClick={() => onOpenModal(spot)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition"
                      title="View full pandal photo gallery and rituals"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Toast Notification when spot added from map */}
          {addedSpotToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl animate-bounce flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{addedSpotToast}</span>
            </div>
          )}

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 glass-panel rounded-2xl p-3 border border-white/10 text-[11px] hidden sm:flex flex-col space-y-1.5 pointer-events-none">
            <span className="font-bold text-white mb-0.5">District Markers</span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">South Kolkata (185)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">North Kolkata (114)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Central Kolkata (63)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-slate-300">East & Salt Lake (56)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-400" />
              <span className="text-slate-400">Seen / Visited (Grey)</span>
            </div>
            {showRestaurants && (
              <div className="flex items-center space-x-2 pt-1 border-t border-white/10">
                <span className="text-xs">🍴</span>
                <span className="text-amber-300 font-semibold">Iconic Eateries (228)</span>
              </div>
            )}
          </div>

        </div>

        {/* AI Route Hop Planner - Connected with Map */}
        <div className="mt-12">
          <RoutePlanner
            userLocation={userLocation}
            onSelectPlanForMap={(plan, mode) => {
              setActiveMapPlan(plan);
              if (mode && mode !== travelMode) setTravelMode(mode);
            }}
            currentTravelMode={travelMode}
            onTravelModeChange={(mode) => setTravelMode(mode)}
            onOpenModal={onOpenModal}
            externalSpotToAdd={externalSpotToAdd}
            onClearExternalSpot={() => setExternalSpotToAdd(null)}
            onOpenExpressHop={() => setIsExpressModalOpen(true)}
          />
        </div>

        {/* Express Shortlist Modal (Time-Crunch Mode) */}
        <ExpressHopModal
          isOpen={isExpressModalOpen}
          onClose={() => setIsExpressModalOpen(false)}
          userLocation={userLocation}
          activeZone={activeZone}
          currentPlanSpots={activeMapPlan?.spots || []}
          activePlanTitle={activeMapPlan?.title || ""}
          onActivatePlan={(plan) => {
            setActiveMapPlan(plan);
            setTravelMode("smart");
            setIsRouteFocused(true);
            setTimeout(() => {
              if (mapInstanceRef.current && plan?.spots?.length >= 2) {
                const latlngs = plan.spots.map((s) => [s.lat, s.lng]);
                mapInstanceRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50], maxZoom: 15 });
              }
            }, 200);
          }}
        />

      </div>
    </section>
  );
}
