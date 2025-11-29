import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { UIThemeProvider } from "./context/UIThemeContext";
import { GoogleMapsProvider } from "./providers/GoogleMapsProvider"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleMapsProvider>
        <UIThemeProvider>
          <App />
        </UIThemeProvider>
      </GoogleMapsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
