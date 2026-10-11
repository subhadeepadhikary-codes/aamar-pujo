/**
 * AI Smart Route Hop Optimizer for Aamar Pujo
 * Implements Traveling Salesperson Problem (TSP) with Nearest-Neighbor + 2-Opt local search,
 * leg-by-leg transit time & mode heuristics, multi-stop Google Maps URL chunking,
 * and zero-backend device persistence with shareable URL encoding.
 */

import { calculateDistanceKm } from "./geo.js";
import { buildGoogleMapsNavUrl } from "./navigationHelper.js";
import { PANDALS_DATA } from "../data/pandalsData.js";
import { RESTAURANTS_DATA } from "../data/restaurantsData.js";

// Maximum capacities as specified
export const MAX_ROUTE_PLANS = 5;
export const MAX_SPOTS_PER_PLAN = 40;

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
 * Takes a list of up to 40 spots and reorders them into the most time-effective,
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
/**
 * Evaluates multi-modal transit options (Walk vs Bike Road vs Metro) at the junction between Spot A and Spot B
 * and determines the optimal choice based on distance, local lane barricades, and Kolkata Metro connectivity.
 */
export function evaluateJunctionTransitChoice(spotA, spotB) {
  const distKm = getSpotDistanceKm(spotA, spotB);
  const meters = Math.round(distKm * 1000);

  // Check metro connectivity for both spots
  const hasMetroA = spotA && spotA.metro && spotA.metro !== "Nearby Bus/Auto" && spotA.metro !== "Siliguri Junction";
  const hasMetroB = spotB && spotB.metro && spotB.metro !== "Nearby Bus/Auto" && spotB.metro !== "Siliguri Junction";
  const sameMetroStation = hasMetroA && hasMetroB && spotA.metro.toLowerCase() === spotB.metro.toLowerCase();

  // Mode Metrics
  // 1. Walk: ~75 m/min (~4.5 km/h)
  const walkMins = Math.max(2, Math.round(meters / 75));
  const walkDistFormatted = distKm < 1 ? `${meters}m` : `${distKm.toFixed(1)} km`;

  // 2. Bike Road: ~3.0 min/km (~20 km/h in Kolkata festive traffic) + 2 mins parking buffer
  const bikeMins = Math.max(3, Math.round(distKm * 3.0 + 2));
  const bikeDistFormatted = `${distKm.toFixed(1)} km`;

  // 3. Kolkata Metro: station access (5 mins) + train ride (~2.5 min/km) + exit (4 mins)
  const metroTrainMins = Math.max(5, Math.round(distKm * 2.5));
  const metroMins = hasMetroA && hasMetroB ? Math.max(10, metroTrainMins + 7) : null;
  const metroDistFormatted = `${distKm.toFixed(1)} km rail`;

  let recommendedMode = "walk";
  let recommendedIcon = "🚶";
  let recommendedLabel = "Walk (Para Lanes)";
  let reasoning = "";
  let travelMins = walkMins;
  let gmapsMode = "walking";

  if (distKm <= 0.8) {
    // Short hop: Walking is fastest and avoids barricades/parking
    recommendedMode = "walk";
    recommendedIcon = "🚶";
    recommendedLabel = "Walk (Para Lanes)";
    travelMins = walkMins;
    gmapsMode = "walking";
    reasoning = `Fastest on foot (${walkDistFormatted}, ~${walkMins} mins). Navigating narrow festive para alleys by bike or waiting for transit takes longer.`;
  } else if (distKm > 2.0 && hasMetroA && hasMetroB && !sameMetroStation) {
    // Long hop with Metro: Metro is fastest, 100% traffic-free
    recommendedMode = "metro";
    recommendedIcon = "🚇";
    recommendedLabel = "Kolkata Metro";
    travelMins = metroMins;
    gmapsMode = "transit";
    reasoning = `Kolkata Metro (~${metroMins} mins). Skip 45–60 mins of festive gridlock on surface roads from ${spotA.metro} to ${spotB.metro}.`;
  } else {
    // Medium hop or without direct metro: Bike road is fastest
    recommendedMode = "bike";
    recommendedIcon = "🛵";
    recommendedLabel = "Bike / Two-Wheeler Road";
    travelMins = bikeMins;
    gmapsMode = "two_wheeler";
    reasoning = `Fastest via bike road (${bikeDistFormatted}, ~${bikeMins} mins). Paved vehicular avenues bypass pedestrian crowding & walking fatigue.`;
  }

  const comparison = [
    {
      mode: "walk",
      icon: "🚶",
      label: "Walk",
      timeMins: walkMins,
      distFormatted: walkDistFormatted,
      isOptimal: recommendedMode === "walk",
      note: distKm <= 0.8 ? "Zero parking delay; enters inner barricades" : "Causes walking fatigue for long distance"
    },
    {
      mode: "bike",
      icon: "🛵",
      label: "Bike Road",
      timeMins: bikeMins,
      distFormatted: bikeDistFormatted,
      isOptimal: recommendedMode === "bike",
      note: "Paved vehicular roads; avoids narrow footpaths"
    }
  ];

  if (hasMetroA && hasMetroB && !sameMetroStation) {
    comparison.push({
      mode: "metro",
      icon: "🚇",
      label: "Metro",
      timeMins: metroMins,
      distFormatted: metroDistFormatted,
      isOptimal: recommendedMode === "metro",
      note: "100% traffic-free; air-conditioned corridor"
    });
  }

  const navUrl = buildGoogleMapsNavUrl(spotB, spotA, gmapsMode);

  return {
    recommendedMode,
    recommendedIcon,
    recommendedLabel,
    travelMins,
    distanceKm: distKm,
    distanceFormatted: distKm < 1 ? `${meters}m` : `${distKm.toFixed(1)} km`,
    reasoning,
    comparison,
    navUrl
  };
}

