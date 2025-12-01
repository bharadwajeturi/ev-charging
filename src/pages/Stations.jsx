// src/pages/Stations.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RouteSearch from "../components/RouteSearch";
import MapView from "../components/MapView";
import StationCard from "../components/StationCard";
import { fetchStationsNearPoint } from "../services/evStationsApi";

/* ---------------- HELPERS ---------------- */

// Sort so selected brand appears first, then verified, then others
function sortStationsHomePage(stations, selectedBrand) {
  const sorted = [...stations];

  return sorted.sort((a, b) => {
    // 1. Selected brand first
    const aMatch =
      selectedBrand !== "any" &&
      a.brand?.toLowerCase() === selectedBrand.toLowerCase();
    const bMatch =
      selectedBrand !== "any" &&
      b.brand?.toLowerCase() === selectedBrand.toLowerCase();

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;

    // 2. Verified next
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;

    return 0;
  });
}

/* ---------------- PAGE ---------------- */

export default function Stations() {
  const navigate = useNavigate();

  const [selectedBrand, setSelectedBrand] = useState("any");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [routeInputs, setRouteInputs] = useState(null);
  const [directions, setDirections] = useState(null);

  // Fixed: Always fetch ALL stations once user enters route
  const handleSearch = ({ origin, destination, vehicleRangeKm, startBatteryPct }) => {
    setRouteInputs({
      origin,
      destination,
      vehicleRangeKm,
      startBatteryPct,
      preferredBrand: selectedBrand,
    });
  };

  /* ---------------- LOAD ALL STATIONS FOR HOME PAGE ---------------- */
  useEffect(() => {
    if (!routeInputs) return;

    const { origin, destination, preferredBrand } = routeInputs;

    setLoading(true);

    // Get point near origin
    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status !== "OK") {
          console.error("Directions failed", status);
          setLoading(false);
          return;
        }

        setDirections(result);

        const firstStep = result.routes[0].legs[0].steps[0];
        const lat = firstStep.end_location.lat();
        const lng = firstStep.end_location.lng();

        try {
          // Fetch all stations around origin
          const all = await fetchStationsNearPoint(lat, lng);

          // Sort by brand + verified
          const ordered = sortStationsHomePage(all, selectedBrand);
          setStations(ordered);
        } catch (err) {
          console.error("Station fetch failed", err);
          setStations([]);
        }

        setLoading(false);
      }
    );
  }, [routeInputs, selectedBrand]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="h-14 bg-gray-900 text-white flex items-center px-4 font-semibold">
        EV Charge Hub
      </div>

      {/* FILTERS + ROUTE INPUT */}
      <div className="p-3 flex flex-col gap-3">

        {/* Brand filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="any">Any Brand</option>
          <option value="tata">Tata</option>
          <option value="mg">MG</option>
          <option value="mahindra">Mahindra</option>
          <option value="ather">Ather</option>
          <option value="bpcl">BPCL</option>
        </select>

        <RouteSearch onSearch={handleSearch} />

        {!stations.length && !loading && (
          <p className="text-sm text-gray-500">
            Enter route to see all charging stations…
          </p>
        )}
      </div>

      {/* MAP + RESULTS */}
      <div className="flex-1 relative">
        <MapView directions={directions} stations={stations} />

        {loading && <p className="p-3">Loading stations…</p>}

        {/* Station list */}
        <div className="absolute bottom-0 left-0 right-0 max-h-[45%] overflow-y-auto bg-white shadow-lg rounded-t-lg p-3">
          {stations.map((s, idx) => (
            <StationCard key={`${s.id}-${idx}`} station={s} />
          ))}
        </div>
      </div>

      {/* VIEW FULL ROUTE BUTTON */}
      {routeInputs && (
        <button
          className="m-3 p-2 bg-black text-white rounded"
          onClick={() =>
            navigate("/route-planner", {
              state: routeInputs,
            })
          }
        >
          View Detailed Route →
        </button>
      )}

      {/* FOOTER */}
      <div className="h-11 bg-gray-900" />
    </div>
  );
}
