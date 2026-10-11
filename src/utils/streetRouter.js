/**
 * Resilient Pedestrian Road-Snapped Routing Engine for Aamar Pujo
 * 
 * Capabilities:
 * - Free OpenStreetMap (OSRM) walking route querying
 * - Chunking for large spot sets (OSRM limit <= 25 waypoints per chunk)
 * - Deterministic caching in memory Map and sessionStorage
 * - AbortController timeout resilience (4000ms default)
 * - Automatic conversion from GeoJSON [lng, lat] to Leaflet [lat, lng]
 * - Instant fallback to direct coordinate polyline on network timeout/failure
 */

// In-memory cache map for high performance during tab session
const routeMemoryCache = new Map();

/**
 * Calculates Haversine distance in meters between two lat/lng pairs
 */
export function calculateHaversineMeters(lat1, lon1, lat2, lon2) {
  if (
    lat1 === null || lat1 === undefined ||
    lon1 === null || lon1 === undefined ||
    lat2 === null || lat2 === undefined ||
    lon2 === null || lon2 === undefined
  ) {
    return 0;
  }
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance in meters into human-readable format
 */
export function formatRouteDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters) || meters <= 0) {
    return "0 m";
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formats duration in seconds into human-readable walking time
 */
export function formatRouteDuration(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return "0 mins";
  }
  const totalMins = Math.round(seconds / 60);
  if (totalMins < 60) {
    return `${totalMins} min${totalMins === 1 ? "" : "s"}`;
  }
  const hours = Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;
  if (remainingMins === 0) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }
  return `${hours} hr${hours === 1 ? "" : "s"} ${remainingMins} min${remainingMins === 1 ? "" : "s"}`;
}

/**
 * Deterministic cache key generator based on 5 decimal places precision (~1 meter)
 */
/**
 * Deterministic cache key generator based on mode and 5 decimal places precision (~1 meter)
 */
export function getRouteCacheKey(spots, mode = "foot") {
  if (!Array.isArray(spots) || spots.length === 0) {
    return `aamar_route_${mode}_empty`;
  }
  const coordsKey = spots
    .map((s) => {
      const lat = typeof s.lat === "number" ? s.lat.toFixed(5) : "0";
      const lng = typeof s.lng === "number" ? s.lng.toFixed(5) : "0";
      return `${lat},${lng}`;
    })
    .join(";");
  return `aamar_route_${mode}_${coordsKey}`;
}

/**
 * Safe retrieval from memory cache or sessionStorage
 */
function getCachedRoute(cacheKey) {
  if (routeMemoryCache.has(cacheKey)) {
    return routeMemoryCache.get(cacheKey);
  }
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        routeMemoryCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // Ignore private browsing or storage quota errors
    }
  }
  return null;
}

/**
 * Safe storage in memory cache and sessionStorage
 */
function setCachedRoute(cacheKey, routeData) {
  routeMemoryCache.set(cacheKey, routeData);
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(cacheKey, JSON.stringify(routeData));
    } catch {
      // Ignore storage quota limits
    }
  }
}

/**
 * Clears the routing cache (memory & sessionStorage entries)
 */
export function clearRouteCache() {
  routeMemoryCache.clear();
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const keysToRemove = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith("aamar_route_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
    } catch {
      // Ignore
    }
  }
}

/**
 * Builds direct fallback polyline when network or OSRM is unavailable
 */
export function buildDirectFallbackRoute(spots, mode = "foot") {
  const coordinates = spots.map((s) => [s.lat, s.lng]);
  let distanceMeters = 0;

  for (let i = 0; i < spots.length - 1; i++) {
    const s1 = spots[i];
    const s2 = spots[i + 1];
    if (s1 && s2 && typeof s1.lat === "number" && typeof s1.lng === "number" && typeof s2.lat === "number" && typeof s2.lng === "number") {
      distanceMeters += calculateHaversineMeters(s1.lat, s1.lng, s2.lat, s2.lng);
    }
  }

  // Speed: Walking ~1.25 m/s (~4.5 km/h), Road/Metro ~5.55 m/s (~20 km/h in Kolkata festive traffic)
  const speedMs = (mode === "bike" || mode === "road" || mode === "metro") ? 5.55 : 1.25;
  const durationSeconds = Math.round(distanceMeters / speedMs);

  return {
    coordinates,
    distanceMeters: Math.round(distanceMeters),
    distanceFormatted: formatRouteDistance(distanceMeters),
    durationSeconds,
    durationFormatted: formatRouteDuration(durationSeconds),
    isRoadSnapped: false,
    mode
  };
}

/**
 * Fetches an individual chunk of waypoints from OSRM profile (foot vs driving for road/metro corridor)
 */
