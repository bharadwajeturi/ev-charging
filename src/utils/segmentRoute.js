import { haversineDistance } from "./distance";

export function segmentRoute(points, intervalKm) {
  const segments = [];
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    accumulated += haversineDistance(points[i - 1], points[i]);

    if (accumulated >= intervalKm) {
      segments.push(points[i]);
      accumulated = 0;
    }
  }

  return segments;
}
