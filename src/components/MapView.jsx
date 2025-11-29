import {
  GoogleMap,
  Marker,
  DirectionsRenderer
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

export default function MapView({ directions, stations = [] }) {
  const mapRef = useRef(null);

   useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasData = false;

    if (directions?.routes?.[0]?.overview_path) {
      directions.routes[0].overview_path.forEach(p => {
        bounds.extend(p);
        hasData = true;
      });
    }

    stations.forEach(s => {
      if (s.lat && s.lng) {
        bounds.extend({ lat: s.lat, lng: s.lng });
        hasData = true;
      }
    });

    if (hasData) {
      mapRef.current.fitBounds(bounds);
    }
  }, [directions, stations]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <GoogleMap
        onLoad={map => (mapRef.current = map)}
        mapContainerStyle={{
          width: "100%",
          height: "100%",
          minHeight: "300px"
        }}
        center={INDIA_CENTER}
        zoom={5}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        }}
      >
        {/* ✅ RED ROUTE LINE */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#DC2626",
                strokeOpacity: 0.9,
                strokeWeight: 5
              }
            }}
          />
        )}

        {/* ✅ STATION MARKERS */}
        {stations.map(station => (
          <Marker
            key={station.id}
            position={{ lat: station.lat, lng: station.lng }}
            icon={{
              url: station.verified
                ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
