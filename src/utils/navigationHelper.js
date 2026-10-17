/**
 * Generalized Google Maps Navigation & Search Helper for Aamar Pujo
 * 
 * Generates official Google Maps Universal Cross-Platform URLs for:
 * - Walking turn-by-turn navigation with destination coordinates & search query hints
 * - Live GPS or landmark origin anchoring
 * - Map place searches with pinpoint centering
 */

/**
 * Builds a universal Google Maps walking navigation URL for ANY destination
 * 
 * @param {Object} destination - Destination spot object
 * @param {number} destination.lat - Latitude of destination
 * @param {number} destination.lng - Longitude of destination
 * @param {string} [destination.name] - Spot or pandal name
 * @param {string} [destination.address] - Street address
 * @param {string} [destination.locality] - Locality / neighborhood name
 * @param {Object} [origin=null] - Optional starting position { lat, lng }
 * @returns {string} Fully qualified Google Maps walking directions URL
 */
export function buildGoogleMapsNavUrl(destination, origin = null, travelMode = "walking") {
  if (!destination || typeof destination.lat !== "number" || typeof destination.lng !== "number") {
    return "";
  }

  const destCoords = `${destination.lat},${destination.lng}`;
  const originPart =
    origin && typeof origin.lat === "number" && typeof origin.lng === "number"
      ? `&origin=${origin.lat},${origin.lng}`
      : "";

  const queryParts = [
    destination.name,
    destination.address,
    destination.locality,
    "Kolkata"
  ].filter(Boolean);

  const query = encodeURIComponent(queryParts.join(", "));

  // Map mode to Google Maps travelmode: walking, two_wheeler, transit, driving
  let gmapsMode = "walking";
  if (travelMode === "bike" || travelMode === "two_wheeler" || travelMode === "road") {
    gmapsMode = "two_wheeler";
  } else if (travelMode === "transit" || travelMode === "metro") {
    gmapsMode = "transit";
  } else if (travelMode === "driving" || travelMode === "car") {
    gmapsMode = "driving";
  } else if (travelMode === "walking" || travelMode === "foot") {
    gmapsMode = "walking";
  }

  // Use exact coordinates for destination to prevent Google Maps from resolving to wrong locations
  return `https://www.google.com/maps/dir/?api=1${originPart}&destination=${destCoords}&travelmode=${gmapsMode}`;
}

/**
 * Builds a universal Google Maps search URL centered on a spot
 * 
 * @param {Object} spot - Spot object { lat, lng, name, address, locality }
 * @returns {string} Fully qualified Google Maps search URL
 */
export function buildGoogleMapsSearchUrl(spot) {
  if (!spot || typeof spot.lat !== "number" || typeof spot.lng !== "number") {
    return "";
  }

  const queryText = `${spot.name || "Pandal"}, ${spot.address || spot.locality || "Kolkata"}`;
  const query = encodeURIComponent(queryText);

  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=&center=${spot.lat},${spot.lng}`;
}

/**
 * Helper to safely launch a Google Maps URL in a new browser tab/app
 * 
 * @param {string} url - Google Maps URL
 */
export function openGoogleMapsUrl(url) {
  if (typeof window !== "undefined" && url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function buildGoogleTransitUrl(destination, origin = null) {
  return buildGoogleMapsNavUrl(destination, origin, "transit");
}

export default {
  buildGoogleMapsNavUrl,
  buildGoogleTransitUrl,
  buildGoogleMapsSearchUrl,
  openGoogleMapsUrl
};
