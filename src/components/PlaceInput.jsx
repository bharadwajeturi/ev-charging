import { useEffect, useRef } from "react";

export default function PlaceInput({ placeholder, onSelect }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    autocompleteRef.current =
      new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["formatted_address", "geometry"],
      });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry || !place.formatted_address) return;

      onSelect({
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className="border p-2 rounded text-sm w-full"
    />
  );
}
