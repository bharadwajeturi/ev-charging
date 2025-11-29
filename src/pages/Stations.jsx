import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RouteSearch from "../components/RouteSearch";
import MapView from "../components/MapView";
import StationCard from "../components/StationCard";

import { extractRoutePoints } from "../utils/routeUtils";
import { segmentRoute } from "../utils/segmentRoute";
import { fetchStationsNearPoint } from "../services/evStationsApi";

/* ---------------- CONSTANTS ---------------- */

const BRANDS = [
  { id: "any", name: "Any Brand" },
  { id: "tata", name: "Tata" },
  { id: "mg", name: "MG" },
  { id: "mahindra", name: "Mahindra" },
];

const KM_OPTIONS = [50, 100, 150, 200];

/* ---------------- COMPONENT ---------------- */

export default function Stations() {
  const navigate = useNavigate();

  /* ✅ FILTER STATE */
  const [selectedBrand, setSelectedBrand] = useState("any");
  const [intervalKm, setIntervalKm] = useState(50);

  /* ✅ ROUTE + DATA STATE */
  const [routeInputs, setRouteInputs] = useState(null);
  const [directions, setDirections] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- SEARCH HANDLER ---------------- */
  const handleSearch = ({ origin, destination }) => {
    setRouteInputs({
      origin,
      destination,
      intervalKm,
      preferredBrand: selectedBrand,
    });
  };

  /* ---------------- ROUTE + STATION LOGIC ---------------- */
  useEffect(() => {
    if (!routeInputs) return;

    const { origin, destination, intervalKm } = routeInputs;

    setLoading(true);
    setStations([]);

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status !== "OK") {
          setLoading(false);
          alert("Invalid route");
          return;
        }

        setDirections(result);

        const points = extractRoutePoints(result);
        const segments = segmentRoute(points, intervalKm);

        const collected = [];

        for (const p of segments) {
          const nearby = await fetchStationsNearPoint(p.lat, p.lng);
          collected.push(...nearby.slice(0, 2));
        }

        setStations(collected);
        setLoading(false);
      }
    );
  }, [routeInputs]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <div className="h-14 bg-gray-900 text-white flex items-center px-4 font-semibold">
        EV Charge Hub
      </div>

      {/* FILTERS */}
      <div className="p-3 flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="flex-1 p-2"
          >
            {BRANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={intervalKm}
            onChange={(e) => setIntervalKm(Number(e.target.value))}
            className="flex-1 p-2"
          >
            {KM_OPTIONS.map((km) => (
              <option key={km} value={km}>
                Every {km} km
              </option>
            ))}
          </select>
        </div>

        <RouteSearch onSearch={handleSearch} />

        {!stations.length && !loading && (
          <p className="text-sm text-gray-500">
            Enter a route to see charging recommendations 🚀
          </p>
        )}
      </div>

      {/* MAP + RESULTS */}
      <div className="flex-1 relative">
        <MapView directions={directions} stations={stations} />

        {loading && <p className="p-3">Finding charging stations…</p>}

        {stations.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>

      {/* VIEW FULL ROUTE */}
      {routeInputs && (
        <button
          className="m-3 p-2 bg-black text-white rounded"
          onClick={() =>
            navigate("/route-planner", {
              state: routeInputs,
            })
          }
        >
          View Full Route →
        </button>
      )}

      {/* FOOTER */}
      <div className="h-11 bg-gray-900" />
    </div>
  );
}
