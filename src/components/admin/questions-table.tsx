"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { deleteQuestionAction } from "@/lib/admin/actions";
import { toast } from "@/components/ui/toaster";
import { route } from "@/lib/routes";

export type AdminQuestionRow = {
  id: string;
  order: number;
  prompt: string;
  testSlug: string;
  difficulty: string;
  category: string;
  isFree: boolean;
  status: string;
  type: string;
};

export function QuestionsTable({
  questions,
  testSlug,
}: {
  questions: AdminQuestionRow[];
  testSlug?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function bulk(action: string, value?: string) {
    if (selected.length === 0) {
      toast("Select questions first.", { variant: "error" });
      return;
    }
    if (action === "delete" && !window.confirm(`Delete ${selected.length} questions? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    const response = await fetch("/api/admin/questions/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(action === "delete" ? { "x-confirm-delete": "yes" } : {}),
      },
      body: JSON.stringify({ ids: selected, action, value }),
    });
    setBusy(false);
    if (!response.ok) {
      toast("Bulk action failed.", { variant: "error" });
      return;
    }
    toast("Updated selected questions.", { variant: "success" });
    window.location.reload();
  }

  const exportQuery = new URLSearchParams();
  if (selected.length) {
    exportQuery.set("ids", selected.join(","));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setSelected(questions.map((item) => item.id))}>
          Select page
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void bulk("publish")}>
          Publish
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void bulk("unpublish")}>
          Unpublish
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void bulk("mark_free")}>
          Mark free
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void bulk("mark_premium")}>
          Mark premium
        </Button>
        <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => void bulk("delete")}>
          Delete
        </Button>
        <Button
          nativeButton={false}
          size="sm"
          variant="outline"
          render={<a href={`/api/admin/questions/export?format=csv&${exportQuery}`} />}
        >
          Export CSV
        </Button>
        <Button
          nativeButton={false}
          size="sm"
          variant="outline"
          render={<a href={`/api/admin/questions/export?format=json&${exportQuery}`} />}
        >
          Export JSON
        </Button>
        {testSlug ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              const category = window.prompt("New category");
              if (category) {
                void bulk("category", category);
              }
            }}
          >
            Change category
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">{selected.length} selected · Free questions default to a maximum of 20 per exam.</p>
      <ul className="space-y-3">
        {questions.map((question) => (
          <li key={question.id} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <label className="flex min-w-0 items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.includes(question.id)}
                  onChange={() => toggle(question.id)}
                />
                <div>
                  <p className="font-medium">
                    Q{question.order}. {question.prompt}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{question.testSlug}</Badge>
                    <Badge variant="secondary">{question.difficulty}</Badge>
                    <Badge variant="secondary">{question.category}</Badge>
                    <Badge>{question.isFree ? "Free" : "Premium"}</Badge>
                    <Badge variant={question.status === "published" ? "default" : "secondary"}>{question.status}</Badge>
                  </div>
                </div>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  render={<Link href={route(`/admin/questions/${question.id}`)} />}
                >
                  Edit
                </Button>
                <ConfirmForm
                  action={deleteQuestionAction}
                  title="Delete this question?"
                  description="This item will be removed from the practice test immediately."
                  confirmLabel="Delete"
                >
                  <input type="hidden" name="id" value={question.id} />
                  <Button type="submit" size="sm" variant="destructive">
                    Delete
                  </Button>
                </ConfirmForm>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
