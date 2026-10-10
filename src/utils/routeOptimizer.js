/**
 * AI Smart Route Hop Optimizer for Aamar Pujo
 * Implements Traveling Salesperson Problem (TSP) with Nearest-Neighbor + 2-Opt local search,
 * leg-by-leg transit time & mode heuristics, multi-stop Google Maps URL chunking,
 * and zero-backend device persistence with shareable URL encoding.
 */

import { calculateDistanceKm } from "./geo";

// Maximum capacities as specified
export const MAX_ROUTE_PLANS = 5;
export const MAX_SPOTS_PER_PLAN = 25;

const STORAGE_KEY = "aamar_pujo_saved_route_plans_v1";

/**
 * Calculates distance between two spot objects { lat, lng }
 */
export function getSpotDistanceKm(spotA, spotB) {
  if (!spotA || !spotB || !spotA.lat || !spotA.lng || !spotB.lat || !spotB.lng) return 0;
  return calculateDistanceKm(spotA.lat, spotA.lng, spotB.lat, spotB.lng) || 0;
}

/**
 * Computes total cumulative distance of a sequential path
 */
export function calculatePathDistanceKm(spots, startCoords = null) {
  if (!spots || spots.length === 0) return 0;
  let total = 0;

  if (startCoords && startCoords.lat && startCoords.lng && spots[0]) {
    total += getSpotDistanceKm(startCoords, spots[0]);
  }

  for (let i = 0; i < spots.length - 1; i++) {
    total += getSpotDistanceKm(spots[i], spots[i + 1]);
  }

  return total;
}

/**
 * AI Sequential Route Optimizer (TSP: Nearest Neighbor + 2-Opt Local Search)
 * Takes a list of up to 25 spots and reorders them into the most time-effective,
 * continuous path that eliminates zigzagging and backtracking.
 */
