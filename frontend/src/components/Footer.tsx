import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-neutral-500 sm:flex-row sm:px-6">
        <Link to="/" className="font-display flex items-center gap-1.5 font-semibold text-neutral-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs">🍜</span>
          Foodtok
        </Link>
        <p>Real reviews from tourists and locals, everywhere on Earth.</p>
        <p className="text-neutral-400">&copy; {new Date().getFullYear()} Foodtok</p>
      </div>
    </footer>
  );
}
