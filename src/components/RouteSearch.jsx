import { Autocomplete } from "@react-google-maps/api";
import { useState } from "react";

export default function RouteSearch({ onSearch }) {
  const [originAC, setOriginAC] = useState(null);
  const [destAC, setDestAC] = useState(null);

  const handlePlan = () => {
    if (!originAC || !destAC) {
      alert("Please select locations from suggestions.");
      return;
    }

    const origin = originAC.getPlace()?.formatted_address;
    const destination = destAC.getPlace()?.formatted_address;

    if (!origin || !destination) {
      alert("Invalid locations selected.");
      return;
    }

    onSearch({ origin, destination });
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-white rounded shadow">
      <Autocomplete onLoad={setOriginAC}>
        <input
          placeholder="Start location"
          className="p-2 border rounded w-full"
        />
      </Autocomplete>

      <Autocomplete onLoad={setDestAC}>
        <input
          placeholder="Destination"
          className="p-2 border rounded w-full"
        />
      </Autocomplete>

      <button
        onClick={handlePlan}
        className="bg-black text-white py-2 rounded"
      >
        ⚡ Plan Route
      </button>
    </div>
  );
}
