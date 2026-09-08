import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  count,
  className,
  showCount = true,
}: {
  value: number;
  count?: number;
  className?: string;
  showCount?: boolean;
}) {
  const rounded = Math.round(value * 2) / 2;
  const label =
    showCount && typeof count === "number"
      ? `${value.toFixed(1)} out of 5 stars from ${count} reviews`
      : `${value.toFixed(1)} out of 5 stars`;

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)} role="img" aria-label={label}>
      <span className="flex" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const filled = index + 1 <= Math.floor(rounded);
          const half = !filled && index + 0.5 === rounded;
          return (
            <Star
              key={index}
              className={cn(
                "size-3.5",
                filled || half ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
              )}
            />
          );
        })}
      </span>
      <span className="font-medium tabular-nums">{value.toFixed(1)}</span>
      {showCount && typeof count === "number" ? (
        <span className="text-muted-foreground">({count})</span>
      ) : null}
    </div>
  );
}
