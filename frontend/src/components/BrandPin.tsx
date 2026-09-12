export function BrandPin({ active = false }: { active?: boolean }) {
  return (
    <svg
      width={active ? 34 : 28}
      height={active ? 46 : 38}
      viewBox="0 0 30 40"
      className="cursor-pointer drop-shadow-[0_3px_6px_rgba(15,15,15,0.3)] transition-all duration-150"
    >
      <path
        d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.716 23.284 0 15 0z"
        fill={active ? "#e93800" : "#f8500a"}
      />
      <circle cx="15" cy="15" r="6.5" fill="white" />
    </svg>
  );
}
