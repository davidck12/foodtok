import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useDebounce } from "../lib/useDebounce";
import type { RestaurantSuggestion } from "../types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: RestaurantSuggestion) => void;
  placeholder?: string;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const i = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-semibold text-brand-600">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}

export function RestaurantSearchInput({ value, onChange, onSelect, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(value, 180);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["restaurant-suggestions", debouncedValue],
    queryFn: async () =>
      (await api.get<{ suggestions: RestaurantSuggestion[] }>("/restaurants/suggest", { params: { q: debouncedValue } }))
        .data.suggestions,
    enabled: debouncedValue.trim().length >= 2,
  });

  const pending = value.trim().length >= 2 && (value !== debouncedValue || isFetching);

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && value.trim().length >= 2 && (suggestions.length > 0 || pending);

  function handleSelect(suggestion: RestaurantSuggestion) {
    onSelect(suggestion);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="flex items-center gap-2 px-2">
        {pending ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            className="shrink-0 animate-spin text-brand-400"
            fill="none"
          >
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
            <path d="M17.5 10a7.5 7.5 0 0 0-7.5-7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="shrink-0 text-neutral-400"
          >
            <circle cx="9" cy="9" r="6.5" />
            <path d="M18 18l-4.5-4.5" strokeLinecap="round" />
          </svg>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          className="w-full bg-transparent py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      {showDropdown && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white py-2 text-left shadow-popover">
          {suggestions.length === 0 && pending ? (
            <li className="px-4 py-3 text-sm text-neutral-400">Searching…</li>
          ) : (
            suggestions.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(s)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                    i === activeIndex ? "bg-brand-50" : "hover:bg-neutral-50"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs">
                    📍
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-neutral-900">
                      {highlightMatch(s.name, debouncedValue)}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">
                      {s.cuisine} · {s.city}
                    </span>
                  </span>
                  {s.source === "google" && (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                      Google
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