/**
 * Calculates transit advice and metrics for a single leg between Spot A and Spot B
 */
export function calculateLegDetails(spotA, spotB, options = {}) {
  const travelMode = options.travelMode || "smart"; // 'smart' | 'metro' | 'road' | 'bike' | 'foot'
  const distKm = getSpotDistanceKm(spotA, spotB);
  const meters = Math.round(distKm * 1000);
  const junctionAnalysis = evaluateJunctionTransitChoice(spotA, spotB);

  let mode = "walk";
  let modeIcon = "🚶";
  let travelMins = 5;
  let recommendation = "";
  let navUrl = "";

  if (travelMode === "metro") {
    // Dedicated Kolkata Metro Transit Mode
    const hasMetroA = spotA && spotA.metro && spotA.metro !== "Nearby Bus/Auto" && spotA.metro !== "Siliguri Junction";
    const hasMetroB = spotB && spotB.metro && spotB.metro !== "Nearby Bus/Auto" && spotB.metro !== "Siliguri Junction";
    const sameMetroStation = hasMetroA && hasMetroB && spotA.metro.toLowerCase() === spotB.metro.toLowerCase();

    if (hasMetroA && hasMetroB && !sameMetroStation && distKm > 0.8) {
      // Station-to-station Metro rail ride
      mode = "metro";
      modeIcon = "🚇";
      const walkAccessA = Math.max(3, spotA.walkMin || 5);
      const walkExitB = Math.max(3, spotB.walkMin || 5);
      const trainRideMins = Math.max(5, Math.round(distKm * 2.2));
      travelMins = walkAccessA + trainRideMins + walkExitB;
      recommendation = `🚇 Kolkata Metro: Board at ${spotA.metro} Metro ➔ Ride directly to ${spotB.metro} Metro (~${travelMins} mins total incl. walk). Bypasses surface festival road gridlock & police diversions!`;
      navUrl = buildGoogleMapsNavUrl(spotB, spotA, "transit");
    } else if (distKm <= 0.8 || sameMetroStation) {
      // Close spots in the same neighborhood or same station vicinity
      mode = "walk";
      modeIcon = "🚶";
      travelMins = Math.max(2, Math.round(meters / 75));
      recommendation = `🚶 Same Metro Cluster (${hasMetroA ? spotA.metro : (spotA.locality || "Neighborhood")}): Walk ${meters}m or take local rickshaw (~${travelMins} mins). Walking is faster than taking a train for this distance!`;
      navUrl = buildGoogleMapsNavUrl(spotB, spotA, "walking");
    } else {
      // One or both spots require feeder transit to/from metro corridor
      mode = "metro";
      modeIcon = "🚇";
      travelMins = Math.max(8, Math.round(distKm * 2.8 + 6));
      recommendation = `🚇 Multimodal Metro Feeder: Take local auto/toto to the nearest Metro corridor (${hasMetroA ? spotA.metro : (hasMetroB ? spotB.metro : "Central Metro")}) ➔ Rapid transit (~${travelMins} mins).`;
      navUrl = buildGoogleMapsNavUrl(spotB, spotA, "transit");
    }
  } else if (travelMode === "road" || travelMode === "bike") {
    mode = "road";
    modeIcon = "🛵";
    travelMins = Math.max(3, Math.round(distKm * 3.0 + 2));
    recommendation = `Ride via paved motorable roads (~${travelMins} mins, ${distKm < 1 ? `${meters}m` : `${distKm.toFixed(1)} km`}). Avoids pedestrian-only alleyways.`;
    navUrl = buildGoogleMapsNavUrl(spotB, spotA, "two_wheeler");
  } else if (travelMode === "foot") {
    mode = "walk";
    modeIcon = "🚶";
    travelMins = Math.max(2, Math.round(meters / 75));
    recommendation = `Walk via pedestrian roads & alleys (~${travelMins} mins, ${distKm < 1 ? `${meters}m` : `${distKm.toFixed(1)} km`})`;
    navUrl = buildGoogleMapsNavUrl(spotB, spotA, "walking");
  } else {
    // Smart Mode (Multi-Modal Junction Decision)
    mode = junctionAnalysis.recommendedMode;
    modeIcon = junctionAnalysis.recommendedIcon;
    travelMins = junctionAnalysis.travelMins;
    recommendation = junctionAnalysis.reasoning;
    navUrl = junctionAnalysis.navUrl;
  }

  return {
    from: spotA.name,
    to: spotB.name,
    distanceKm: distKm,
    distanceFormatted: distKm < 1 ? `${meters}m` : `${distKm.toFixed(1)} km`,
    travelMins,
    mode,
    modeIcon,
    recommendation,
    navUrl,
    junctionAnalysis
  };
}

