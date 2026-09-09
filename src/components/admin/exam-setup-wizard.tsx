"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { route } from "@/lib/routes";

const STEPS = [
  "Provider",
  "Exam",
  "Free 20",
  "Premium questions",
  "Premium PDF",
  "Price",
  "Preview",
  "Publish",
];

type Vendor = { slug: string; name: string };
type Exam = { vendorSlug: string; slug: string; code: string; name: string };
type Test = { slug: string; title: string; examCode: string; vendorSlug: string; examSlug: string };

export function ExamSetupWizard({
  vendors,
  exams,
  tests,
}: {
  vendors: Vendor[];
  exams: Exam[];
  tests: Test[];
}) {
  const [step, setStep] = useState(0);
  const [vendorSlug, setVendorSlug] = useState(vendors[0]?.slug ?? "");
  const [newVendor, setNewVendor] = useState("");
  const [examSlug, setExamSlug] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("499");
  const [testSlug, setTestSlug] = useState("");
  const [freeCount, setFreeCount] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);
  const [pdfName, setPdfName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = ((step + 1) / STEPS.length) * 100;
  const exam = useMemo(
    () => exams.find((item) => item.vendorSlug === vendorSlug && item.slug === examSlug),
    [exams, vendorSlug, examSlug],
  );

  async function ensureProvider() {
    if (newVendor.trim()) {
      const response = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newVendor.trim(), isPublished: true }),
      });
      const json = (await response.json()) as { slug?: string; error?: string };
      if (!response.ok || !json.slug) {
        throw new Error(json.error ?? "Could not create provider.");
      }
      setVendorSlug(json.slug);
      setNewVendor("");
      return json.slug;
    }
    if (!vendorSlug) {
      throw new Error("Select a provider.");
    }
    return vendorSlug;
  }

  async function ensureExam(nextVendor: string) {
    if (examSlug) {
      const match = tests.find((item) => item.vendorSlug === nextVendor && item.examSlug === examSlug);
      if (match) {
        setTestSlug(match.slug);
      }
      return examSlug;
    }
    const response = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorSlug: nextVendor,
        name: name || code,
        code,
        description: description || `${code} practice on Certiva.`,
        priceInr: Number(price) || 0,
        isPublished: false,
        freeQuestionLimit: 20,
      }),
    });
    const json = (await response.json()) as { slug?: string; testSlug?: string; error?: string };
    if (!response.ok || !json.slug) {
      throw new Error(json.error ?? "Could not create exam.");
    }
    setExamSlug(json.slug);
    setTestSlug(json.testSlug ?? `${json.slug}-practice`);
    return json.slug;
  }

  async function importFile(file: File, markFree: boolean) {
    if (!testSlug) {
      throw new Error("Create the exam first.");
    }
    const text = await file.text();
    const response = await fetch("/api/admin/questions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testSlug, filename: file.name, content: text, commit: true }),
    });
    const json = (await response.json()) as { importedCount?: number; error?: string };
    if (!response.ok) {
      throw new Error(json.error ?? "Import failed.");
    }
    const count = json.importedCount ?? 0;
    if (markFree) {
      setFreeCount((value) => value + count);
    } else {
      setPremiumCount((value) => value + count);
    }
    toast(`Imported ${count} questions`, { variant: "success" });
  }

  async function uploadPdf(file: File) {
    if (!vendorSlug || !examSlug) {
      throw new Error("Create the exam first.");
    }
    const form = new FormData();
    form.set("examKey", `${vendorSlug}/${examSlug}`);
    form.set("title", `${code || examSlug} Premium PDF`);
    form.set("version", "v1.0");
    form.set("isPublished", "on");
    form.set("file", file);
    await fetch("/admin/pdfs", { method: "GET" });
    const response = await fetch("/api/admin/pdf-upload", {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      throw new Error("PDF upload failed.");
    }
    setPdfName(file.name);
  }

  async function publishExam() {
    const response = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorSlug,
        name: name || exam?.name || code,
        code: code || exam?.code,
        description: description || `${code} practice on Certiva.`,
        priceInr: Number(price) || 0,
        isPublished: true,
        freeQuestionLimit: 20,
      }),
    });
    if (!response.ok) {
      throw new Error("Publish failed.");
    }
  }

  async function next() {
    setError(null);
    setBusy(true);
    try {
      if (step === 0) {
        await ensureProvider();
      }
      if (step === 1) {
        const vendor = await ensureProvider();
        if (!code.trim() && !examSlug) {
          throw new Error("Enter an exam code such as AB-100.");
        }
        await ensureExam(vendor);
      }
      if (step === 7) {
        await publishExam();
        toast("Exam published", { variant: "success" });
      }
      setStep((value) => Math.min(value + 1, STEPS.length - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Add new exam</h1>
        <p className="mt-2 text-muted-foreground">
          Eight steps from provider to publish. You can finish a commercial exam without leaving this wizard.
        </p>
      </div>
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-3 hidden gap-2 text-[11px] text-muted-foreground sm:flex">
          {STEPS.map((label, index) => (
            <li key={label} className={index === step ? "font-semibold text-foreground" : ""}>
              {index + 1}. {label}
            </li>
          ))}
        </ol>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>
            {step === 2
              ? "Free questions default to a maximum of 20. Mark them free in the CSV is_free column."
              : step === 3
                ? "Premium items are hidden from unpaid learners."
                : "Live catalog only — nothing is hard-coded in the storefront."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <>
              <Label htmlFor="vendor">Existing provider</Label>
              <select
                id="vendor"
                value={vendorSlug}
                onChange={(event) => setVendorSlug(event.target.value)}
                className="h-9 w-full rounded-lg border px-2.5 text-sm"
              >
                {vendors.map((vendor) => (
                  <option key={vendor.slug} value={vendor.slug}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              <Label htmlFor="newVendor">Or create provider</Label>
              <Input id="newVendor" value={newVendor} onChange={(event) => setNewVendor(event.target.value)} placeholder="AWS" />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Label htmlFor="existingExam">Existing exam (optional)</Label>
              <select
                id="existingExam"
                value={examSlug}
                onChange={(event) => {
                  setExamSlug(event.target.value);
                  const match = exams.find((item) => item.slug === event.target.value && item.vendorSlug === vendorSlug);
                  if (match) {
                    setCode(match.code);
                    setName(match.name);
                  }
                }}
                className="h-9 w-full rounded-lg border px-2.5 text-sm"
              >
                <option value="">Create new</option>
                {exams
                  .filter((item) => item.vendorSlug === vendorSlug)
                  .map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.code} · {item.name}
                    </option>
                  ))}
              </select>
              <Label htmlFor="code">Exam code</Label>
              <Input id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="SAA-C03" />
              <Label htmlFor="name">Exam name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Solutions Architect Associate" />
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-24 w-full rounded-lg border px-2.5 py-2 text-sm"
              />
            </>
          ) : null}

          {step === 2 || step === 3 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Target paper: {testSlug || "will be created with the exam"}
              </p>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void importFile(file, step === 2).catch((err) => setError(err instanceof Error ? err.message : "Import failed"));
                  }
                }}
              />
              <p className="text-sm">
                Free uploaded: {freeCount} · Premium uploaded: {premiumCount}
              </p>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-2">
              <Label>PDF type</Label>
              <select className="h-9 w-full rounded-lg border px-2.5 text-sm" defaultValue="PREMIUM_PDF">
                <option value="PREMIUM_PDF">Premium PDF</option>
              </select>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadPdf(file).catch((err) => setError(err instanceof Error ? err.message : "Upload failed"));
                  }
                }}
              />
              {pdfName ? <p className="text-sm">Uploaded {pdfName} ✓</p> : null}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-2">
              <Label htmlFor="price">Price (INR)</Label>
              <Input id="price" type="number" min={0} value={price} onChange={(event) => setPrice(event.target.value)} />
            </div>
          ) : null}

          {step === 6 || step === 7 ? (
            <ul className="space-y-1 text-sm">
              <li>Provider: {vendorSlug}</li>
              <li>Exam: {code || exam?.code}</li>
              <li>Free questions: {freeCount}</li>
              <li>Premium questions: {premiumCount}</li>
              <li>Premium PDF: {pdfName || "optional"}</li>
              <li>Price: ₹{price}</li>
              <li>Status: {step === 7 ? "Ready to publish" : "Draft preview"}</li>
            </ul>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={step === 0 || busy} onClick={() => setStep((value) => value - 1)}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" disabled={busy} onClick={() => void next()}>
                Continue
              </Button>
            ) : (
              <Button type="button" disabled={busy} onClick={() => void next()}>
                Publish exam
              </Button>
            )}
            {examSlug ? (
              <Button nativeButton={false} variant="ghost" render={<Link href={route(`/admin/exams/${vendorSlug}/${examSlug}/content`)} />}>
                Open content dashboard
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
