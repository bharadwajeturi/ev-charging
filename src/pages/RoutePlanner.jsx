import { useLocation } from "react-router-dom";
import StationCard from "../components/StationCard";
import MapView from "../components/MapView";

export default function RoutePlanner() {
  const { state } = useLocation();
  if (!state) return <p className="p-4">Invalid navigation</p>;

  // DEMO STATIONS
  const stations = [
    { id: 1, name: "Tata Power Charger", lat: 17.385, lng: 78.486 },
    { id: 2, name: "EVRE Station", lat: 17.60, lng: 78.48 }
  ];

  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-2">
      
      {/* LIST AREA */}
      <div className="overflow-y-auto p-4 space-y-3 bg-neutral-950">
        {stations.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>

      {/* MAP AREA */}
      <div className="hidden md:block bg-black">
        <MapView stations={stations} />
      </div>

      {/* MOBILE MAP TOGGLE */}
      <div className="md:hidden p-2 text-center bg-neutral-800 border-t border-neutral-700">
        <button
          onClick={() => alert("Mobile map toggle will be added later")}
          className="px-4 py-2 bg-white text-black rounded"
        >
          Show Map
        </button>
      </div>
    </div>
  );
}