/**
 * Calculates complete circuit stats (cumulative distance, transit duration, darshan buffer)
 */
export function calculateCircuitSummary(spots, startCoords = null, travelMode = "smart") {
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
      travelMode,
      legs: [],
      modalBreakdown: { walkLegs: 0, roadLegs: 0, metroLegs: 0 }
    };
  }

  let totalDistKm = 0;
  let totalTransitMins = 0;
  const legs = [];
  let walkLegs = 0;
  let roadLegs = 0;
  let metroLegs = 0;

  let pandalsCount = 0;
  let foodCount = 0;

  spots.forEach((s) => {
    if (s.isRestaurant || s.cuisine) foodCount++;
    else pandalsCount++;
  });

  // Calculate legs
  for (let i = 0; i < spots.length - 1; i++) {
    const leg = calculateLegDetails(spots[i], spots[i + 1], { travelMode });
    totalDistKm += leg.distanceKm;
    totalTransitMins += leg.travelMins;
    if (leg.mode === "walk") walkLegs++;
    else if (leg.mode === "road" || leg.mode === "bike") roadLegs++;
    else if (leg.mode === "metro") metroLegs++;
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
    travelMode,
    modalBreakdown: { walkLegs, roadLegs, metroLegs },
    legs
  };
}

/**
 * Builds Google Maps Multi-Stop Navigation URL(s)
 * Automatically splits into parts if waypoints exceed Google Maps 10-stop limit
 */
