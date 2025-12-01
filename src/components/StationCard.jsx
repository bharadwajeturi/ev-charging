export default function StationCard({ station }) {
  return (
    <div className="border p-2 mb-2">
      <b>{station.name}</b>
      <div>{station.address}</div>
      {station.batteryBefore != null && (
        <div>Battery before stop: {station.batteryBefore}%</div>
      )}
      {station.distanceFromStartKm && (
        <div>Distance: {station.distanceFromStartKm} km</div>
      )}
    </div>
  );
}
