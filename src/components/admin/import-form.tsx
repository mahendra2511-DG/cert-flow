"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImportIssue } from "@/lib/admin/import";
import { toast } from "@/components/ui/toaster";

type TestOption = { slug: string; title: string; examCode: string };

type Preview = {
  rowCount: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  errors: ImportIssue[];
  duplicates: ImportIssue[];
  importedCount: number;
  error?: string;
};

const SAMPLE_CSV = `question,option_a,option_b,option_c,option_d,option_e,correct_answer,explanation,difficulty,category
Which control reduces blast radius after a leaked access key?,Rotate the key and attach a deny policy,Share the key in chat,Disable MFA,Open the security group to 0.0.0.0/0,,A,Rotate credentials and constrain remaining access immediately.,Intermediate,IAM
A workload needs objects in two regions. Which approach fits?,Single-region bucket only,Cross-Region Replication,Disable versioning,Public ACLs on every object,,B,Replication copies objects to a second region for durability and locality.,Beginner,Storage`;

export function ImportForm({ tests }: { tests: TestOption[] }) {
  const [testSlug, setTestSlug] = useState(tests[0]?.slug ?? "");
  const [fileName, setFileName] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [stage, setStage] = useState<"idle" | "parsing" | "validating" | "importing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const issues = useMemo(() => {
    if (!preview) {
      return [];
    }
    return [...preview.errors, ...preview.duplicates];
  }, [preview]);

  async function readFile(file: File) {
    setError(null);
    setPreview(null);
    setStage("parsing");
    setProgress(15);
    setFileName(file.name);
    const text = await file.text();
    setContent(text);
    setProgress(35);
    setStage("validating");
    const response = await fetch("/api/admin/questions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testSlug, filename: file.name, content: text, commit: false }),
    });
    const json = (await response.json()) as Preview;
    if (!response.ok) {
      setError(json.error ?? "Validation failed.");
      setStage("idle");
      setProgress(0);
      return;
    }
    setPreview(json);
    setProgress(70);
    setStage("idle");
  }

  async function importValid() {
    if (!content || !fileName) {
      setError("Choose a CSV or JSON file first.");
      return;
    }
    setError(null);
    setStage("importing");
    setProgress(85);
    const response = await fetch("/api/admin/questions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testSlug, filename: fileName, content, commit: true }),
    });
    const json = (await response.json()) as Preview;
    if (!response.ok) {
      setError(json.error ?? "Import failed.");
      toast(json.error ?? "Import failed.", { variant: "error" });
      setPreview(json.validCount !== undefined ? json : preview);
      setStage("idle");
      return;
    }
    setPreview(json);
    setProgress(100);
    setStage("done");
    toast(`Imported ${json.importedCount} questions`, { variant: "success" });
  }

  function loadSample() {
    setFileName("sample-questions.csv");
    setContent(SAMPLE_CSV);
    setPreview(null);
    setError(null);
    setStage("idle");
    setProgress(0);
    void (async () => {
      setStage("validating");
      setProgress(40);
      const response = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testSlug,
          filename: "sample-questions.csv",
          content: SAMPLE_CSV,
          commit: false,
        }),
      });
      const json = (await response.json()) as Preview;
      if (!response.ok) {
        setError(json.error ?? "Validation failed.");
        setStage("idle");
        return;
      }
      setPreview(json);
      setProgress(70);
      setStage("idle");
    })();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Bulk question import</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Upload CSV or JSON. Files are validated before anything is written. Duplicates (same prompt
          on the test or inside the file) are skipped.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
          <CardDescription>
            CSV columns: question, option_a–e, correct_answer, explanation, difficulty, category,
            question_type, is_free. JSON may use options[], correctAnswer, and isFree. Preview must
            be confirmed before rows are inserted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testSlug">Target practice test</Label>
            <select
              id="testSlug"
              value={testSlug}
              onChange={(event) => setTestSlug(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {tests.map((test) => (
                <option key={test.slug} value={test.slug}>
                  {test.examCode} · {test.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">CSV or JSON file</Label>
            <input
              id="file"
              type="file"
              accept=".csv,.json,text/csv,application/json"
              className="block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void readFile(file);
                }
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={loadSample}>
              Validate sample CSV
            </Button>
            <a href="/api/admin/questions/template" className="text-sm font-medium underline-offset-4 hover:underline">
              Download CSV template
            </a>
            <Button type="button" disabled={!preview || preview.validCount === 0 || stage === "importing"} onClick={() => void importValid()}>
            Confirm Import ({preview?.validCount ?? 0} valid)
          </Button> is Confirm Import in the user request. Change button.
          </div>
          {fileName ? <p className="text-xs text-muted-foreground">File: {fileName}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {stage === "parsing"
              ? "Parsing file…"
              : stage === "validating"
                ? "Validating rows…"
                : stage === "importing"
                  ? "Importing valid questions…"
                  : stage === "done"
                    ? "Import complete"
                    : preview
                      ? "Ready to import"
                      : "Waiting for a file"}
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {preview ? (
        <section className="grid gap-3 sm:grid-cols-4">
          <Stat label="Rows found" value={preview.rowCount} />
          <Stat label="Valid" value={preview.validCount} />
          <Stat label="Invalid" value={preview.invalidCount} />
          <Stat label="Duplicates" value={preview.duplicateCount} />
        </section>
      ) : null}

      {preview?.importedCount ? (
        <p className="text-sm font-medium">Imported {preview.importedCount} questions into this test.</p>
      ) : null}

      {issues.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Validation errors</CardTitle>
            <CardDescription>Fix these rows and upload again. Duplicates are listed separately.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {issues.map((issue, index) => (
                <li key={`${issue.row}-${issue.field}-${index}`} className="flex flex-wrap items-start gap-2">
                  <Badge variant="outline">Row {issue.row}</Badge>
                  {issue.field ? <Badge variant="secondary">{issue.field}</Badge> : null}
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
