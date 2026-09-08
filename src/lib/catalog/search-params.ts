import type { ExamSort } from "@/lib/catalog/repository";

export type CatalogSearch = {
  q?: string;
  vendor?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export function parseCatalogSearch(search: CatalogSearch) {
  const page = Number.parseInt(search.page ?? "1", 10);
  const sort = (search.sort ?? "popular") as ExamSort;
  return {
    q: search.q?.trim() || undefined,
    vendor: search.vendor || undefined,
    category: search.category || undefined,
    sort: ["popular", "rating", "price-asc", "price-desc", "name"].includes(sort)
      ? sort
      : "popular",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function catalogHref(
  base: string,
  params: { q?: string; vendor?: string; category?: string; sort?: string; page?: number },
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.vendor) search.set("vendor", params.vendor);
  if (params.category) search.set("category", params.category);
  if (params.sort && params.sort !== "popular") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}
