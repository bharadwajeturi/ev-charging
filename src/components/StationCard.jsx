// src/components/StationCard.jsx
export default function StationCard({ station }) {
  if (!station) return null;

  const {
    name,
    address,
    verified,
    brand,
    distanceFromStartKm,
    batteryBefore,
    chargeMinutes,
  } = station;

  // Battery color logic
  let batteryColor = "text-green-600";
  if (batteryBefore <= 50) batteryColor = "text-yellow-600";
  if (batteryBefore <= 30) batteryColor = "text-red-600";

  return (
    <div className="p-3 mb-3 border rounded shadow-sm bg-white">
      {/* TITLE + VERIFIED */}
      <div className="flex items-center justify-between">
        <div className="font-semibold text-lg">{name}</div>
        {verified && (
          <span className="text-blue-600 text-xs font-bold">✔ Verified</span>
        )}
      </div>

      {/* ADDRESS */}
      <p className="text-xs text-gray-600 mt-1">{address}</p>

      {/* BRAND */}
      {brand && (
        <p className="text-xs mt-1">
          <b>Brand:</b> {brand}
        </p>
      )}

      {/* DISTANCE FROM START */}
      {distanceFromStartKm != null && (
        <p className="text-xs mt-2">
          <b>Distance from start:</b> {distanceFromStartKm} km
        </p>
      )}

      {/* BATTERY BEFORE */}
      {batteryBefore != null && (
        <p className={`text-xs mt-1 font-semibold ${batteryColor}`}>
          <b>Battery before stop:</b> {batteryBefore}%
        </p>
      )}

      {/* CHARGING TIME */}
      {chargeMinutes != null && (
        <p className="text-xs mt-1">
          <b>Charge time:</b> {chargeMinutes} min
        </p>
      )}
    </div>
  );
}
