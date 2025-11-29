import { LoadScript } from "@react-google-maps/api";

const LIBRARIES = ["places"];

export default function GoogleMapsProvider({ children }) {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
      {children}
    </LoadScript>
  );
}
