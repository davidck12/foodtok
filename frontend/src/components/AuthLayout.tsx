import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-7 shadow-card-hover">
        <Link to="/" className="mb-5 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-base shadow-sm">
            🍜
          </span>
          <span className="font-display text-lg font-bold text-neutral-900">Foodtok</span>
        </Link>
        <h1 className="font-display text-xl font-bold text-neutral-900">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-neutral-500">{subtitle}</p>
        {children}
        <p className="mt-5 text-center text-sm text-neutral-500">{footer}</p>
      </div>
    </div>
  );
}

export const authInputClass =
  "rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
