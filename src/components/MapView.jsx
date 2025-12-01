// src/components/MapView.jsx
import { GoogleMap, DirectionsRenderer, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "300px" 
};

const centerDefault = { lat: 17.385, lng: 78.4867 }; // Hyderabad fallback

export default function MapView({ directions, stations = [] }) {
  if (!window.google) return null;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerDefault}
      zoom={6}
    >
      {directions && <DirectionsRenderer directions={directions} />}

      {stations.map((s, idx) => (
        <Marker
          key={`${s.id}-${s.stopIndex || 0}-${idx}`}
          position={{ lat: s.lat, lng: s.lng }}
        />
      ))}
    </GoogleMap>
  );
}
