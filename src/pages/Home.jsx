import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useUITheme } from "../context/UIThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { intervalKm, brand } = useUITheme();

  const fromRef = useRef(null);
  const toRef = useRef(null);

  const planRoute = () => {
    if (!fromRef.current.value || !toRef.current.value) return;

    navigate("/route-planner", {
      state: {
        origin: fromRef.current.value,
        destination: toRef.current.value,
        intervalKm,
        preferredBrand: brand
      }
    });
  };

  return (
    <div className="p-4 space-y-3">
      <input ref={fromRef} placeholder="Current location" className="w-full p-2 text-black rounded" />
      <input ref={toRef} placeholder="Destination" className="w-full p-2 text-black rounded" />

      <button
        onClick={planRoute}
        className="w-full py-2 bg-green-500 text-black font-bold rounded"
      >
        ⚡ Plan Route
      </button>

      <p className="text-sm text-gray-400">
        Enter a route to see charging recommendations 🚀
      </p>
    </div>
  );
}
