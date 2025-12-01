import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import StationCard from "../components/StationCard";
import { fetchStationsNearPoint } from "../services/evStationsApi";
const MIN = 20;
const MAX = 60;

export default function RoutePlanner() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.warn("Google Maps not loaded yet");
      return;
    }
    const service = new google.maps.DirectionsService();

    service.route(
      { origin: state.origin, destination: state.destination, travelMode: "DRIVING" },
      async (res, status) => {
        if (status !== "OK") return;

        setDirections(res);

        let battery = state.startBatteryPct ?? 80;
        const steps = res.routes[0].legs[0].steps;

        const collected = [];
        let distance = 0;

        for (const step of steps) {
          const km = step.distance.value / 1000;
          distance += km;
          battery -= (km / state.vehicleRangeKm) * 100;

          if (battery < MIN || battery > MAX) continue;

          const lat = step.end_location.lat();
          const lng = step.end_location.lng();

          const nearby = await fetchStationsNearPoint(lat, lng);
          nearby.slice(0, 2).forEach((s, idx) =>
            collected.push({
              ...s,
              batteryBefore: Math.round(battery),
              distanceFromStartKm: Math.round(distance),
              _key: `${s.id}-${distance}-${idx}`,
            })
          );

          battery = 80;
        }

        setStations(collected);
      }
    );
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-[360px] p-4 overflow-y-auto">
        <button onClick={() => navigate("/")} className="underline mb-2">
          ← Back
        </button>

        {stations.map((s) => (
          <StationCard key={s._key || `${s.id}-${s.stopIndex}` } station={s} />
        ))}
      </div>

      <MapView directions={directions} stations={stations} />
    </div>
  );
}
