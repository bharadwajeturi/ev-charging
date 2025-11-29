import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import StationCard from "../components/StationCard";
import { fetchStationsNearPoint } from "../services/evStationsApi";
import { extractRoutePoints } from "../utils/routeUtils";
import { segmentRoute } from "../utils/segmentRoute";
import MapPanel from "../ui/MapPanel";


export default function RoutePlanner() {
  const [directions, setDirections] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();

  // ✅ SAFETY GUARD
  if (!state) {
    return <p>Invalid navigation</p>;
  }

  const { origin, destination, intervalKm, preferredBrand } = state;

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState([]);

  console.log("RoutePlanner state:", state);

  /* ---------------- LOAD ROUTE + POINTS ---------------- */
  useEffect(() => {
    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (res, status) => {
        if (status !== "OK") return;

        const points = extractRoutePoints(res);
        setRoutePoints(points);
        setDirections(res);

        // ✅ pick first interval point
        const segmentPoints = segmentRoute(points, intervalKm);

        if (segmentPoints.length > 0) {
          const p = segmentPoints[0];
          try {
            const list = await fetchStationsNearPoint(p.lat, p.lng);
            setStations(list);
          } catch (err) {
            console.error(err);
            setStations([]);
          } finally {
            setLoading(false);
          }
        }
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

        {stations.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>

      {/* MAP PANEL */}
      <MapPanel>
        <MapView   directions={directions} stations={stations} />
      </MapPanel>
    </div>
  );
}
