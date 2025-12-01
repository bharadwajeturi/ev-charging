// src/pages/Stations.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RouteSearch from "../components/RouteSearch";
import MapView from "../components/MapView";
import StationCard from "../components/StationCard";
import { fetchStationsNearPoint } from "../services/evStationsApi";

/* ---------------- HELPERS ---------------- */

// Brand + verified sort for HOME PAGE
// 1) Selected brand first
// 2) Verified next
// 3) Others
function sortStationsHomePage(stations, selectedBrand) {
  const brand = selectedBrand?.toLowerCase?.() || "any";

  return [...stations].sort((a, b) => {
    const aBrand = brand !== "any" && a.brand?.toLowerCase() === brand;
    const bBrand = brand !== "any" && b.brand?.toLowerCase() === brand;

    if (aBrand && !bBrand) return -1;
    if (!aBrand && bBrand) return 1;

    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;

    return 0;
  });
}

/* ---------------- PAGE ---------------- */

export default function Stations() {
  const navigate = useNavigate();

  const [selectedBrand, setSelectedBrand] = useState("any");

  const [inputs, setInputs] = useState(null);       // origin + dest + range + battery
  const [directions, setDirections] = useState(null);

  const [rawStations, setRawStations] = useState([]); // all stations along route
  const [stations, setStations] = useState([]);       // sorted view

  const [loading, setLoading] = useState(false);

  /* ---- When user hits "Plan route" on HOME page ---- */
  const handleSearch = (data) => {
    // data: { origin, destination, vehicleRangeKm, startBatteryPct }
    setInputs({
      ...data,
      preferredBrand: selectedBrand,
    });
  };

  /* ---- Fetch ALL stations along the full route (once per route) ---- */
  useEffect(() => {
    if (!inputs) return;

    if (!window.google || !window.google.maps) {
      console.warn("Google Maps not loaded yet");
      return;
    }

    const service = new google.maps.DirectionsService();

    setLoading(true);
    setRawStations([]);
    setStations([]);

    service.route(
      {
        origin: inputs.origin,
        destination: inputs.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      async (res, status) => {
        if (status !== "OK") {
          console.error("Stations page directions failed:", status);
          setLoading(false);
          return;
        }

        setDirections(res);

        const leg = res.routes[0]?.legs?.[0];
        if (!leg) {
          setLoading(false);
          return;
        }

        const steps = leg.steps;
        const seenIds = new Set();
        const collected = [];

        let distanceCoveredKm = 0;

        for (const step of steps) {
          const stepKm = step.distance.value / 1000;
          distanceCoveredKm += stepKm;

          const lat = step.end_location.lat();
          const lng = step.end_location.lng();

          try {
            const list = await fetchStationsNearPoint(lat, lng);

            list.forEach((st) => {
              if (seenIds.has(st.id)) return;
              seenIds.add(st.id);

              collected.push({
                ...st,
                // approximate distance from start of route
                distanceFromStartKm: Math.round(distanceCoveredKm),
              });
            });
          } catch (err) {
            console.error("Station fetch failed on Stations page:", err);
          }
        }

        console.log("Stations page – collected along route:", collected);
        setRawStations(collected);
        setLoading(false);
      }
    );
  }, [inputs]);

  /* ---- Re-order when brand filter changes ---- */
  useEffect(() => {
    if (!rawStations.length) {
      setStations(rawStations);
      return;
    }

    const ordered = sortStationsHomePage(rawStations, selectedBrand);
    setStations(ordered);
  }, [rawStations, selectedBrand]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER / NAVBAR */}
      <header className="h-14 bg-gray-900 text-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-semibold tracking-wide">EV Charge Hub</span>
        </div>
      </header>

      {/* FILTERS + ROUTE INPUT */}
      <div className="p-3 flex flex-col gap-3 bg-white shadow-sm">
        {/* Brand filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            🚗 Brand
          </span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="flex-1 p-2 border rounded text-sm"
          >
            <option value="any">Any brand</option>
            <option value="tata">Tata</option>
            <option value="mg">MG</option>
            <option value="mahindra">Mahindra</option>
            <option value="ather">Ather</option>
            <option value="bpcl">BPCL</option>
          </select>
        </div>

        {/* Route search (origin / destination / range / battery) */}
        <RouteSearch onSearch={handleSearch} />

        {!stations.length && !loading && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            🔍 Enter route to see all charging stations along the way…
          </p>
        )}
      </div>

      {/* MAP + RESULTS */}
      <div className="flex-1 relative">
        {/* Map */}
        <MapView directions={directions} stations={stations} />

        {loading && (
          <p className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded text-xs text-gray-700 shadow">
            🔄 Loading stations along your route…
          </p>
        )}

        {/* Station list bottom sheet */}
        <div className="absolute bottom-0 left-0 right-0 max-h-[45%] overflow-y-auto bg-white shadow-lg rounded-t-lg p-3 border-t">
          {stations.length > 0 && (
            <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                📍 <b>{stations.length}</b> stations found along route
              </span>
              <span className="flex items-center gap-1">
                ✅ brand & verified priority
              </span>
            </div>
          )}

          {stations.map((s, idx) => (
            <StationCard key={`${s.id}-${idx}`} station={s} />
          ))}
        </div>
      </div>

      {/* VIEW FULL ROUTE BUTTON */}
      {inputs && (
        <button
          className="m-3 mt-1 mb-3 p-2 bg-black text-white rounded text-sm flex items-center justify-center gap-2"
          onClick={() =>
            navigate("/route-planner", {
              state: inputs, // origin, destination, vehicleRangeKm, startBatteryPct, preferredBrand
            })
          }
        >
          🧭 View detailed route & battery plan →
        </button>
      )}

      {/* FOOTER STRIP */}
      <div className="h-11 bg-gray-900" />
    </div>
  );
}
