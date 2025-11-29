import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import RouteSearch from "../components/RouteSearch";
import MapView from "../components/MapView";
import StationCard from "../components/StationCard";
import { fetchEVStationsFromBackend } from "../services/backendEVService";

const LIBRARIES = ["places"];

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [directions, setDirections] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const calculateRoute = async (origin, destination) => {
    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status !== "OK") {
          alert("No route found");
          return;
        }

        setDirections(result);

        const center =
          result.routes[0].legs[0].start_location.toJSON();

        const evs = await fetchEVStationsFromBackend(
          center.lat,
          center.lng
        );

        setStations(evs);
      }
    );
  };

  if (!isLoaded) return <div>Loading maps…</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT */}
      <div style={{ width: "380px", padding: 12, overflowY: "auto" }}>
        <RouteSearch onSearch={calculateRoute} />

        {stations.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1 }}>
        <MapView stations={stations} directions={directions} />
      </div>
    </div>
  );
}
