const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function fetchStationsNearPoint(lat, lng) {
  const res = await fetch(`${BACKEND_URL}/api/ev-stations/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      latitude: lat,
      longitude: lng
    })
  });

  if (!res.ok) {
    throw new Error("Failed to fetch EV stations");
  }

  const data = await res.json();
  return data.stations || [];
}
