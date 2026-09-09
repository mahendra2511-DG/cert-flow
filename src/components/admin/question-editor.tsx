"use client";

import { useMemo, useState } from "react";
import { saveQuestionAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuestionDraft = {
  id: string;
  prompt: string;
  explanation: string;
  imageUrl?: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  options: Array<{ label: string; body: string; isCorrect: boolean }>;
  difficulty: string;
  category: string;
  tags: string[];
  testSlug: string;
  isFree: boolean;
  status: string;
};

const labels = ["A", "B", "C", "D", "E"] as const;

type TestOption = { slug: string; title: string; examCode: string; vendorSlug: string; examSlug: string };

export function QuestionEditor({
  question,
  tests,
  vendors,
  exams,
}: {
  question: QuestionDraft | null;
  tests: TestOption[];
  vendors: Array<{ slug: string; name: string }>;
  exams: Array<{ vendorSlug: string; slug: string; code: string; name: string }>;
}) {
  const [vendorSlug, setVendorSlug] = useState(tests.find((item) => item.slug === question?.testSlug)?.vendorSlug ?? tests[0]?.vendorSlug ?? "");
  const [examSlug, setExamSlug] = useState(tests.find((item) => item.slug === question?.testSlug)?.examSlug ?? "");
  const examTests = tests.filter((item) => item.vendorSlug === vendorSlug && (!examSlug || item.examSlug === examSlug));
  const [prompt, setPrompt] = useState(question?.prompt ?? "");
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [imageUrl, setImageUrl] = useState(question?.imageUrl ?? "");
  const [type, setType] = useState(question?.type ?? "SINGLE_CHOICE");
  const [options, setOptions] = useState(
    labels.map((label) => {
      const option = question?.options.find((item) => item.label === label);
      return { label, body: option?.body ?? "", isCorrect: option?.isCorrect ?? false };
    }),
  );

  const previewOptions = useMemo(() => options.filter((item) => item.body.trim()), [options]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">{question ? "Edit question" : "Add question"}</h1>
        <form action={saveQuestionAction} className="space-y-4">
          <input type="hidden" name="id" value={question?.id ?? ""} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vendor">Provider</Label>
              <select
                id="vendor"
                value={vendorSlug}
                onChange={(event) => {
                  setVendorSlug(event.target.value);
                  setExamSlug("");
                }}
                className="h-8 w-full rounded-lg border px-2.5 text-sm"
              >
                {vendors.map((vendor) => (
                  <option key={vendor.slug} value={vendor.slug}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam">Exam</Label>
              <select
                id="exam"
                value={examSlug}
                onChange={(event) => setExamSlug(event.target.value)}
                className="h-8 w-full rounded-lg border px-2.5 text-sm"
              >
                <option value="">All papers for this provider</option>
                {exams
                  .filter((item) => item.vendorSlug === vendorSlug)
                  .map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.code} · {item.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="testSlug">Paper / question bank</Label>
            <select
              id="testSlug"
              name="testSlug"
              required
              defaultValue={question?.testSlug ?? examTests[0]?.slug}
              className="h-8 w-full rounded-lg border px-2.5 text-sm"
            >
              {examTests.map((test) => (
                <option key={test.slug} value={test.slug}>
                  {test.examCode} · {test.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Question</Label>
            <textarea
              id="prompt"
              name="prompt"
              required
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-28 w-full rounded-lg border px-2.5 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Question image URL (optional)</Label>
            <Input id="imageUrl" name="imageUrl" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="questionType">Question type</Label>
            <select
              id="questionType"
              name="questionType"
              value={type}
              onChange={(event) => setType(event.target.value as "SINGLE_CHOICE" | "MULTIPLE_CHOICE")}
              className="h-8 w-full rounded-lg border px-2.5 text-sm"
            >
              <option value="SINGLE_CHOICE">Single answer</option>
              <option value="MULTIPLE_CHOICE">Multiple answer</option>
            </select>
          </div>
          {options.map((option, index) => (
            <div key={option.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
              <Label className="w-6">{option.label}</Label>
              <Input
                name={`option_${option.label}`}
                value={option.body}
                placeholder={`Option ${option.label}`}
                onChange={(event) =>
                  setOptions((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, body: event.target.value } : item,
                    ),
                  )
                }
              />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <input
                  type="checkbox"
                  name={`correct_${option.label}`}
                  checked={option.isCorrect}
                  onChange={(event) =>
                    setOptions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, isCorrect: event.target.checked } : item,
                      ),
                    )
                  }
                />
                Correct
              </label>
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <textarea
              id="explanation"
              name="explanation"
              required
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              className="min-h-24 w-full rounded-lg border px-2.5 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue={question?.difficulty ?? "Medium"}
                className="h-8 w-full rounded-lg border px-2.5 text-sm"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={question?.category ?? "General"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" defaultValue={question?.tags.join(", ")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier">Free / Premium</Label>
              <select id="tier" name="tier" defaultValue={question?.isFree === false ? "premium" : "free"} className="h-8 w-full rounded-lg border px-2.5 text-sm">
                <option value="free">Free (counts toward the 20)</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={question?.status ?? "published"} className="h-8 w-full rounded-lg border px-2.5 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <Button type="submit">Save question</Button>
        </form>
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Customer preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="max-h-40 rounded-lg border object-contain" />
          ) : null}
          <p className="font-medium">{prompt || "Question text appears here."}</p>
          <ul className="space-y-2">
            {previewOptions.map((option) => (
              <li key={option.label} className="rounded-lg border px-3 py-2">
                {option.label}. {option.body}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">
            Learners do not see the explanation until they submit. Correct answers stay server-side during the sitting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
