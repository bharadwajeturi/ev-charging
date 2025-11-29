import StationCard from "../components/StationCard";

export default function StationList({ stations }) {
  if (!stations.length) {
    return (
        <div className="flex items-center justify-center h-full text-gray-500">
            Enter a route to see charging recommendations 🚀
        </div>
         );
  }

  return (
    <div className="space-y-3">
      {stations.map((station) => (
        <StationCard key={station.id} station={station} />
      ))}
    </div>
  );
}
