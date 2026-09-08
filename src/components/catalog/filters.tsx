import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sortOptions = [
  { value: "popular", label: "Popular" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name" },
] as const;

export function CatalogFilters({
  action = "/certifications",
  q,
  vendor,
  category,
  sort,
  vendors,
  categories,
  hideVendor = false,
}: {
  action?: string;
  q?: string;
  vendor?: string;
  category?: string;
  sort?: string;
  vendors: Array<{ slug: string; name: string }>;
  categories: Array<{ slug: string; name: string }>;
  hideVendor?: boolean;
}) {
  const selectClass =
    "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <form action={action} className="space-y-4 rounded-2xl border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="catalog-q">Search</Label>
        <Input
          id="catalog-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Exam code, vendor, or topic"
        />
      </div>
      {hideVendor ? null : (
        <div className="space-y-2">
          <Label htmlFor="catalog-vendor">Provider</Label>
          <select id="catalog-vendor" name="vendor" defaultValue={vendor ?? ""} className={selectClass}>
            <option value="">All providers</option>
            {vendors.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="catalog-category">Category</Label>
        <select
          id="catalog-category"
          name="category"
          defaultValue={category ?? ""}
          className={selectClass}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="catalog-sort">Sort</Label>
        <select id="catalog-sort" name="sort" defaultValue={sort ?? "popular"} className={selectClass}>
          {sortOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full">
        Apply filters
      </Button>
    </form>
  );
}
