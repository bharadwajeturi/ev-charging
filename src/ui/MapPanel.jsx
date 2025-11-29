import { useUITheme } from "../context/UIThemeContext";

export default function MapPanel({ children }) {
  const { brand } = useUITheme();

  return (
    <div className="w-full h-full relative">
      {children}
    </div>
  );
}
