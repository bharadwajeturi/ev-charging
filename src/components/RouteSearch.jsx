import { Autocomplete } from "@react-google-maps/api";
import { useRef } from "react";

export default function RouteSearch({ onSearch }) {
  const originRef = useRef();
  const destinationRef = useRef();

  const handleSearch = () => {
    if (!originRef.current.value || !destinationRef.current.value)
      return;

    onSearch(
      originRef.current.value,
      destinationRef.current.value
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-3">
      <Autocomplete>
        <input
          ref={originRef}
          placeholder="Current location"
          className="w-full border p-2 mb-2 rounded"
        />
      </Autocomplete>

      <Autocomplete>
        <input
          ref={destinationRef}
          placeholder="Destination"
          className="w-full border p-2 mb-2 rounded"
        />
      </Autocomplete>

      <button
        onClick={handleSearch}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Find Charging Stations
      </button>
    </div>
  );
}
