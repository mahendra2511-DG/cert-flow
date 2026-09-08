import { PracticeTestCard } from "@/components/catalog/cards";
import { practiceTests } from "@/lib/catalog/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Practice tests",
  description: "Timed practice exams with scores, retakes, and explanations after purchase.",
  path: "/practice-tests",
});

export default function PracticeTestsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Practice tests</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Each test lists length, passing score, and INR price. Open a test for the purchase path and
        exam format.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {practiceTests.map((item) => (
          <PracticeTestCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