export function optimizeRouteSequential(spots, startCoords = null) {
  if (!spots || spots.length <= 2) {
    const dist = calculatePathDistanceKm(spots, startCoords);
    return {
      optimizedSpots: spots ? [...spots] : [],
      initialDistanceKm: dist,
      optimizedDistanceKm: dist,
      savedDistanceKm: 0,
      percentSaved: 0
    };
  }

  const initialDistanceKm = calculatePathDistanceKm(spots, startCoords);
  const remaining = [...spots];
  const tour = [];

  // Step 1: Nearest Neighbor Heuristic
  let currentPos = startCoords && startCoords.lat && startCoords.lng
    ? startCoords
    : remaining.shift();

  if (currentPos !== startCoords) {
    tour.push(currentPos);
  }

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minD = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = getSpotDistanceKm(currentPos, remaining[i]);
      if (d < minD) {
        minD = d;
        nearestIdx = i;
      }
    }

    currentPos = remaining.splice(nearestIdx, 1)[0];
    tour.push(currentPos);
  }

  // Step 2: 2-Opt Pairwise Local Search
  let improved = true;
  let iterations = 0;
  const maxIterations = 50;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < tour.length - 1; i++) {
      for (let j = i + 1; j < tour.length; j++) {
        // Evaluate distance before swap
        const prevA = i === 0 ? (startCoords || null) : tour[i - 1];
        const nextB = j === tour.length - 1 ? null : tour[j + 1];

        const dCurrent =
          (prevA ? getSpotDistanceKm(prevA, tour[i]) : 0) +
          (nextB ? getSpotDistanceKm(tour[j], nextB) : 0);

        const dReversed =
          (prevA ? getSpotDistanceKm(prevA, tour[j]) : 0) +
          (nextB ? getSpotDistanceKm(tour[i], nextB) : 0);

        if (dReversed < dCurrent - 0.001) { // 1 meter threshold to avoid float jitter
          // Reverse subsegment tour[i..j]
          const sub = tour.slice(i, j + 1).reverse();
          tour.splice(i, sub.length, ...sub);
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  const optimizedDistanceKm = calculatePathDistanceKm(tour, startCoords);
  const savedDistanceKm = Math.max(0, initialDistanceKm - optimizedDistanceKm);
  const percentSaved = initialDistanceKm > 0
    ? Math.round((savedDistanceKm / initialDistanceKm) * 100)
    : 0;

  return {
    optimizedSpots: tour,
    initialDistanceKm,
    optimizedDistanceKm,
    savedDistanceKm,
    percentSaved
  };
}

/**
 * Calculates transit advice and metrics for a single leg between Spot A and Spot B
 */
export function calculateLegDetails(spotA, spotB) {
  const distKm = getSpotDistanceKm(spotA, spotB);
  const meters = Math.round(distKm * 1000);

  let mode = "walk";
  let modeIcon = "🚶";
  let travelMins = 5;
  let recommendation = "";

  if (distKm < 0.4) {
    travelMins = Math.max(2, Math.round(meters / 75));
    recommendation = `Walk ${meters}m down the para lane (~${travelMins} mins)`;
  } else if (distKm < 1.5) {
    travelMins = Math.round(meters / 75);
    modeIcon = "🚶";
    recommendation = `Brisk walk or cycle rickshaw (${meters}m, ~${travelMins} mins)`;
  } else if (distKm < 3.5) {
    mode = "auto";
    modeIcon = "🛺";
    travelMins = Math.max(6, Math.round(distKm * 4.5));
    recommendation = `Hop on a shared auto or Toto along arterial road (~${travelMins} mins, ₹15-₹20)`;
  } else {
    mode = "metro";
    modeIcon = "🚇";
    travelMins = Math.max(12, Math.round(distKm * 3.2));
    recommendation = `Board Kolkata Metro or take a quick cab (~${travelMins} mins)`;
  }

  const navUrl = `https://www.google.com/maps/dir/?api=1&origin=${spotA.lat},${spotA.lng}&destination=${spotB.lat},${spotB.lng}`;

  return {
    from: spotA.name,
    to: spotB.name,
    distanceKm: distKm,
    distanceFormatted: distKm < 1 ? `${meters}m` : `${distKm.toFixed(1)} km`,
    travelMins,
    mode,
    modeIcon,
    recommendation,
    navUrl
  };
}

/**
 * Calculates complete circuit stats (cumulative distance, transit duration, darshan buffer)
 */
export function calculateCircuitSummary(spots, startCoords = null) {
  if (!spots || spots.length === 0) {
    return {
      spotCount: 0,
      pandalsCount: 0,
      foodCount: 0,
      totalDistanceKm: 0,
      totalDistanceFormatted: "0 km",
      transitMinutes: 0,
      darshanMinutes: 0,
      totalDurationFormatted: "0 mins",
      legs: []
    };
  }

  let totalDistKm = 0;
  let totalTransitMins = 0;
  const legs = [];

  let pandalsCount = 0;
  let foodCount = 0;

  spots.forEach((s) => {
    if (s.isRestaurant || s.cuisine) foodCount++;
    else pandalsCount++;
  });

  // Calculate legs
  for (let i = 0; i < spots.length - 1; i++) {
    const leg = calculateLegDetails(spots[i], spots[i + 1]);
    totalDistKm += leg.distanceKm;
    totalTransitMins += leg.travelMins;
    legs.push(leg);
  }

  // Estimated dwell / darshan buffer (~20 mins per pandal, ~40 mins per food stop)
  const darshanMinutes = (pandalsCount * 20) + (foodCount * 40);
  const totalMinutes = totalTransitMins + darshanMinutes;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalDurationFormatted = hours > 0 ? `${hours} hr ${mins} mins` : `${mins} mins`;

  return {
    spotCount: spots.length,
    pandalsCount,
    foodCount,
    totalDistanceKm: totalDistKm,
    totalDistanceFormatted: totalDistKm < 1 ? `${Math.round(totalDistKm * 1000)}m` : `${totalDistKm.toFixed(1)} km`,
    transitMinutes: totalTransitMins,
    darshanMinutes,
    totalDurationFormatted,
    legs
  };
}

/**
 * Builds Google Maps Multi-Stop Navigation URL(s)
 * Automatically splits into parts if waypoints exceed Google Maps 10-stop limit
 */
export function buildGoogleMapsCircuitUrl(spots, startCoords = null) {
  if (!spots || spots.length < 2) return null;

  // Google Maps supports 1 origin + 8 waypoints + 1 destination = 10 stops max per URL
  const CHUNK_SIZE = 9; // 1 origin + 8 waypoints + 1 destination
  const chunks = [];

  for (let i = 0; i < spots.length - 1; i += (CHUNK_SIZE - 1)) {
    const slice = spots.slice(i, i + CHUNK_SIZE);
    if (slice.length < 2) break;

    const origin = `${slice[0].lat},${slice[0].lng}`;
    const destination = `${slice[slice.length - 1].lat},${slice[slice.length - 1].lng}`;
    const waypoints = slice.slice(1, -1).map((s) => `${s.lat},${s.lng}`).join("%7C");

    const url = waypoints.length > 0
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`
      : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;

    chunks.push({
      partNumber: chunks.length + 1,
      fromSpot: slice[0].name,
      toSpot: slice[slice.length - 1].name,
      spotsCount: slice.length,
      url
    });
  }

  return chunks;
}

/**
 * 3 Default Curated Starter Circuits
 */
export const DEFAULT_ROUTE_PLANS = [
  {
    id: "plan-north-heritage",
    name: "North Kolkata Heritage Walk",
    description: "Classic Sabeki art, aristocratic Rajbari courtyards & historic cabins",
    updatedAt: Date.now(),
    spots: [
      {
        id: "pandal-174",
        name: "20 Palli Sarbojanin Durgotsab",
        bengaliName: "২০ পল্লী সার্বজনীন",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Ahiritola",
        lat: 22.5937,
        lng: 88.3581,
        metro: "Shobhabazar Sutanuti",
        isRestaurant: false
      },
      {
        id: "pandal-bagbazar",
        name: "Bagbazar Sarbojanin",
        bengaliName: "বাগবাজার সার্বজনীন",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Bagbazar Ghat Road",
        lat: 22.6033,
        lng: 88.3664,
        metro: "Shyambazar Metro",
        isRestaurant: false
      },
      {
        id: "pandal-kumartuli",
        name: "Kumartuli Park Sarbojanin",
        bengaliName: "কুমারটুলি পার্ক",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Kumartuli",
        lat: 22.5991,
        lng: 88.3638,
        metro: "Shobhabazar Sutanuti",
        isRestaurant: false
      },
      {
        id: "rest-10",
        name: "Mitra Cafe (Shobhabazar)",
        bengaliName: "মিত্র ক্যাফে",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Shobhabazar Crossing",
        lat: 22.5985,
        lng: 88.3695,
        metro: "Shobhabazar Sutanuti",
        isRestaurant: true
      },
      {
        id: "pandal-chaltabagan",
        name: "Manicktalla Chaltabagan Lohapatty",
        bengaliName: "চালতাবাগান লোহাপট্টি",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Manicktala",
        lat: 22.5856,
        lng: 88.3742,
        metro: "Girish Park Metro",
        isRestaurant: false
      },
      {
        id: "pandal-college-sq",
        name: "College Square",
        bengaliName: "কলেজ স্কোয়ার",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "College Street",
        lat: 22.5744,
        lng: 88.3629,
        metro: "Central / MG Road Metro",
        isRestaurant: false
      }
    ]
  },
  {
    id: "plan-south-mega",
    name: "South Kolkata Mega Circuit",
    description: "Star-studded pandals with royal architecture, mega illumination & legendary food",
    updatedAt: Date.now(),
    spots: [
      {
        id: "pandal-suruchi",
        name: "Suruchi Sangha",
        bengaliName: "সুরুচি সংঘ",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "New Alipore",
        lat: 22.5115,
        lng: 88.3302,
        metro: "Kalighat Metro",
        isRestaurant: false
      },
      {
        id: "pandal-chetla",
        name: "Chetla Agrani Club",
        bengaliName: "চেতলা অগ্রণী ক্লাব",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Chetla",
        lat: 22.5186,
        lng: 88.3415,
        metro: "Kalighat / Rabindra Sarobar",
        isRestaurant: false
      },
      {
        id: "pandal-deshapriya",
        name: "Deshapriya Park",
        bengaliName: "দেশপ্রিয় পার্ক",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Rashbehari Avenue",
        lat: 22.5187,
        lng: 88.3562,
        metro: "Kalighat Metro",
        isRestaurant: false
      },
      {
        id: "pandal-tridhara",
        name: "Tridhara Sammilani",
        bengaliName: "ত্রিধারা সম্মিলনী",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Manoherpukur",
        lat: 22.5178,
        lng: 88.3598,
        metro: "Kalighat / Jatin Das Park",
        isRestaurant: false
      },
      {
        id: "pandal-ekdalia",
        name: "Ekdalia Evergreen Club",
        bengaliName: "একডালিয়া এভারগ্রীন",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Gariahat",
        lat: 22.5192,
        lng: 88.3664,
        metro: "Kalighat Metro",
        isRestaurant: false
      },
      {
        id: "pandal-singhi",
        name: "Singhi Park Sarbojanin",
        bengaliName: "সিংঘী পার্ক",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Dover Lane",
        lat: 22.5218,
        lng: 88.3678,
        metro: "Kalighat Metro",
        isRestaurant: false
      },
      {
        id: "pandal-maddox",
        name: "Maddox Square",
        bengaliName: "ম্যাডক্স স্কোয়ার",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Ritchie Road",
        lat: 22.5298,
        lng: 88.3582,
        metro: "Netaji Bhavan Metro",
        isRestaurant: false
      }
    ]
  },
  {
    id: "plan-behala-alipore",
    name: "Behala & Alipore Art Trail",
    description: "Intricate thematic artistry, moving social motifs & Behala's finest cuisine",
    updatedAt: Date.now(),
    spots: [
      {
        id: "pandal-taratala",
        name: "Ajeyo Sanghati",
        bengaliName: "অজেয় সংহতি",
        zone: "south",
        zoneLabel: "South-West Kolkata",
        locality: "Taratala Haridevpur",
        lat: 22.4925,
        lng: 88.3392,
        metro: "Mahanayak Uttam Kumar",
        isRestaurant: false
      },
      {
        id: "pandal-behala-nutan",
        name: "Behala Nutan Dal",
        bengaliName: "বেহালা নতুন দল",
        zone: "south",
        zoneLabel: "South-West Kolkata",
        locality: "Behala 14 No. Bus Stand",
        lat: 22.4988,
        lng: 88.3188,
        metro: "Taratala / Rabindra Sarobar",
        isRestaurant: false
      },
      {
        id: "rest-abhijato",
        name: "Abhijato Restaurant (Behala)",
        bengaliName: "অভিজাত রেস্তোরাঁ",
        zone: "south",
        zoneLabel: "South Kolkata (Behala)",
        locality: "Arya Samity Road, Kadamtala",
        lat: 22.4988,
        lng: 88.3182,
        metro: "Rabindra Sarobar / Taratala",
        isRestaurant: true
      },
      {
        id: "pandal-behala-club",
        name: "Behala Club",
        bengaliName: "বেহালা ক্লাব",
        zone: "south",
        zoneLabel: "South-West Kolkata",
        locality: "Banamali Naskar Road",
        lat: 22.4975,
        lng: 88.3172,
        metro: "Taratala Purple Line",
        isRestaurant: false
      },
      {
        id: "pandal-barisha",
        name: "Barisha Club",
        bengaliName: "বড়িষা ক্লাব",
        zone: "south",
        zoneLabel: "South-West Kolkata",
        locality: "Behala Chowrasta / Sakher Bazar",
        lat: 22.4851,
        lng: 88.3125,
        metro: "Tollygunge / Purple Line",
        isRestaurant: false
      }
    ]
  }
];

/**
 * Loads saved route plans from localStorage (with fallbacks and migration)
 */
export function loadSavedRoutePlans() {
  if (typeof window === "undefined") return DEFAULT_ROUTE_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveRoutePlans(DEFAULT_ROUTE_PLANS);
      return DEFAULT_ROUTE_PLANS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, MAX_ROUTE_PLANS);
    }
    return DEFAULT_ROUTE_PLANS;
  } catch (err) {
    console.warn("Error reading route plans from localStorage:", err);
    return DEFAULT_ROUTE_PLANS;
  }
}

/**
 * Saves route plans into localStorage (indefinite persistence, max 5 plans)
 */
export function saveRoutePlans(plans) {
  if (typeof window === "undefined" || !Array.isArray(plans)) return;
  try {
    const capped = plans.slice(0, MAX_ROUTE_PLANS).map((p) => ({
      ...p,
      updatedAt: Date.now(),
      spots: (p.spots || []).slice(0, MAX_SPOTS_PER_PLAN)
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch (err) {
    console.error("Error saving route plans to localStorage:", err);
  }
}

/**
 * Requests browser persistent storage permissions (Chrome/Edge/Android)
 */
export async function requestPersistentStorage() {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log("Persistent Storage granted:", isPersisted);
      return isPersisted;
    } catch (e) {
      console.warn("Storage persist check skipped:", e);
    }
  }
  return false;
}

/**
 * Encodes a plan into a shareable URL hash string
 */
export function encodePlanToUrl(plan) {
  if (!plan) return "";
  try {
    const compact = {
      n: plan.name,
      d: plan.description || "",
      s: (plan.spots || []).map((s) => ({
        i: s.id,
        n: s.name,
        bn: s.bengaliName || "",
        lt: Number(s.lat.toFixed(5)),
        lg: Number(s.lng.toFixed(5)),
        z: s.zone || "south",
        zl: s.zoneLabel || "",
        loc: s.locality || "",
        m: s.metro || "",
        r: s.isRestaurant || false
      }))
    };
    const jsonStr = JSON.stringify(compact);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return `${window.location.origin}${window.location.pathname}#plan=${base64}`;
  } catch (e) {
    console.error("Plan encoding error:", e);
    return "";
  }
}

/**
 * Decodes a plan from a shareable URL hash string
 */
export function decodePlanFromUrl(hashString) {
  if (!hashString || !hashString.includes("#plan=")) return null;
  try {
    const base64 = hashString.split("#plan=")[1].trim();
    if (!base64) return null;
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const compact = JSON.parse(jsonStr);

    return {
      id: `shared-${Date.now()}`,
      name: compact.n || "Shared Pujo Plan",
      description: compact.d || "Imported from shared link",
      updatedAt: Date.now(),
      spots: (compact.s || []).slice(0, MAX_SPOTS_PER_PLAN).map((s) => ({
        id: s.i,
        name: s.n,
        bengaliName: s.bn,
        lat: s.lt,
        lng: s.lg,
        zone: s.z,
        zoneLabel: s.zl,
        locality: s.loc,
        metro: s.m,
        isRestaurant: s.r
      }))
    };
  } catch (e) {
    console.error("Plan decoding error:", e);
    return null;
  }
}
