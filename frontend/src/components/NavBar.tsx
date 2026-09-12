import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-1.5 text-lg font-bold text-brand-600">
          🍜 Foodtok
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/restaurants/new" className="text-neutral-600 hover:text-neutral-900">
                Add a place
              </Link>
              <Link to="/profile" className="text-neutral-600 hover:text-neutral-900">
                My reviews
              </Link>
              <span className="hidden text-neutral-400 sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-neutral-600 hover:text-neutral-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-brand-500 px-3 py-1.5 font-medium text-white hover:bg-brand-600"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
