import { calculateDistance } from "./distance";

/**
 * Breaks a route into points every N kilometers
 *
 * @param {Array} routePoints - [{ lat, lng }, ...]
 * @param {number} intervalKm - distance interval (e.g. 50, 100)
 * @returns {Array} segment points [{ lat, lng }]
 */
export function segmentRoute(routePoints, intervalKm) {
  if (!Array.isArray(routePoints) || routePoints.length === 0) {
    return [];
  }

  let distanceSoFar = 0;
  const segments = [];

  for (let i = 1; i < routePoints.length; i++) {
    const prev = routePoints[i - 1];
    const curr = routePoints[i];

    if (
      prev.lat == null ||
      prev.lng == null ||
      curr.lat == null ||
      curr.lng == null
    ) {
      continue; // ✅ skip bad points safely
    }

    const distance = calculateDistance(
      prev.lat,
      prev.lng,
      curr.lat,
      curr.lng
    ); // ✅ distance in KM

    distanceSoFar += distance;

    if (distanceSoFar >= intervalKm) {
      segments.push({
        lat: curr.lat,
        lng: curr.lng
      });

      distanceSoFar = 0; // ✅ reset interval distance
    }
  }

  return segments;
}
