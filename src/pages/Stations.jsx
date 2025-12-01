// src/pages/Stations.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RouteSearch from "../components/RouteSearch";
import MapView from "../components/MapView";
import StationCard from "../components/StationCard";

import { fetchStationsNearPoint } from "../services/evStationsApi";
import { extractRoutePoints } from "../utils/routeUtils";

/* ---------- Haversine distance ---------- */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ---------- find min distance of station to route polyline ---------- */
function stationDistanceFromRoute(station, polylinePoints) {
  let minDist = Infinity;
  for (let i = 0; i < polylinePoints.length; i += 10) {
    const p = polylinePoints[i];
    const d = distanceKm(station.lat, station.lng, p.lat, p.lng);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/* ---------- BRAND & VERIFIED SORT ---------- */
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

/* ================================================================
   PAGE — HOME PAGE STATIONS ALONG ROUTE
   ================================================================ */
export default function Stations() {
  const navigate = useNavigate();

  const [selectedBrand, setSelectedBrand] = useState("any");
  const [inputs, setInputs] = useState(null);
  const [directions, setDirections] = useState(null);

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (data) => {
    setInputs({ ...data, preferredBrand: selectedBrand });
  };

  /* ---------- MAIN LOGIC ---------- */
  useEffect(() => {
    if (!inputs) return;

    if (!window.google || !window.google.maps) {
      console.warn("Google Maps not ready");
      return;
    }

    const service = new google.maps.DirectionsService();

    setLoading(true);

    service.route(
      {
        origin: inputs.origin,
        destination: inputs.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      async (res, status) => {
        if (status !== "OK") {
          console.error("Directions failed:", status);
          setLoading(false);
          return;
        }

        setDirections(res);

        // Get polyline route points
        const polyPoints = extractRoutePoints(res);

        // Fetch ALL stations ONCE (fast)
        const allStations = await fetchStationsNearPoint(
          polyPoints[0].lat,
          polyPoints[0].lng
        );

        // Filter stations along the route
        const filtered = allStations.filter((st) => {
          const dist = stationDistanceFromRoute(st, polyPoints);
          return dist <= 5; // keep stations within 5 km of the route
        });

        // Sort by brand & verified
        const sorted = sortStationsHomePage(filtered, selectedBrand);

        setStations(sorted);
        setLoading(false);
      }
    );
  }, [inputs, selectedBrand]);

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <header className="h-14 bg-gray-900 text-white flex items-center px-4">
        ⚡ EV Charge Hub
      </header>

      <div className="p-3 bg-white shadow-sm flex flex-col gap-3">
        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="any">Any brand</option>
          <option value="tata">Tata</option>
          <option value="mg">MG</option>
          <option value="mahindra">Mahindra</option>
          <option value="ather">Ather</option>
          <option value="bpcl">BPCL</option>
        </select>

        <RouteSearch onSearch={handleSearch} />

        {!stations.length && !loading && (
          <p className="text-sm text-gray-500">Enter your route…</p>
        )}
      </div>

      <div className="flex-1 relative">
        <MapView directions={directions} stations={stations} />

        {loading && (
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded shadow text-xs">
            Loading stations…
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 max-h-[45%] overflow-y-auto bg-white p-3 shadow-lg">
          {stations.length > 0 && (
            <p className="text-xs text-gray-600 mb-2">
              🚗 {stations.length} stations along your route
            </p>
          )}

          {stations.map((s, i) => (
            <StationCard key={`${s.id}-${i}`} station={s} />
          ))}
        </div>
      </div>

      {inputs && (
        <button
          className="m-3 p-2 bg-black text-white rounded"
          onClick={() => navigate("/route-planner", { state: inputs })}
        >
          View Detailed Route →
        </button>
      )}

      <div className="h-10 bg-gray-900" />
    </div>
  );
}
