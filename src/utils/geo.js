// Geolocation utilities for Aamar Pujo

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
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
 * Formats distance with human readable walking / transit advice
 */
export function formatDistance(km) {
  if (km === null || km === undefined) return null;
  if (km < 1) {
    const meters = Math.round(km * 1000);
    const walkMin = Math.max(1, Math.round(meters / 80)); // ~80m per min walk
    return `${meters}m away · ~${walkMin} min walk`;
  }
  const walkMin = Math.round(km * 12);
  if (km < 2.5) {
    return `${km.toFixed(1)} km · ~${walkMin} min walk`;
  }
  const driveMin = Math.max(5, Math.round(km * 3.5));
  return `${km.toFixed(1)} km · ~${driveMin} min ride`;
}

/**
 * Common landmark presets for instant exploration
 */
export const POPULAR_HUBS = [
  { name: "My Live GPS", lat: null, lng: null, isLive: true },
  { name: "Gariahat Crossing (South)", lat: 22.5195, lng: 88.3653 },
  { name: "Kalighat Metro (South)", lat: 22.5204, lng: 88.3444 },
  { name: "Shyambazar 5-Point (North)", lat: 22.6033, lng: 88.3711 },
  { name: "College Street (Central)", lat: 22.5744, lng: 88.3629 },
  { name: "Salt Lake City Centre (East)", lat: 22.5878, lng: 88.4082 },
  { name: "Howrah Station (Howrah)", lat: 22.5851, lng: 88.3426 }
];
