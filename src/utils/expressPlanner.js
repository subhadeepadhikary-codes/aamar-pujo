/**
 * Express Time-Crunch Shortlist Engine
 * Selects the top 2, 3, 5, 8, or 10 best & Instagram viral breakout pandals
 * STRICTLY clustered together near the user or pruned directly from the user's current plan!
 */

import { PANDALS_DATA } from "../data/pandalsData.js";
import { getPandalInstaBuzz } from "./instaBuzzData.js";
import { isPandalVisited } from "./visitedStorage.js";
import { getSpotDistanceKm, optimizeRouteSequential } from "./routeOptimizer.js";

/**
 * Generates an optimal time-crunch shortlist based on:
 * 1. Pruning from active custom plan (if filterMode === "plan" and currentPlanSpots has >= 2 spots)
 * 2. Strict geographical clustering near user or anchor (max 2.5 - 4 km, never across town!)
 * 3. 2026 Instagram viral likes and breakout art ratings
 */
export function generateExpressShortlist({
  count = 3,
  userLocation = null,
  zone = "all",
  filterMode = "plan", // 'plan' | 'near_me' | 'insta_viral'
  excludeVisited = true,
  currentPlanSpots = []
} = {}) {
  const targetCount = Math.max(2, Math.min(10, Number(count) || 3));

  // --- STRATEGY 1: PRUNE DIRECTLY FROM USER'S CURRENT PLAN ---
  if (filterMode === "plan" && currentPlanSpots && currentPlanSpots.length >= 2) {
    let pool = [...currentPlanSpots];
    if (excludeVisited) {
      const unvisited = pool.filter((p) => !isPandalVisited(p.id));
      if (unvisited.length >= 2) {
        pool = unvisited;
      }
    }

    // Score spots in current plan by viral score + proximity
    const scored = pool.map((p) => {
      const buzz = getPandalInstaBuzz(p);
      const distKm = userLocation?.lat && userLocation?.lng 
        ? getSpotDistanceKm(userLocation, p) 
        : null;

      let score = buzz.viralScore;
      if (buzz.isBreakoutGem) score += 15;
      if (distKm !== null) {
        score = (score * 1.5) / (1 + distKm * 0.3);
      }
      return { ...p, buzz, distanceKm: distKm, calcScore: score };
    });

    scored.sort((a, b) => b.calcScore - a.calcScore);
    const topSpots = scored.slice(0, Math.min(targetCount, pool.length));

    const startAnchor = userLocation?.lat && userLocation?.lng ? userLocation : topSpots[0];
    const optimizationResult = optimizeRouteSequential(topSpots, startAnchor);
    const orderedSpots = optimizationResult.optimizedSpots;
    const totalDistanceKm = optimizationResult.optimizedDistanceKm;
    const estimatedMins = Math.round(totalDistanceKm * 12 + orderedSpots.length * 25);
    const durationFormatted = estimatedMins >= 60 
      ? `${Math.floor(estimatedMins / 60)}h ${estimatedMins % 60}m` 
      : `${estimatedMins} mins`;
    const totalLikesSum = orderedSpots.reduce((acc, s) => acc + (s.buzz?.instaLikes || 0), 0);
    const breakoutCount = orderedSpots.filter((s) => s.buzz?.isBreakoutGem).length;

    return {
      spots: orderedSpots,
      count: orderedSpots.length,
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      totalDistanceFormatted: `${totalDistanceKm.toFixed(1)} km`,
      totalDurationFormatted: durationFormatted,
      totalLikesFormatted: totalLikesSum > 999999 
        ? `${(totalLikesSum / 1000000).toFixed(1)}M` 
        : `${Math.round(totalLikesSum / 1000)}K`,
      breakoutCount,
      sourceMode: "plan",
      sourceTitle: `Pruned from your active plan (${currentPlanSpots.length} stops)`
    };
  }

  // --- STRATEGY 2: TIGHT NEIGHBORHOOD CLUSTER (Near Me or Localized Area) ---
  let pool = [...PANDALS_DATA];

  if (zone && zone !== "all") {
    pool = pool.filter((p) => p.zone === zone);
  }

  if (excludeVisited) {
    const unvisited = pool.filter((p) => !isPandalVisited(p.id));
    if (unvisited.length >= targetCount) {
      pool = unvisited;
    }
  }

  // 1. Determine geographic anchor point for clustering
  let clusterAnchor = null;
  if (userLocation?.lat && userLocation?.lng) {
    clusterAnchor = userLocation;
  } else {
    // If no GPS, pick the single highest viral pandal in the filtered pool as the cluster center
    const topViral = [...pool].sort((a, b) => {
      const bBuzz = getPandalInstaBuzz(b);
      const aBuzz = getPandalInstaBuzz(a);
      return bBuzz.viralScore - aBuzz.viralScore;
    })[0];
    clusterAnchor = topViral || pool[0];
  }

  // 2. Strict Neighborhood Cluster Pruning:
  // Only keep pandals within a tight walking/short-ride radius of the cluster anchor
  // E.g. start with a 3.5 km radius so we NEVER mix North and South Kolkata 17 km apart!
  let radiusKm = 3.5;
  let clusterPool = pool.filter((p) => getSpotDistanceKm(clusterAnchor, p) <= radiusKm);
  if (clusterPool.length < targetCount) {
    radiusKm = 5.5;
    clusterPool = pool.filter((p) => getSpotDistanceKm(clusterAnchor, p) <= radiusKm);
  }
  if (clusterPool.length < targetCount) {
    clusterPool = pool; // fallback only if extremely sparse
  }

  // 3. Score the clustered candidates
  const scored = clusterPool.map((p) => {
    const buzz = getPandalInstaBuzz(p);
    const distFromAnchor = getSpotDistanceKm(clusterAnchor, p);
    let score = buzz.viralScore;
    if (buzz.isBreakoutGem) score += 15;
    // Penalty for distance within the cluster
    score = score / (1 + distFromAnchor * 0.35);

    return {
      ...p,
      buzz,
      distanceKm: distFromAnchor,
      calcScore: score
    };
  });

  scored.sort((a, b) => b.calcScore - a.calcScore);
  const topSpots = scored.slice(0, targetCount);

  // 4. Order using TSP
  const optimizationResult = optimizeRouteSequential(topSpots, clusterAnchor);
  const orderedSpots = optimizationResult.optimizedSpots;
  const totalDistanceKm = optimizationResult.optimizedDistanceKm;
  const estimatedMins = Math.round(totalDistanceKm * 12 + orderedSpots.length * 25);
  const durationFormatted = estimatedMins >= 60 
    ? `${Math.floor(estimatedMins / 60)}h ${estimatedMins % 60}m` 
    : `${estimatedMins} mins`;
  const totalLikesSum = orderedSpots.reduce((acc, s) => acc + (s.buzz?.instaLikes || 0), 0);
  const breakoutCount = orderedSpots.filter((s) => s.buzz?.isBreakoutGem).length;

  return {
    spots: orderedSpots,
    count: orderedSpots.length,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalDistanceFormatted: `${totalDistanceKm.toFixed(1)} km`,
    totalDurationFormatted: durationFormatted,
    totalLikesFormatted: totalLikesSum > 999999 
      ? `${(totalLikesSum / 1000000).toFixed(1)}M` 
      : `${Math.round(totalLikesSum / 1000)}K`,
    breakoutCount,
    sourceMode: filterMode,
    clusterRadiusKm: radiusKm
  };
}
