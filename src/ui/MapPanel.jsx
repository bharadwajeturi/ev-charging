import React from "react";
export default function MapPanel({ children }) {
  return (
    <div className="flex-1 h-full w-full relative overflow-hidden bg-black">
      {/* Map always fills the panel */}
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
