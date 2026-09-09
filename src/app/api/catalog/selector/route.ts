import { jsonOk } from "@/lib/http";
import { getPublicExams, getPublicVendors } from "@/lib/admin/catalog-store";

export async function GET() {
  const vendors = getPublicVendors().map((vendor) => ({
    slug: vendor.slug,
    name: vendor.name,
  }));
  const exams = getPublicExams().map((exam) => ({
    vendorSlug: exam.vendorSlug,
    slug: exam.slug,
    code: exam.code,
    name: exam.name,
  }));
  return jsonOk({ vendors, exams });
}
