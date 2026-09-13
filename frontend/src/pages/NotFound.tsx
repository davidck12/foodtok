import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center sm:px-6">
      <span className="text-4xl">🍽️</span>
      <h1 className="font-display text-2xl font-bold text-neutral-900">This table's empty</h1>
      <p className="text-neutral-500">We couldn't find the page you're looking for.</p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
      >
        Back to Foodtok
      </Link>
    </div>
  );
}
