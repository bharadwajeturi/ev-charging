export default function StationCard({ station }) {
  return (
    <div
      style={{
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 8,
        marginBottom: 10,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{station.name}</strong>

        {station.verified && (
          <span style={{ color: "green", fontSize: 12 }}>
            ✅ Verified
          </span>
        )}
      </div>

      <p style={{ fontSize: 13 }}>{station.address}</p>

      {station.power_kw && (
        <p style={{ fontSize: 12 }}>
          ⚡ {station.power_kw} kW
        </p>
      )}

      <p style={{ fontSize: 11, color: "#777" }}>
        Source:{" "}
        {Array.isArray(station.source)
          ? station.source.join(" + ")
          : station.source}
      </p>
    </div>
  );
}
