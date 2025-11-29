export function extractRoutePoints(directions) {
  const points = [];

  directions.routes[0].legs.forEach((leg) => {
    leg.steps.forEach((step) => {
      step.path.forEach((latLng) => {
        points.push({
          lat: latLng.lat(),
          lng: latLng.lng()
        });
      });
    });
  });

  return points;
}
