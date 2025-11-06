// src/pages/HomeUser/HomeUser.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function HomeUser() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      {/* área principal; crece y deja espacio bajo el navbar sticky */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
