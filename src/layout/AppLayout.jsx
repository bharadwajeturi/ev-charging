import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useUITheme } from "../context/UIThemeContext";

export default function AppLayout() {
  const { themeColor } = useUITheme();

  return (
    <div className={`h-screen w-screen flex flex-col ${themeColor} text-white`}>
      <Navbar />
      <main className="flex-1 overflow-hidden bg-neutral-900">
        <Outlet />
      </main>
    </div>
  );
}
