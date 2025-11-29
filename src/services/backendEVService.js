export async function fetchEVStationsFromBackend(lat, lng) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/ev-stations/search`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    }
  );

  const data = await res.json();
  return data.stations || [];
}
