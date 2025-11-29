import { LoadScript } from "@react-google-maps/api";

const LIBRARIES = ["places"];

export function GoogleMapsProvider({ children }) {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={LIBRARIES}
    >
      {children}
    </LoadScript>
  );
}
