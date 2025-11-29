import StationCard from "../components/StationCard";

const BATTERY_KWH = 60;          // Avg EV battery
const CONSUMPTION_PER_KM = 0.15; // 15 kWh / 100 km

export default function PlannedStops({
  segmentStations = [],
  intervalKm = 0,
}) {
  if (!segmentStations.length) {
    return (
      <p className="text-sm text-gray-200 mt-6">
        Calculating charging strategy…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {segmentStations.map((segment, index) => {
        // 🔋 energy usage till this stop
        const distanceTillNow = intervalKm * (index + 1);
        const energyUsed = distanceTillNow * CONSUMPTION_PER_KM;

        const batteryRemaining = Math.max(
          0,
          100 - Math.round((energyUsed / BATTERY_KWH) * 100)
        );

        return (
          <div key={index} className="space-y-2">
            <div className="text-sm font-semibold text-white">
              Stop {index + 1} (≈ {distanceTillNow} km)
            </div>

            {/* 🔋 Battery indicator */}
            <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden">
              <div
                className={`
                  h-3 rounded-full transition-all duration-500
                  ${batteryRemaining < 20
                    ? "bg-red-500"
                    : batteryRemaining < 40
                    ? "bg-yellow-400"
                    : "bg-green-500"}
                `}
                style={{ width: `${batteryRemaining}%` }}
              />
            </div>

            <div className="text-xs text-gray-300">
              Estimated battery remaining:{" "}
              <span className="font-bold">
                {batteryRemaining}%
              </span>
            </div>

            {/* ✅ Stations for this stop */}
            {segment.stations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
