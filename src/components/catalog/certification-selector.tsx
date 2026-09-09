"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startFreePracticeAction } from "@/lib/exam/actions";
import { route } from "@/lib/routes";

export type SelectorVendor = { slug: string; name: string };
export type SelectorExam = { vendorSlug: string; slug: string; code: string; name: string };

export function CertificationSelector({
  vendors,
  exams,
  cta = "Start 20 free questions",
  intent = "free",
}: {
  vendors: SelectorVendor[];
  exams: SelectorExam[];
  cta?: string;
  intent?: "free" | "exam" | "premium";
}) {
  const router = useRouter();
  const [vendor, setVendor] = useState("");
  const [exam, setExam] = useState("");
  const [vendorQuery, setVendorQuery] = useState("");
  const [examQuery, setExamQuery] = useState("");

  const vendorOptions = useMemo(() => {
    const q = vendorQuery.toLowerCase();
    return vendors.filter((item) => !q || item.name.toLowerCase().includes(q) || item.slug.includes(q));
  }, [vendors, vendorQuery]);

  const examOptions = useMemo(() => {
    if (!vendor) return [];
    const q = examQuery.toLowerCase();
    return exams.filter(
      (item) =>
        item.vendorSlug === vendor &&
        (!q || item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)),
    );
  }, [exams, vendor, examQuery]);

  function go() {
    if (!vendor || !exam) return;
    if (intent === "exam") {
      router.push(route(`/certifications/${vendor}/${exam}`));
      return;
    }
    if (intent === "premium") {
      router.push(route(`/practice-test/${vendor}/${exam}/premium`));
      return;
    }
    void startFreePracticeAction(vendor, exam);
  }

  return (
    <div className="grid gap-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="selector-provider">Select certification provider</Label>
          <Input
            id="selector-provider-search"
            value={vendorQuery}
            onChange={(event) => setVendorQuery(event.target.value)}
            placeholder="Search providers"
          />
          <select
            id="selector-provider"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={vendor}
            onChange={(event) => {
              setVendor(event.target.value);
              setExam("");
            }}
          >
            <option value="">Choose a provider</option>
            {vendorOptions.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="selector-exam">Select certification exam</Label>
          <Input
            id="selector-exam-search"
            value={examQuery}
            onChange={(event) => setExamQuery(event.target.value)}
            placeholder="Search exam name or code"
            disabled={!vendor}
          />
          <select
            id="selector-exam"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm disabled:opacity-50"
            value={exam}
            disabled={!vendor}
            onChange={(event) => setExam(event.target.value)}
          >
            <option value="">{vendor ? "Choose an exam" : "Select a provider first"}</option>
            {examOptions.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="button" size="lg" disabled={!vendor || !exam} onClick={go}>
        {cta}
      </Button>
    </div>
  );
}
