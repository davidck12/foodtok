import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AddRestaurant } from "./pages/AddRestaurant";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { RestaurantDetail } from "./pages/RestaurantDetail";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Toaster position="top-center" />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurants/new" element={<ProtectedRoute><AddRestaurant /></ProtectedRoute>} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
