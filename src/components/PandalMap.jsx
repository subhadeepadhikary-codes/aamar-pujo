import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { PANDALS_DATA } from "../data/pandalsData";
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
  Loader2
} from "lucide-react";
import RoutePlanner from "./RoutePlanner";
import { fetchWalkingStreetRoute } from "../utils/streetRouter";
import { buildGoogleMapsNavUrl } from "../utils/navigationHelper";

export default function PandalMap({ userLocation, onOpenModal, selectedZone, onUpdateUserLocation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userAccuracyCircleRef = useRef(null);
  const watchIdRef = useRef(null);

  const [activeZone, setActiveZone] = useState("all");
  const [activeMapPlan, setActiveMapPlan] = useState(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [streetRouteMeta, setStreetRouteMeta] = useState(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(null);

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

    if (shouldPan) {
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
        setCurrentAccuracy(accuracy);
        const newCoords = {
          lat: latitude,
          lng: longitude,
          accuracy,
          isLive: true
        };
        if (onUpdateUserLocation) {
          onUpdateUserLocation(newCoords);
        }
        updateUserMarkerAndCircle(newCoords, accuracy, followUser);
      },
      (err) => {
        console.warn("Live GPS watchPosition error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );

    watchIdRef.current = id;

    return () => {
      if (id !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [isLiveTracking, followUser]);

  // Sync external userLocation prop if live tracking is idle
  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng && !isLiveTracking) {
      updateUserMarkerAndCircle(userLocation, userLocation.accuracy || 20, false);
    }
  }, [userLocation]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.1, 88.0],
        zoom: 8,
        minZoom: 7,
        maxZoom: 18,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
        className: "osm-dark-tiles"
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Custom Festive Marker Icon Generator
    const createFestiveIcon = (zone) => {
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
            box-shadow: 0 0 10px ${colorClass}aa;
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

    // Filter pandals by active zone
    const targetPandals = activeZone === "all" 
      ? PANDALS_DATA 
      : PANDALS_DATA.filter((p) => p.zone === activeZone);

    // Plot pandals with universal, pinpoint Google Maps links
    targetPandals.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: createFestiveIcon(p.zone)
      });

      const navUrl = buildGoogleMapsNavUrl(p, userLocation);

      const popupContent = `
        <div style="color: #ffffff; font-family: sans-serif; min-width: 220px; padding: 6px;">
          <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #F59E0B;">${p.name}</h4>
          <p style="font-size: 11px; margin: 0 0 4px 0; color: #CBD5E1;">${p.address || p.locality} · <span style="color: #F43F5E; font-weight: bold;">${p.zoneLabel}</span></p>
          <div style="font-size: 11px; margin-bottom: 8px; color: #94A3B8;">
            🚊 Metro: <strong>${p.metro}</strong> (~${p.walkMin}m walk)
          </div>
          <div>
            <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="
              background: #E11D48;
              color: white;
              text-decoration: none;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: bold;
              display: inline-block;
            ">Navigate via Google Maps ➔</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-dark-popup"
      });

      markersLayer.addLayer(marker);
    });
  }, [userLocation, activeZone]);

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

    // Draw route along actual pedestrian roads and alleys
    if (spots.length >= 2) {
      setIsRoutingLoading(true);

      fetchWalkingStreetRoute(spots)
        .then((routeResult) => {
          if (isCancelled || !routeLayerRef.current) return;

          const polyCoords = routeResult.coordinates;

          // Glow ambient background line (road-snapped)
          L.polyline(polyCoords, {
            color: "#E11D48",
            weight: 6,
            opacity: 0.75,
            lineCap: "round",
            lineJoin: "round"
          }).addTo(routeLayer);

          // Dashed golden foreground route path (road-snapped)
          L.polyline(polyCoords, {
            color: "#FBBF24",
            weight: 3.5,
            opacity: 0.95,
            dashArray: "8, 10",
            lineCap: "round",
            lineJoin: "round"
          }).addTo(routeLayer);

          setStreetRouteMeta(routeResult);
          setIsRoutingLoading(false);
        })
        .catch((err) => {
          console.warn("Street routing fallback to direct lines:", err);
          if (isCancelled || !routeLayerRef.current) return;
          const directCoords = spots.map((s) => [s.lat, s.lng]);
          L.polyline(directCoords, { color: "#E11D48", weight: 6, opacity: 0.65 }).addTo(routeLayer);
          L.polyline(directCoords, { color: "#FBBF24", weight: 3.5, opacity: 0.95, dashArray: "8, 10" }).addTo(routeLayer);
          setStreetRouteMeta(null);
          setIsRoutingLoading(false);
        });
    }

    // Numbered sequential step badges (1 to N)
    spots.forEach((spot, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === spots.length - 1;
      const badgeColor = isFirst ? "#10B981" : (isLast ? "#EF4444" : "#F59E0B");

      const numIcon = L.divIcon({
        className: "route-step-marker",
        html: `
          <div style="
            background: ${badgeColor};
            color: #000000;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 0 14px ${badgeColor}cc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 11px;
            font-family: ui-monospace, SFMono-Regular, monospace;
          ">
            ${idx + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([spot.lat, spot.lng], {
        icon: numIcon,
        zIndexOffset: 1200 + idx
      });

      const stopNavUrl = buildGoogleMapsNavUrl(spot, userLocation);

      const popupHtml = `
        <div style="color: #ffffff; font-family: sans-serif; min-width: 220px; padding: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: ${badgeColor}; color: #000; font-size: 10px; font-weight: 900; padding: 2px 7px; border-radius: 6px;">
              STOP #${idx + 1} ${isFirst ? "🏁 START" : isLast ? "🏁 FINISH" : ""}
            </span>
            <span style="font-size: 10px; color: #94A3B8;">${spot.isRestaurant ? "🍴 Food Stop" : "🏛️ Pandal"}</span>
          </div>
          <h4 style="font-weight: 800; font-size: 13px; margin: 2px 0 3px 0; color: #F59E0B;">${spot.name}</h4>
          ${spot.bengaliName ? `<p style="font-size: 11px; color: #FCD34D; margin: 0 0 4px 0;">${spot.bengaliName}</p>` : ""}
          <p style="font-size: 11px; color: #CBD5E1; margin: 0 0 4px 0;">${spot.address || spot.locality || spot.zoneLabel || ""}</p>
          ${spot.metro ? `<div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">🚊 Metro: <strong>${spot.metro}</strong></div>` : ""}
          <div style="margin-top: 6px;">
            <a href="${stopNavUrl}" target="_blank" rel="noopener noreferrer" style="
              background: #E11D48;
              color: white;
              text-decoration: none;
              padding: 5px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: bold;
              display: inline-block;
            ">Navigate via Google Maps ➔</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: "custom-dark-popup" });
      routeLayer.addLayer(marker);
    });

    return () => {
      isCancelled = true;
    };
  }, [activeMapPlan, userLocation]);

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
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    } else {
      setIsLiveTracking(true);
      setFollowUser(true);
    }
  };

  return (
    <section id="map" className="py-10 md:py-16 bg-[#08050B] min-h-[85vh] relative flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>West Bengal Geospatial Map · 500+ Verified Pandals · Road-Snapped AI Route</span>
            </div>
            <h2 className="font-heritage text-2xl sm:text-3xl md:text-5xl font-black text-white">
              Map & <span className="text-gold-gradient">AI Route Planner</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              পশ্চিমবঙ্গ ম্যাপ ও স্মার্ট শারদ রুট প্ল্যানার · Interactive geospatial map & turn-by-turn road navigation
            </p>
          </div>

          {/* Quick Zoom Presets, Live Tracking & Zone Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live GPS Watch Toggle Button */}
            <button
              onClick={() => {
                setIsLiveTracking((prev) => !prev);
                if (!isLiveTracking) setFollowUser(true);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 shadow-lg ${
                isLiveTracking
                  ? "bg-blue-600/40 text-blue-300 border-blue-500/50 shadow-blue-500/20 animate-pulse"
                  : "bg-white/10 hover:bg-white/15 text-white border-white/10"
              }`}
              title="Toggle continuous live GPS tracking as you walk"
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveTracking ? "text-blue-400 animate-spin" : "text-slate-400"}`} />
              <span>{isLiveTracking ? "Live GPS: ON" : "Live GPS: OFF"}</span>
            </button>

            {/* Follow Me Toggle */}
            {isLiveTracking && (
              <button
                onClick={() => setFollowUser((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1 ${
                  followUser
                    ? "bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-400/20"
                    : "bg-white/10 text-white border-white/10"
                }`}
                title="Automatically center the map on your live position as you walk"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{followUser ? "Following" : "Follow Me"}</span>
              </button>
            )}

            {userLocation?.lat && (
              <button
                onClick={centerOnUser}
                className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition flex items-center space-x-1"
                title="Center map on your current location"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                <span>Center Me</span>
              </button>
            )}

            {activeMapPlan?.spots?.length >= 2 && (
              <button
                onClick={zoomToActiveRoute}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-rose-600/30 hover:from-amber-500/40 hover:to-rose-600/40 text-amber-300 text-xs font-bold border border-amber-500/40 transition flex items-center space-x-1.5 shadow-lg shadow-amber-500/10"
                title="Zoom into the active route circuit"
              >
                <Route className="w-3.5 h-3.5 text-amber-400" />
                <span>Focus Route ({activeMapPlan.spots.length})</span>
              </button>
            )}
            <button
              onClick={zoomToWestBengal}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition flex items-center space-x-1"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>West Bengal</span>
            </button>
            <button
              onClick={zoomToKolkata}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold border border-rose-500/30 transition flex items-center space-x-1"
            >
              <ZoomIn className="w-3.5 h-3.5 text-rose-400" />
              <span>Kolkata</span>
            </button>

            {/* Zone Filter Buttons */}
            {[
              { id: "all", label: "All Pins" },
              { id: "south", label: "South (179)" },
              { id: "north", label: "North (98)" },
              { id: "central", label: "Central (62)" },
              { id: "east", label: "East (43)" },
              { id: "howrah", label: "Howrah (20)" },
              { id: "siliguri", label: "Siliguri (20)" }
            ].map((z) => (
              <button
                key={z.id}
                onClick={() => setActiveZone(z.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeZone === z.id
                    ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20"
                    : "bg-[#140E1B] text-slate-300 hover:text-white border border-white/5"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Canvas Frame */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl h-[520px] sm:h-[620px] bg-[#0E0A14]">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Road-Snapped Route Status Overlay Badge */}
          {activeMapPlan?.spots?.length >= 2 && (
            <div className="absolute top-4 left-4 z-20 glass-panel rounded-2xl px-3.5 py-2 border border-amber-500/30 text-xs flex items-center space-x-2.5 shadow-xl backdrop-blur-md">
              {isRoutingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-amber-200 font-medium">Snapping to Kolkata walking streets...</span>
                </>
              ) : (
                <>
                  <Footprints className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                      <span>✨ {streetRouteMeta?.isRoadSnapped ? "Real Street Walking Route" : "Direct Walking Hop"}</span>
                      {streetRouteMeta?.isRoadSnapped && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                          OSRM Snapped
                        </span>
                      )}
                    </div>
                    {streetRouteMeta && (
                      <div className="text-[11px] text-slate-300">
                        {streetRouteMeta.distanceFormatted} walking · ~{streetRouteMeta.durationFormatted}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Live GPS Active Beacon Badge */}
          {isLiveTracking && (
            <div className="absolute top-4 right-4 z-20 glass-panel rounded-2xl px-3 py-1.5 border border-blue-500/40 text-xs flex items-center space-x-2 shadow-xl backdrop-blur-md bg-blue-950/60">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <span className="text-blue-200 font-semibold">
                Live GPS Active {currentAccuracy ? `(±${Math.round(currentAccuracy)}m)` : ""}
              </span>
            </div>
          )}

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 glass-panel rounded-2xl p-3 border border-white/10 text-[11px] hidden sm:flex flex-col space-y-1.5 pointer-events-none">
            <span className="font-bold text-white mb-0.5">District Markers</span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">South Kolkata (179)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">North Kolkata (98)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Central Kolkata (62)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-slate-300">East & Salt Lake (43)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-slate-300">Howrah & Siliguri (40)</span>
            </div>
            {userLocation?.lat && (
              <div className="flex items-center space-x-2 pt-1 border-t border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                <span className="text-blue-300 font-semibold">Your Location {currentAccuracy ? `(±${Math.round(currentAccuracy)}m)` : ""}</span>
              </div>
            )}
          </div>

        </div>

        {/* AI Route Hop Planner - Placed right after map */}
        <div className="mt-12">
          <RoutePlanner
            userLocation={userLocation}
            onSelectPlanForMap={(plan) => setActiveMapPlan(plan)}
            onOpenModal={onOpenModal}
          />
        </div>

      </div>
    </section>
  );
}
