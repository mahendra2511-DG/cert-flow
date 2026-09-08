import { seedExams, vendorPath } from "@/lib/catalog/seed-catalog";
import { practiceTests } from "@/lib/catalog/data";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap() {
  const staticPaths = [
    "",
    "/certifications",
    "/practice-tests",
    "/about",
    "/resources",
    "/support",
    "/privacy",
    "/terms",
    "/contact",
  ];

  const vendorPaths = [...new Set(seedExams.map((exam) => vendorPath(exam.vendorSlug)))];
  const examPaths = seedExams.map((exam) => `/certifications/${exam.vendorSlug}/${exam.slug}`);
  const testPaths = practiceTests.map((item) => `/practice-tests/${item.slug}`);
  const practiceTestPaths = seedExams.map(
    (exam) => `/practice-test/${exam.vendorSlug}/${exam.slug}`,
  );

  return [...staticPaths, ...vendorPaths, ...examPaths, ...testPaths, ...practiceTestPaths].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date(),
  }));
}
