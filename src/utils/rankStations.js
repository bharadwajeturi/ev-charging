import { haversineDistance } from "./distance";

export function rankStations(
  stations,
  segmentPoint,
  preferredBrand
) {
  return stations
    .map((s) => {
      let score = 0;

      // ✅ Brand preference
      if (
        preferredBrand &&
        preferredBrand !== "any" &&
        s.brand?.toLowerCase() === preferredBrand
      ) {
        score += 50;
      }

      // ✅ Verified stations
      if (s.verified) score += 30;

      // ✅ Higher power
      if (s.power_kw) score += Math.min(s.power_kw, 100);

      // ✅ Distance (closer is better)
      const distance = haversineDistance(segmentPoint, {
        lat: s.lat,
        lng: s.lng
      });

      score -= distance * 2; // penalty

      return { ...s, score };
    })
    .sort((a, b) => b.score - a.score);
}