export function buildGoogleMapsCircuitUrl(spots, startCoords = null, travelMode = "walking") {
  if (!spots || spots.length < 2) return null;

  let gmapsTravelMode = "walking";
  if (travelMode === "road" || travelMode === "bike") {
    gmapsTravelMode = "two_wheeler";
  } else if (travelMode === "metro") {
    gmapsTravelMode = "transit";
  }

  // Google Maps supports 1 origin + 8 waypoints + 1 destination = 10 stops max per URL
  const CHUNK_SIZE = 9; // 1 origin + 8 waypoints + 1 destination
  const chunks = [];

  for (let i = 0; i < spots.length - 1; i += (CHUNK_SIZE - 1)) {
    const slice = spots.slice(i, i + CHUNK_SIZE);
    if (slice.length < 2) break;

    const origin = `${slice[0].lat},${slice[0].lng}`;
    const destination = `${slice[slice.length - 1].lat},${slice[slice.length - 1].lng}`;
    const waypoints = slice.slice(1, -1).map((s) => `${s.lat},${s.lng}`).join("%7C");

    const destSpot = slice[slice.length - 1];
    const destQuery = encodeURIComponent(`${destSpot.name}, ${destSpot.address || destSpot.locality || "Kolkata"}`);

    const url = waypoints.length > 0
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&destination_query=${destQuery}&waypoints=${waypoints}&travelmode=${gmapsTravelMode}`
      : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&destination_query=${destQuery}&travelmode=${gmapsTravelMode}`;

    chunks.push({
      partNumber: chunks.length + 1,
      fromSpot: slice[0].name,
      toSpot: slice[slice.length - 1].name,
      spotsCount: slice.length,
      travelMode: gmapsTravelMode,
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
    id: "plan-bonedi-bari-parikrama",
    name: "Kolkata Bonedi Bari Heritage Parikrama",
    description: "Centuries-old ancestral family rajbaris, open thakur dalans & classical European courtyards from Girish Park to Bowbazar",
    updatedAt: Date.now(),
    spots: [
      {
        id: "pandal-148",
        name: "Shamul Dhone Dutta Bari (Girish Park)",
        bengaliName: "শামুলধোন দত্ত বাড়ি",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Girish Park",
        lat: 22.5842,
        lng: 88.3592,
        metro: "Girish Park",
        isRestaurant: false
      },
      {
        id: "pandal-137",
        name: "Jorasanko Narasingha Dawn Bari",
        bengaliName: "জোড়াসাঁকো নরসিংহ দাঁ বাড়ি",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Jorasanko",
        lat: 22.5848,
        lng: 88.3584,
        metro: "Girish Park",
        isRestaurant: false
      },
      {
        id: "pandal-505",
        name: "Jorasanko Shib Krishna Daw Bari",
        bengaliName: "জোড়াসাঁকো শিবকৃষ্ণ দাঁ বাড়ি",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Jorasanko",
        lat: 22.5855,
        lng: 88.3575,
        metro: "Girish Park",
        isRestaurant: false
      },
      {
        id: "pandal-136",
        name: "Chorbagan Sil's Thakurbari",
        bengaliName: "চোরবাগান শীল ঠাকুরবাড়ি",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Chorbagan",
        lat: 22.5835,
        lng: 88.3640,
        metro: "MG Road",
        isRestaurant: false
      },
      {
        id: "pandal-129",
        name: "Simla Byayam Samity",
        bengaliName: "সিমলা ব্যায়াম সমিতি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Simla",
        lat: 22.5852,
        lng: 88.3645,
        metro: "Girish Park",
        isRestaurant: false
      },
      {
        id: "pandal-132",
        name: "Chorebagan Sarbojanin Durgotsab Samity",
        bengaliName: "চোরবাগান সার্বজনীন দুর্গোৎসব সমিতি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Chorbagan",
        lat: 22.5831,
        lng: 88.3653,
        metro: "MG Road",
        isRestaurant: false
      },
      {
        id: "pandal-130",
        name: "Chorbagan Chatterjee Bari",
        bengaliName: "চোরবাগান চ্যাটার্জী বাড়ি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Chorbagan",
        lat: 22.5828,
        lng: 88.3648,
        metro: "MG Road",
        isRestaurant: false
      },
      {
        id: "pandal-126",
        name: "Thanthania Dutta Bari",
        bengaliName: "ঠনঠনিয়া দত্ত বাড়ি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Thanthania",
        lat: 22.5807,
        lng: 88.3658,
        metro: "MG Road",
        isRestaurant: false
      },
      {
        id: "pandal-134",
        name: "Thanthania Laha Bari",
        bengaliName: "ঠনঠনিয়া লাহা বাড়ি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Thanthania",
        lat: 22.5806,
        lng: 88.3650,
        metro: "MG Road",
        isRestaurant: false
      },
      {
        id: "pandal-112",
        name: "Muhammad Ali Park",
        bengaliName: "মহম্মদ আলী পার্ক",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "CR Avenue",
        lat: 22.5773,
        lng: 88.3607,
        metro: "MG Road",
        isRestaurant: false
      },
      {
        id: "pandal-108",
        name: "College Square Sarbojanin Durgotsab",
        bengaliName: "কলেজ স্কয়ার",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "College Street",
        lat: 22.5748,
        lng: 88.3639,
        metro: "Central",
        isRestaurant: false
      },
      {
        id: "pandal-506",
        name: "Basu Mallick Thakurbari",
        bengaliName: "বসু মল্লিক ঠাকুরবাড়ি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "College Square",
        lat: 22.5739,
        lng: 88.3642,
        metro: "Central",
        isRestaurant: false
      },
      {
        id: "pandal-111",
        name: "Motilal Seal's Bari",
        bengaliName: "মতিলাল শীল বাড়ি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Colootola",
        lat: 22.5752,
        lng: 88.3576,
        metro: "Central",
        isRestaurant: false
      },
      {
        id: "pandal-113",
        name: "Badan Chand Roy Bari Durga Puja",
        bengaliName: "বদন চাঁদ রায় বাড়ি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Bowbazar",
        lat: 22.5721,
        lng: 88.3670,
        metro: "Central",
        isRestaurant: false
      },
      {
        id: "pandal-98",
        name: "Santosh Mitra Square",
        bengaliName: "সন্তোষ মিত্র স্কয়ার",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Bowbazar",
        lat: 22.5660,
        lng: 88.3656,
        metro: "Central",
        isRestaurant: false
      },
      {
        id: "pandal-507",
        name: "Rakhaldas Halder Bari",
        bengaliName: "রাখালদাস হালদার বাড়ি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Bowbazar",
        lat: 22.5695,
        lng: 88.3640,
        metro: "Central",
        isRestaurant: false
      },
      {
        id: "pandal-99",
        name: "Ramgopal Saha's House Durga Pujo",
        bengaliName: "রামগোপাল সাহা বাড়ি",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "Bowbazar",
        lat: 22.5646,
        lng: 88.3621,
        metro: "Chandni Chowk",
        isRestaurant: false
      }
    ]
  },
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
        id: "pandal-180",
        name: "Bagbazar Sarbojanin Durgotsav",
        bengaliName: "বাগবাজার সার্বজনীন",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Bagbazar",
        lat: 22.6045,
        lng: 88.3656,
        metro: "Shyambazar",
        isRestaurant: false
      },
      {
        id: "pandal-177",
        name: "Kumartuli Park Sarbojanin Durgotsab",
        bengaliName: "কুমারটুলি পার্ক",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Kumartuli",
        lat: 22.5991,
        lng: 88.3615,
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
        id: "pandal-123",
        name: "Maniktala Chaltabagan Lohapatty",
        bengaliName: "চালতাবাগান লোহাপট্টি",
        zone: "north",
        zoneLabel: "North Kolkata",
        locality: "Maniktala",
        lat: 22.5849,
        lng: 88.3722,
        metro: "Girish Park",
        isRestaurant: false
      },
      {
        id: "pandal-108",
        name: "College Square Sarbojanin Durgotsab",
        bengaliName: "কলেজ স্কয়ার",
        zone: "central",
        zoneLabel: "Central Kolkata",
        locality: "College Street",
        lat: 22.5746,
        lng: 88.3645,
        metro: "Central",
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
        id: "pandal-382",
        name: "Suruchi Sangha",
        bengaliName: "সুরুচি সংঘ",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "New Alipore",
        lat: 22.5090,
        lng: 88.3340,
        metro: "Rabindra Sarobar",
        isRestaurant: false
      },
      {
        id: "pandal-377",
        name: "Chetla Agrani Club",
        bengaliName: "চেতলা অগ্রণী ক্লাব",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Chetla",
        lat: 22.5165,
        lng: 88.3368,
        metro: "Kalighat",
        isRestaurant: false
      },
      {
        id: "pandal-37",
        name: "Deshapriya Park",
        bengaliName: "দেশপ্রিয় পার্ক",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Rashbehari Avenue",
        lat: 22.5188,
        lng: 88.3535,
        metro: "Kalighat",
        isRestaurant: false
      },
      {
        id: "pandal-34",
        name: "Tridhara Sammilani",
        bengaliName: "ত্রিধারা সম্মিলনী",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Manoherpukur",
        lat: 22.5198,
        lng: 88.3555,
        metro: "Jatin Das Park",
        isRestaurant: false
      },
      {
        id: "pandal-89",
        name: "Ekdalia Evergreen Club",
        bengaliName: "একডালিয়া এভারগ্রীন",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Gariahat",
        lat: 22.5212,
        lng: 88.3666,
        metro: "Kalighat",
        isRestaurant: false
      },
      {
        id: "pandal-30",
        name: "Singhi Park Sarbojanin",
        bengaliName: "সিংঘী পার্ক",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Dover Lane",
        lat: 22.5211,
        lng: 88.3632,
        metro: "Kalighat",
        isRestaurant: false
      },
      {
        id: "pandal-68",
        name: "Maddox Square",
        bengaliName: "ম্যাডক্স স্কোয়ার",
        zone: "south",
        zoneLabel: "South Kolkata",
        locality: "Ritchie Road",
        lat: 22.5267,
        lng: 88.3548,
        metro: "Netaji Bhawan",
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
        id: "pandal-390",
        name: "Haridevpur 41 Pally Club",
        bengaliName: "হরিদেবপুর ৪১ পল্লী",
        zone: "south",
        zoneLabel: "South-West Kolkata",
        locality: "Haridevpur",
        lat: 22.4828,
        lng: 88.3387,
        metro: "Tollygunge",
        isRestaurant: false
      },
      {
        id: "pandal-422",
        name: "Behala Nutan Dal",
        bengaliName: "বেহালা নতুন দল",
        zone: "south",
        zoneLabel: "South-West Kolkata",
        locality: "Behala",
        lat: 22.5003,
        lng: 88.3202,
        metro: "Behala Chowrasta",
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
        id: "pandal-411",
        name: "Behala Club",
        bengaliName: "বেহালা ক্লাব",
        zone: "south",
        zoneLabel: "South-West Kolkata",
        locality: "Behala",
        lat: 22.5053,
        lng: 88.3141,
        metro: "Behala Chowrasta",
        isRestaurant: false
      },
      {
        id: "pandal-445",
        name: "Barisha Club",
        bengaliName: "বড়িষা ক্লাব",
        zone: "south",
        zoneLabel: "South-West Kolkata",
        locality: "Barisha",
        lat: 22.4813,
        lng: 88.3132,
        metro: "Tollygunge",
        isRestaurant: false
      }
    ]
  }
];

