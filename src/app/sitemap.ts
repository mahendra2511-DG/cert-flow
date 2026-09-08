import { certifications, practiceTests } from "@/lib/catalog/data";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap() {
  const staticPaths = [
    "",
    "/certifications",
    "/practice-tests",
    "/about",
  ];

  const certPaths = certifications.map((item) => `/certifications/${item.slug}`);
  const testPaths = practiceTests.map((item) => `/practice-tests/${item.slug}`);

  return [...staticPaths, ...certPaths, ...testPaths].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date(),
  }));
}
