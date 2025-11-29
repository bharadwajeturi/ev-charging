import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

export default function MapView({ stations, directions }) {
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      zoom={5}
      center={INDIA_CENTER}
    >
      {directions && (
        <DirectionsRenderer directions={directions} />
      )}

      {stations.map((s) => (
        <Marker
          key={s.id}
          position={{ lat: s.lat, lng: s.lng }}
          icon={{
            url: s.verified
              ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
              : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          }}
        />
      ))}
    </GoogleMap>
  );
}
