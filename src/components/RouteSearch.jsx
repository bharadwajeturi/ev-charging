import { useState } from "react";
import PlaceInput from "./PlaceInput";

export default function RouteSearch({ onSearch }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [vehicleRangeKm, setVehicleRangeKm] = useState(400);
  const [startBatteryPct, setStartBatteryPct] = useState(80);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!origin || !destination) {
      alert("Please select both origin and destination");
      return;
    }

    onSearch({
      origin: origin.address,
      destination: destination.address,
      originLatLng: { lat: origin.lat, lng: origin.lng },
      destinationLatLng: { lat: destination.lat, lng: destination.lng },
      vehicleRangeKm,
      startBatteryPct,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-3 shadow flex flex-col gap-2"
    >
      {/* ORIGIN */}
      <PlaceInput
        placeholder="Current location"
        onSelect={(place) => setOrigin(place)}
      />

      {/* DESTINATION */}
      <PlaceInput
        placeholder="Destination"
        onSelect={(place) => setDestination(place)}
      />

      {/* VEHICLE RANGE */}
      <div className="flex gap-2 items-center">
        <span className="text-xs w-32">Vehicle range</span>
        <input
          type="number"
          min="50"
          value={vehicleRangeKm}
          onChange={(e) => setVehicleRangeKm(Number(e.target.value))}
          className="border p-2 rounded text-sm flex-1"
        />
        <span className="text-xs">km</span>
      </div>

      {/* START BATTERY */}
      <div className="flex gap-2 items-center">
        <span className="text-xs w-32">Start battery</span>
        <input
          type="number"
          min="20"
          max="100"
          value={startBatteryPct}
          onChange={(e) => setStartBatteryPct(Number(e.target.value))}
          className="border p-2 rounded text-sm flex-1"
        />
        <span className="text-xs">%</span>
      </div>

      <button
        type="submit"
        className="mt-2 bg-black text-white py-2 rounded text-sm font-medium"
      >
        Plan Route
      </button>
    </form>
  );
}
