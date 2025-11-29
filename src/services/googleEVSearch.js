export async function findEVStationsAlongRoute(points) {
const service = new window.google.maps.places.PlacesService(
document.createElement("div")
);

const resultsMap = new Map();

for (let i = 0; i < points.length; i += 12) {
const point = points[i];

const request = {
  location: point,
  radius: 5000, // 5 km
  type: "electric_vehicle_charging_station",
};

await new Promise((resolve) => {
  service.nearbySearch(request, (results, status) => {
    if (
      status === window.google.maps.places.PlacesServiceStatus.OK &&
      results
    ) {
      results.forEach((place) => {
        resultsMap.set(place.place_id, {
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.vicinity,
          source: "google",
        });
      });
    }
    resolve();
  });
});

}

return Array.from(resultsMap.values());
}