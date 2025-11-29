import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Stations from "./pages/Stations";
import RoutePlanner from "./pages/RoutePlanner";

export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Stations />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
      </Routes>
    
  );
}
