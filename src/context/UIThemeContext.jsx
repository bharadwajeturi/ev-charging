import { createContext, useContext, useState } from "react";

const UIThemeContext = createContext(null);

export function UIThemeProvider({ children }) {
  const [brand, setBrand] = useState("any");
  const [intervalKm, setIntervalKm] = useState(100);

  const themeColor =
  intervalKm <= 100 ? "green" :
  intervalKm <= 200 ? "yellow" :
  "red";


  return (
    <UIThemeContext.Provider
      value={{
        brand,
        intervalKm,
        setBrand,
        setIntervalKm,
        themeColor
      }}
    >
      {children}
    </UIThemeContext.Provider>
  );
}

export function useUITheme() {
  const ctx = useContext(UIThemeContext);
  if (!ctx) throw new Error("useUITheme must be used inside UIThemeProvider");
  return ctx;
}