export const STARTER_TEMPLATES = DEFAULT_ROUTE_PLANS;

/**
 * Loads saved route plans from localStorage (indefinite device persistence)
 * Returns empty array [] by default so users start fresh and create their own custom plans.
 */
export function loadSavedRoutePlans() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, MAX_ROUTE_PLANS);
    }
    return [];
  } catch (err) {
    console.warn("Error reading route plans from localStorage:", err);
    return [];
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
 * Encodes a plan into a shareable ultra-compact URL hash string
 * Format: #p=PlanName~id1,id2,id3... (typically under 80 chars!)
 * Supports:
 *  - pandal IDs: 134, 525 (short integer)
 *  - restaurant IDs: r3, r12 (prefixed with 'r')
 *  - custom coordinates: c:lat:lng:name (if outside catalog)
 */
export function encodePlanToUrl(plan) {
  if (!plan || !plan.spots || plan.spots.length === 0) return "";
  try {
    const namePart = encodeURIComponent((plan.name || "Pujo Plan").trim());
    const idTokens = plan.spots.map((s) => {
      // Restaurant spot
      if (s.isRestaurant || (s.id && String(s.id).startsWith("rest-"))) {
        const rawId = String(s.id).replace(/^rest-/, "");
        return `r${rawId}`;
      }
      // Pandal spot from catalog
      if (s.id) {
        const rawId = String(s.id).replace(/^pandal-/, "");
        if (/^\d+$/.test(rawId)) {
          return rawId;
        }
      }
      // Custom coordinates fallback
      if (s.lat && s.lng) {
        return `c:${Number(s.lat).toFixed(4)}:${Number(s.lng).toFixed(4)}:${encodeURIComponent(s.name || "Spot")}`;
      }
      return encodeURIComponent(s.name || "spot");
    });

    const hashString = `#p=${namePart}~${idTokens.join(",")}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return `${origin}${pathname}${hashString}`;
  } catch (e) {
    console.error("Plan encoding error:", e);
    return "";
  }
}

/**
 * Decodes a plan from a shareable URL hash string.
 * Supports:
 *  1. New ultra-compact hash: #p=PlanName~134,113,148,r5
 *  2. Legacy Base64 hash: #plan=eyJucy... (100% backward compatible!)
 */
export function decodePlanFromUrl(hashString) {
  if (!hashString) return null;

  // 1. Ultra-compact hash format: #p=Name~ids
  if (hashString.includes("#p=")) {
    try {
      const payload = hashString.split("#p=")[1]?.trim();
      if (!payload) return null;

      const [rawName, rawIds] = payload.split("~");
      const planName = rawName ? decodeURIComponent(rawName) : "Shared Pujo Route";
      if (!rawIds) return null;

      const tokens = rawIds.split(",").filter(Boolean);
      const spots = [];

      for (const token of tokens.slice(0, MAX_SPOTS_PER_PLAN)) {
        // Restaurant token: e.g. r1 or r12 or rest-1
        if (token.startsWith("r")) {
          const rawNum = token.replace(/^r(est-)?/, "");
          const found = RESTAURANTS_DATA.find((r) => String(r.id) === rawNum || r.id === `rest-${rawNum}` || String(r.id) === token);
          if (found) {
            spots.push({
              id: found.id.startsWith("rest-") ? found.id : `rest-${found.id}`,
              name: found.name,
              bengaliName: found.bengaliName,
              lat: found.lat,
              lng: found.lng,
              zone: found.zone,
              zoneLabel: found.zoneLabel,
              locality: found.area || found.locality || "",
              metro: found.metro || "",
              isRestaurant: true,
              cuisine: found.cuisine || ""
            });
            continue;
          }
        }

        // Custom coordinates token: c:lat:lng:name
        if (token.startsWith("c:")) {
          const parts = token.split(":");
          const lat = parseFloat(parts[1]);
          const lng = parseFloat(parts[2]);
          const name = parts[3] ? decodeURIComponent(parts[3]) : "Custom Spot";
          if (!isNaN(lat) && !isNaN(lng)) {
            spots.push({
              id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name,
              lat,
              lng,
              zone: "central",
              locality: "Kolkata",
              isRestaurant: false
            });
            continue;
          }
        }

        // Pandal token: numeric ID
        const rawPandalId = token.replace(/^pandal-/, "");
        let pandalId = rawPandalId;

        // Legacy Siliguri URL backward compatibility:
        // If the shared plan explicitly mentions Siliguri and uses old 505-524 IDs, map to 551-570
        if (planName.toLowerCase().includes("siliguri")) {
          const num = parseInt(rawPandalId, 10);
          if (num >= 505 && num <= 524) {
            pandalId = String(num + 46); // maps 505..524 to 551..570
          }
        }

        const foundPandal = PANDALS_DATA.find((p) => String(p.id) === pandalId);
        if (foundPandal) {
          // Geographic Sanity Check:
          // If the plan already has multiple Kolkata spots (lat ~ 22.5°), prevent an outlier > 300 km away
          const kolkataSpots = spots.filter((s) => s.lat && s.lat >= 22.0 && s.lat <= 23.5);
          if (kolkataSpots.length >= 2 && (foundPandal.lat > 25.0 || foundPandal.zone === "siliguri")) {
            console.warn(`[RouteOptimizer] Prevented geographic outlier (${foundPandal.name} in ${foundPandal.zone}) in Kolkata plan`);
            continue;
          }

          spots.push({
            id: `pandal-${foundPandal.id}`,
            name: foundPandal.name,
            bengaliName: foundPandal.bengaliName,
            lat: foundPandal.lat,
            lng: foundPandal.lng,
            zone: foundPandal.zone,
            zoneLabel: foundPandal.zoneLabel,
            locality: foundPandal.locality || "",
            metro: foundPandal.metro || "",
            isRestaurant: false
          });
        }
      }

      if (spots.length === 0) return null;

      return {
        id: `shared-${Date.now()}`,
        name: planName,
        description: "Imported from short shared link",
        updatedAt: Date.now(),
        spots
      };
    } catch (err) {
      console.error("Compact plan decoding error:", err);
      return null;
    }
  }

  // 2. Legacy Base64 hash format: #plan=...
  if (hashString.includes("#plan=")) {
    try {
      const base64 = hashString.split("#plan=")[1]?.trim();
      if (!base64) return null;
      const jsonStr = decodeURIComponent(escape(atob(base64)));
      const compact = JSON.parse(jsonStr);

      return {
        id: `shared-${Date.now()}`,
        name: compact.n || "Shared Pujo Plan",
        description: compact.d || "Imported from legacy shared link",
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
      console.error("Legacy plan decoding error:", e);
      return null;
    }
  }

  return null;
}
