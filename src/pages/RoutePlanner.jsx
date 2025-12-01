// src/pages/RoutePlanner.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MapView from "../components/MapView";
import StationCard from "../components/StationCard";
import MapPanel from "../ui/MapPanel";
import { fetchStationsNearPoint } from "../services/evStationsApi";

/* ---------- constants ---------- */

const MIN_BATTERY = 20;   // %
const MAX_BATTERY = 60;   // %
const STATION_RADIUS_KM = 30; // how far from step to accept a station

/* ---------- helpers ---------- */

// Decide spacing between checks based on vehicle range
function deriveSegmentKm(vehicleRangeKm) {
  if (!vehicleRangeKm || vehicleRangeKm <= 0) return 80; // fallback
  if (vehicleRangeKm <= 200) return 40;
  if (vehicleRangeKm <= 350) return 60;
  return 80;
}

// Haversine distance between two lat/lng in km
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Rough charging time estimate (minutes) to go from batteryBefore → 80%
function estimateChargingTimeMinutes(station, batteryBefore) {
  if (batteryBefore == null) return 0;

  const target = 80;
  const delta = Math.max(0, target - batteryBefore);

  const batteryKwh = 50; // assume 50 kWh pack
  const power = station.power_kw || 30; // kW

  const neededKwh = (delta / 100) * batteryKwh;
  const hours = neededKwh / power;
  return Math.round(hours * 60);
}

// Sort: verified → preferred brand → stop order
function orderStationsForRoute(stations, preferredBrand) {
  return [...stations].sort((a, b) => {
    // 1. verified first
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;

    // 2. preferred brand next
    if (preferredBrand && preferredBrand !== "any") {
      const aPref =
        a.brand &&
        a.brand.toLowerCase() === preferredBrand.toLowerCase();
      const bPref =
        b.brand &&
        b.brand.toLowerCase() === preferredBrand.toLowerCase();

      if (aPref && !bPref) return -1;
      if (!aPref && bPref) return 1;
    }

    // 3. earlier stopIndex first
    if (a.stopIndex !== b.stopIndex) {
      return a.stopIndex - b.stopIndex;
    }

    return 0;
  });
}

/* ---------- component ---------- */

export default function RoutePlanner() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // safety: direct access to /route-planner
  if (!state) {
    return <p className="p-4">Invalid navigation</p>;
  }

  const {
    origin,
    destination,
    vehicleRangeKm,
    startBatteryPct,
    preferredBrand,
  } = state;

  const [directions, setDirections] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = new window.google.maps.DirectionsService();

    setLoading(true);
    setStations([]);

    const vehicleRange = vehicleRangeKm || 400; // km
    const segmentKm = deriveSegmentKm(vehicleRangeKm); // spacing between checks
    const energyPerKm = 100 / vehicleRange; // % battery per km

    let battery = startBatteryPct ?? 80; // starting battery %
    let distanceCoveredKm = 0;
    let nextCheckKm = segmentKm;

    service.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status !== "OK") {
          console.error("RoutePlanner directions failed:", status);
          setLoading(false);
          return;
        }

        setDirections(result);

        const leg = result.routes[0]?.legs?.[0];
        if (!leg) {
          setLoading(false);
          return;
        }

        const steps = leg.steps || [];

        const collected = [];
        const seenIds = new Set();

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const stepKm = step.distance.value / 1000;
          distanceCoveredKm += stepKm;

          // apply battery usage for this step
          const usedPct = stepKm * energyPerKm;
          battery = battery - usedPct;
          const batteryBefore = Math.round(battery);

          // only check for stations every ~segmentKm
          if (distanceCoveredKm < nextCheckKm) continue;

          // move next checkpoint forward
          nextCheckKm += segmentKm;

          // apply battery window 20–60%
          if (batteryBefore < MIN_BATTERY || batteryBefore > MAX_BATTERY) {
            continue;
          }

          try {
            const lat = step.end_location.lat();
            const lng = step.end_location.lng();

            console.log("Fetching stations near:", lat, lng);

            const nearbyAll = await fetchStationsNearPoint(lat, lng);

            // 🔍 filter by radius so we don't always show the same city stations
            const nearby = nearbyAll.filter((st) => {
              if (typeof st.lat !== "number" || typeof st.lng !== "number") {
                return false;
              }
              const d = distanceKm(lat, lng, st.lat, st.lng);
              return d <= STATION_RADIUS_KM;
            });

            if (!nearby.length) {
              // nothing close – continue driving, no reset to 80
              continue;
            }

            // prefer verified + brand within this stop
            const sortedNearby = orderStationsForRoute(
              nearby.map((st) => ({
                ...st,
                stopIndex: collected.length + 1, // temporary, will re-ordered later
              })),
              preferredBrand
            );

            // pick top 2 per stop
            const top = sortedNearby.slice(0, 2);

            top.forEach((station, idxForStop) => {
              if (seenIds.has(station.id)) return;
              seenIds.add(station.id);

              collected.push({
                ...station,
                stopIndex: collected.length + 1,
                distanceFromStartKm: Math.round(distanceCoveredKm),
                batteryBefore,
                chargeMinutes: estimateChargingTimeMinutes(
                  station,
                  batteryBefore
                ),
                _key: `${station.id}-${distanceCoveredKm}-${idxForStop}`,
              });
            });

            // we assume we charged at this stop
            battery = 80;
          } catch (err) {
            console.error("Station fetch failed", err);
          }
        }

        const ordered = orderStationsForRoute(collected, preferredBrand);
        console.log("RoutePlanner final collected stops:", ordered);

        setStations(ordered);
        setLoading(false);
      }
    );
  }, [origin, destination, vehicleRangeKm, startBatteryPct, preferredBrand]);

  /* ---------- UI ---------- */

  return (
    <div className="flex h-screen">
      {/* LEFT PANEL – stop list */}
      <div className="w-[360px] p-4 border-r overflow-y-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-3 text-sm underline"
        >
          ← Back
        </button>

        <h2 className="font-bold mb-3">Route Planner</h2>

        <p className="text-sm">
          <b>From:</b> {origin}
        </p>
        <p className="text-sm">
          <b>To:</b> {destination}
        </p>
        <p className="text-sm">
          <b>Vehicle range:</b> {vehicleRangeKm} km
        </p>
        <p className="text-sm">
          <b>Start battery:</b> {startBatteryPct ?? 80}%
        </p>
        <p className="text-sm mb-2">
          <b>Brand preference:</b> {preferredBrand}
        </p>

        {loading && (
          <p className="text-xs text-gray-500 mt-4">
            Finding charging stops…
          </p>
        )}

        {!loading && stations.length === 0 && (
          <p className="text-xs text-gray-500 mt-4">
            No charging stops required on this route.
          </p>
        )}

        {!loading &&
          stations.map((s) => (
            <StationCard
              key={s._key || `${s.id}-${s.stopIndex}`}
              station={s}
            />
          ))}
      </div>

      {/* RIGHT – map */}
      <MapPanel>
        <MapView directions={directions} stations={stations} />
      </MapPanel>
    </div>
  );
}
