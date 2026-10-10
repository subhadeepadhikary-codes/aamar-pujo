import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { PANDALS_DATA } from "../data/pandalsData";
import { MapPin, Navigation, Compass, Layers, ExternalLink, Globe, ZoomIn } from "lucide-react";

export default function PandalMap({ userLocation, onOpenModal, selectedZone }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [activeZone, setActiveZone] = useState("all");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map centered on West Bengal (latitude 23.5, longitude 87.85)
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.1, 88.0],
        zoom: 8,
        minZoom: 7,
        maxZoom: 18,
        zoomControl: true
      });

      // Free OpenStreetMap Standard Tiles (Zero API key required, 100% reliable uptime)
      // Styled with dark CSS filter in index.css for an obsidian midnight theme
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
        className: "osm-dark-tiles"
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Custom Trinetra Festive Marker Icon Generator
    const createFestiveIcon = (zone) => {
      let colorClass = "#F59E0B"; // Gold default
      if (zone === "south") colorClass = "#E11D48"; // Rose/Red for South
      if (zone === "north") colorClass = "#F59E0B"; // Gold for North
      if (zone === "central") colorClass = "#10B981"; // Emerald for Central
      if (zone === "east") colorClass = "#3B82F6"; // Blue for East/Salt Lake
      if (zone === "howrah" || zone === "others") colorClass = "#A855F7"; // Purple for Howrah

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

    // Plot pandals
    targetPandals.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: createFestiveIcon(p.zone)
      });

      const navUrl = userLocation?.lat && userLocation?.lng
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${p.lat},${p.lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;

      const popupContent = `
        <div style="color: #ffffff; font-family: sans-serif; min-width: 220px; padding: 6px;">
          <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #F59E0B;">${p.name}</h4>
          <p style="font-size: 11px; margin: 0 0 4px 0; color: #CBD5E1;">${p.locality} · <span style="color: #F43F5E; font-weight: bold;">${p.zoneLabel}</span></p>
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

    // Plot User GPS Marker if available
    if (userLocation?.lat && userLocation?.lng) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      const userIcon = L.divIcon({
        className: "user-gps-marker",
        html: `
          <div style="
            background: #3B82F6;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 0 15px #3B82F6;
            animation: pulse 2s infinite;
          "></div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon
      })
        .addTo(map)
        .bindPopup("<strong style='color:#3B82F6;'>Your Current GPS Position</strong>");
    }
  }, [userLocation, activeZone]);

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

  return (
    <section id="map" className="py-10 md:py-16 bg-[#08050B] min-h-[85vh] relative flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>West Bengal Geospatial Map · 503 Verified Pandals</span>
            </div>
            <h2 className="font-heritage text-2xl sm:text-3xl md:text-5xl font-black text-white">
              West Bengal <span className="text-gold-gradient">Pandal Map</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Interactive map spanning North Bengal (Siliguri) to South Bengal (Kolkata, Howrah, Chandannagar, Kalyani).
            </p>
          </div>

          {/* Quick Zoom Presets & Zone Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={zoomToWestBengal}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition flex items-center space-x-1"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>All West Bengal</span>
            </button>
            <button
              onClick={zoomToKolkata}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold border border-rose-500/30 transition flex items-center space-x-1"
            >
              <ZoomIn className="w-3.5 h-3.5 text-rose-400" />
              <span>Zoom Kolkata</span>
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
                <span className="text-blue-300 font-semibold">Your Location</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
