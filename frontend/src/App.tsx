import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Footer } from "./components/Footer";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";

// Route-level code splitting: everything but the landing page loads on demand, so first paint
// only pays for what a visitor actually needs.
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const Register = lazy(() => import("./pages/Register").then((m) => ({ default: m.Register })));
const AddRestaurant = lazy(() => import("./pages/AddRestaurant").then((m) => ({ default: m.AddRestaurant })));
const RestaurantDetail = lazy(() =>
  import("./pages/RestaurantDetail").then((m) => ({ default: m.RestaurantDetail })),
);
const Profile = lazy(() => import("./pages/Profile").then((m) => ({ default: m.Profile })));

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Toaster position="top-center" />
      <NavBar />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurants/new" element={<ProtectedRoute><AddRestaurant /></ProtectedRoute>} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}
