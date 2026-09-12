interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: "text-sm", md: "text-xl", lg: "text-3xl" };

export function StarRating({ value, onChange, size = "md" }: Props) {
  const interactive = Boolean(onChange);
  return (
    <div className={`flex gap-0.5 ${SIZES[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`leading-none ${interactive ? "cursor-pointer" : "cursor-default"} ${
            star <= Math.round(value) ? "text-brand-500" : "text-neutral-300"
          }`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
