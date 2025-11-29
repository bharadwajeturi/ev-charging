import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RouteSearch from "../components/RouteSearch";
import MapView from "../components/MapView";
import StationCard from "../components/StationCard";

/**
 * BRAND CONFIG
 * Later this can come from backend / DB
 */
const BRANDS = [
  {
    id: "any",
    name: "Any Brand",
    logo: "/assets/brands/any.png", // optional for now
  },
  {
    id: "tata",
    name: "Tata",
    logo: "/assets/brands/tata.png",
  },
  {
    id: "mg",
    name: "MG",
    logo: "/assets/brands/mg.png",
  },
  {
    id: "mahindra",
    name: "Mahindra",
    logo: "/assets/brands/mahindra.png",
  },
];

/**
 * KM OPTIONS
 */
const KM_OPTIONS = [50, 100, 150, 200];

export default function Stations() {
  const navigate = useNavigate();

  // ✅ FILTER STATE
  const [selectedBrand, setSelectedBrand] = useState("any");
  const [intervalKm, setIntervalKm] = useState(50); // ✅ default 50
  const [stations] = useState([]);
  

  /**
   * Called when user clicks "Plan Route"
   */
  const handleSearch = ({ origin, destination }) => {
    if (!origin || !destination) {
      alert("Please select origin & destination");
      return;
    }

    navigate("/route-planner", {
      state: {
        origin,
        destination,
        intervalKm,
        preferredBrand: selectedBrand,
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ✅ NAVBAR (TEMP COLOR) */}
      <div
        style={{
          height: "56px",
          backgroundColor: "#111827",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontWeight: 600,
        }}
      >
        EV Charge Hub
      </div>

      {/* ✅ FILTERS + SEARCH */}
      <div
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* ✅ BRAND + KM ROW */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {/* BRAND DROPDOWN */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "8px",
            }}
          >
            {BRANDS.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          {/* KM DROPDOWN */}
          <select
            value={intervalKm}
            onChange={(e) => setIntervalKm(Number(e.target.value))}
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "8px",
            }}
          >
            {KM_OPTIONS.map((km) => (
              <option key={km} value={km}>
                Every {km} km
              </option>
            ))}
          </select>
        </div>

        {/* ✅ ROUTE SEARCH */}
        <RouteSearch onSearch={handleSearch} />

        {/* ✅ EMPTY STATE */}
        {stations.length === 0 && (
          <p style={{ fontSize: 13, color: "#666" }}>
            Enter a route to see charging recommendations 🚀
          </p>
        )}
      </div>

      {/* ✅ CONTENT AREA (MAP/LIST comes later) */}
      <div style={{ flex: 1 }}>
        <MapView stations={stations} />
      </div>

      {/* ✅ FOOTER (TEMP COLOR) */}
      <div
        style={{
          height: "44px",
          backgroundColor: "#111827",
        }}
      />
    </div>
  );
}