async function fetchOsrmLeg(chunkSpots, mode = "foot", timeoutMs = 6000) {
  // OSRM coordinates are specified as longitude,latitude;longitude,latitude...
  const coordString = chunkSpots.map((s) => `${s.lng},${s.lat}`).join(";");
  // Foot profile uses pedestrian walkways; Road & Metro use vehicular 'driving' profile along paved avenues
  const isVehicular = mode === "bike" || mode === "road" || mode === "metro";
  const profile = isVehicular ? "driving" : "foot";
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordString}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`OSRM HTTP error: status ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== "Ok" || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new Error(`OSRM returned non-OK code: ${data.code || "Unknown"}`);
    }

    return data.routes[0];
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Generalized road-snapped routing engine supporting Pedestrian Foot, Road/Bike, and Metro rail corridors
 * 
 * @param {Array<Object>} spots - Array of spot objects { lat, lng, name, ... }
 * @param {Object} [options] - Optional settings
 * @param {string} [options.mode='foot'] - 'foot', 'road', 'bike', or 'metro'
 * @param {number} [options.timeoutMs=6000] - Request timeout per chunk
 * @param {boolean} [options.skipCache=false] - Bypass cache read
 * @returns {Promise<Object>} Snapped route coordinates and metadata
 */
export async function fetchStreetRoute(spots, options = {}) {
  const reqMode = options.mode || "foot";
  const mode = (reqMode === "road" || reqMode === "bike") ? "road" : (reqMode === "metro" ? "metro" : "foot");

  // Input validation
  if (!Array.isArray(spots)) {
    return {
      coordinates: [],
      distanceMeters: 0,
      distanceFormatted: "0 m",
      durationSeconds: 0,
      durationFormatted: "0 mins",
      isRoadSnapped: false,
      mode
    };
  }

  // Filter out any spots missing valid lat/lng numbers
  const validSpots = spots.filter(
    (s) => s && typeof s.lat === "number" && typeof s.lng === "number" && !isNaN(s.lat) && !isNaN(s.lng)
  );

  // If fewer than 2 valid spots, road snapping is not applicable
  if (validSpots.length < 2) {
    return {
      coordinates: validSpots.map((s) => [s.lat, s.lng]),
      distanceMeters: 0,
      distanceFormatted: "0 m",
      durationSeconds: 0,
      durationFormatted: "0 mins",
      isRoadSnapped: false,
      mode
    };
  }

  const timeoutMs = options.timeoutMs || 6000;
  const cacheKey = getRouteCacheKey(validSpots, mode);

  // Cache Check
  if (!options.skipCache) {
    const cached = getCachedRoute(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Waypoint Chunking (OSRM supports best with <= 20 waypoints per request)
  const CHUNK_SIZE = 20;
  const chunkSlices = [];

  for (let i = 0; i < validSpots.length - 1; i += (CHUNK_SIZE - 1)) {
    const slice = validSpots.slice(i, Math.min(validSpots.length, i + CHUNK_SIZE));
    if (slice.length >= 2) {
      chunkSlices.push(slice);
    }
  }

  try {
    let totalDistanceMeters = 0;
    let totalDurationSeconds = 0;
    const combinedCoordinates = [];

    // Fetch chunks consecutively with fallback protection against rooftop line cutting
    for (let i = 0; i < chunkSlices.length; i++) {
      const legSpots = chunkSlices[i];
      let legRoute = null;

      try {
        legRoute = await fetchOsrmLeg(legSpots, mode, timeoutMs);
      } catch (chunkErr) {
        console.warn(`OSRM chunk ${i + 1} failed, attempting resilient sub-leg road snapping:`, chunkErr?.message);
        // Resilient sub-leg fallback: Query pair by pair so we snap to real streets instead of drawing across roofs
        for (let j = 0; j < legSpots.length - 1; j++) {
          const pair = [legSpots[j], legSpots[j + 1]];
          try {
            const pairRoute = await fetchOsrmLeg(pair, mode, 4000);
            totalDistanceMeters += pairRoute.distance || 0;
            totalDurationSeconds += pairRoute.duration || 0;
            const pairLatlngs = (pairRoute.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);
            if (combinedCoordinates.length > 0) {
              combinedCoordinates.push(...pairLatlngs.slice(1));
            } else {
              combinedCoordinates.push(...pairLatlngs);
            }
          } catch {
            // Absolute emergency 2-point fallback
            const fallbackPair = buildDirectFallbackRoute(pair, mode);
            totalDistanceMeters += fallbackPair.distanceMeters;
            totalDurationSeconds += fallbackPair.durationSeconds;
            if (combinedCoordinates.length > 0) {
              combinedCoordinates.push([pair[1].lat, pair[1].lng]);
            } else {
              combinedCoordinates.push([pair[0].lat, pair[0].lng], [pair[1].lat, pair[1].lng]);
            }
          }
        }
        continue;
      }

      totalDistanceMeters += legRoute.distance || 0;
      totalDurationSeconds += legRoute.duration || 0;

      // OSRM GeoJSON geometry coordinates are [lng, lat]. Convert to Leaflet [lat, lng]!
      const leafLatlngs = (legRoute.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);

      if (combinedCoordinates.length > 0) {
        // Skip first point of consecutive chunks to avoid duplicate junction coordinate
        combinedCoordinates.push(...leafLatlngs.slice(1));
      } else {
        combinedCoordinates.push(...leafLatlngs);
      }
    }

    if (combinedCoordinates.length === 0) {
      throw new Error("No road coordinates returned from OSRM");
    }

    // In road/metro mode, scale duration if OSRM gave highway speeds; festival traffic averages ~18-20 km/h
    let adjustedDuration = totalDurationSeconds;
    if (mode === "bike" || mode === "road" || mode === "metro") {
      const minPlausibleDuration = Math.round((totalDistanceMeters / 5.55)); // 20 km/h
      adjustedDuration = Math.max(totalDurationSeconds, minPlausibleDuration);
    }

    const result = {
      coordinates: combinedCoordinates,
      distanceMeters: Math.round(totalDistanceMeters),
      distanceFormatted: formatRouteDistance(totalDistanceMeters),
      durationSeconds: Math.round(adjustedDuration),
      durationFormatted: formatRouteDuration(adjustedDuration),
      isRoadSnapped: true,
      mode
    };

    // Store successful result in cache
    setCachedRoute(cacheKey, result);

    return result;
  } catch (error) {
    console.warn("OSRM routing complete fallback:", error?.message || error);
    return buildDirectFallbackRoute(validSpots, mode);
  }
}

/**
 * Backward-compatible wrapper for pedestrian foot street routes
 */
export async function fetchWalkingStreetRoute(spots, options = {}) {
  return fetchStreetRoute(spots, { ...options, mode: "foot" });
}

export default fetchStreetRoute;
