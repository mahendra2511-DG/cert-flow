import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  hrefForPage,
}: {
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1) as Route}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">Previous</span>
      )}
      {pages.map((item) => (
        <Link
          key={item}
          href={hrefForPage(item) as Route}
          aria-current={item === page ? "page" : undefined}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm",
            item === page ? "bg-primary text-primary-foreground" : "border hover:bg-muted",
          )}
        >
          {item}
        </Link>
      ))}
      {page < pageCount ? (
        <Link
          href={hrefForPage(page + 1) as Route}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">Next</span>
      )}
    </nav>
  );
}
