import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CatalogSearch({
  className,
  size = "md",
  defaultValue,
  id = "catalog-search",
  submitLabel = "Search",
  showSubmit = true,
}: {
  className?: string;
  size?: "md" | "lg";
  defaultValue?: string;
  id?: string;
  submitLabel?: string;
  showSubmit?: boolean;
}) {
  const large = size === "lg";

  return (
    <form
      action="/certifications"
      role="search"
      className={cn("flex w-full flex-col gap-2 sm:flex-row sm:items-center", className)}
    >
      <div className="relative min-w-0 flex-1">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground",
            large && "size-5 left-3.5",
          )}
          aria-hidden="true"
        />
        <Input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="Search by exam code, vendor, or topic"
          aria-label="Search certifications"
          className={cn("pl-8", large && "h-12 rounded-xl pl-11 text-base md:text-base")}
        />
        {!large ? (
          <span className="sr-only">Results open on the certifications page</span>
        ) : null}
      </div>
      {showSubmit ? (
        <Button type="submit" size={large ? "lg" : "default"} className={cn(large && "h-12 px-6")}>
          {submitLabel}
        </Button>
      ) : (
        <button type="submit" className="sr-only">
          {submitLabel}
        </button>
      )}
    </form>
  );
}
