import { useUITheme } from "../context/UIThemeContext";

export default function Navbar() {
  const { brand, intervalKm, setBrand, setIntervalKm } = useUITheme();

  return (
    <div className="h-16 bg-black text-white flex items-center px-4 gap-3">
      ⚡ EV Charge Hub

      <select
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className="bg-gray-800 px-2 py-1 rounded"
      >
        <option value="any">Any Brand</option>
        <option value="tata">Tata</option>
        <option value="mahindra">Mahindra</option>
      </select>

      <select
        value={intervalKm}
        onChange={(e) => setIntervalKm(Number(e.target.value))}
        className="bg-gray-800 px-2 py-1 rounded"
      >
        <option value={50}>50 km</option>
        <option value={100}>100 km</option>
        <option value={200}>200 km</option>
        <option value={300}>300+ km</option>
      </select>
    </div>
  );
}
