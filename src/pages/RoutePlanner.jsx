import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MapView from "../components/MapView";
import StationCard from "../components/StationCard";
import MapPanel from "../ui/MapPanel";

import { fetchStationsNearPoint } from "../services/evStationsApi";
import { extractRoutePoints } from "../utils/routeUtils";
import { segmentRoute } from "../utils/segmentRoute";

export default function RoutePlanner() {
  const navigate = useNavigate();
  const { state } = useLocation();

  /* ✅ SAFETY GUARD */
  if (!state) {
    return <p className="p-4">Invalid navigation</p>;
  }

  const { origin, destination, intervalKm, preferredBrand } = state;

  /* ✅ LOCAL STATE (FIXED) */
  const [directions, setDirections] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("RoutePlanner state:", state);

  /* ---------------- LOAD ROUTE + STATIONS ---------------- */
  useEffect(() => {
    const service = new window.google.maps.DirectionsService();

    setLoading(true);
    setStations([]);

    service.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status !== "OK") {
          setLoading(false);
          return;
        }

        setDirections(result);

        const points = extractRoutePoints(result);
        const segmentPoints = segmentRoute(points, intervalKm);

        const collected = [];

        for (const p of segmentPoints) {
          try {
            const list = await fetchStationsNearPoint(p.lat, p.lng);
            collected.push(...list.slice(0, 2));
          } catch (err) {
            console.error("Station fetch failed", err);
          }
        }

        setStations(collected);
        setLoading(false);
      }
    );
  }, [origin, destination, intervalKm]);

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-screen">
      {/* LEFT PANEL */}
      <div className="w-[360px] p-4 border-r overflow-y-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-3 text-sm underline"
        >
          ← Back
        </button>

        <h2 className="font-bold mb-3">Route Planner</h2>

        <p className="text-sm"><b>From:</b> {origin}</p>
        <p className="text-sm"><b>To:</b> {destination}</p>
        <p className="text-sm"><b>Interval:</b> {intervalKm} km</p>
        <p className="text-sm mb-2"><b>Brand:</b> {preferredBrand}</p>

        {loading && (
          <p className="text-xs text-gray-500 mt-4">
            Finding charging stations…
          </p>
        )}

        {!loading && stations.length === 0 && (
          <p className="text-xs text-gray-500 mt-4">
            No charging stations found.
          </p>
        )}

        {stations.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>

      {/* MAP PANEL */}
      <MapPanel>
        <MapView directions={directions} stations={stations} />
      </MapPanel>
    </div>
  );
}
