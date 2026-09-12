import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="font-display flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-900"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-base shadow-sm">
            🍜
          </span>
          Foodtok
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {user ? (
            <>
              <Link
                to="/restaurants/new"
                className="rounded-full px-3 py-1.5 font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                Add a place
              </Link>
              <Link
                to="/profile"
                className="rounded-full px-3 py-1.5 font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                My reviews
              </Link>
              <div className="ml-2 flex items-center gap-2 border-l border-neutral-200 pl-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-1.5 font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="ml-1 rounded-full bg-brand-500 px-4 py-1.5 font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 sm:hidden"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 5h15M2.5 10h15M2.5 15h15" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-neutral-200 bg-white px-4 py-3 text-sm sm:hidden">
          {user ? (
            <>
              <div className="mb-1 flex items-center gap-2 px-2 py-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-neutral-700">{user.name}</span>
              </div>
              <Link
                to="/restaurants/new"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Add a place
              </Link>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 font-medium text-neutral-700 hover:bg-neutral-100"
              >
                My reviews
              </Link>
              <button
                onClick={handleLogout}
                className="mt-1 rounded-lg border border-neutral-300 px-2 py-2 text-left font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-lg bg-brand-500 px-2 py-2 text-center font-semibold text-white hover:bg-brand-600"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
