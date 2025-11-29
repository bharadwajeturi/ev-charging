import { Routes, Route } from "react-router-dom";
import Stations from "./pages/Stations";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Stations />} />
    </Routes>
  );
}
