"use client";

import { useMemo, useState } from "react";
import { savePaperQuestionsAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: string;
  order: number;
  prompt: string;
  category: string;
  difficulty: string;
  isFree: boolean;
  status: string;
};

export function PaperQuestionBuilder({
  slug,
  title,
  selectedIds,
  questions,
}: {
  slug: string;
  title: string;
  selectedIds: string[];
  questions: Item[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return questions.filter((item) =>
      needle
        ? item.prompt.toLowerCase().includes(needle) || item.category.toLowerCase().includes(needle)
        : true,
    );
  }, [questions, query]);

  const selectedSet = new Set(selected);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function move(id: string, direction: -1 | 1) {
    setSelected((current) => {
      const index = current.indexOf(id);
      if (index < 0) {
        return current;
      }
      const next = [...current];
      const swap = index + direction;
      if (swap < 0 || swap >= next.length) {
        return current;
      }
      const a = next[index]!;
      next[index] = next[swap]!;
      next[swap] = a;
      return next;
    });
  }

  const preview = questions.find((item) => item.id === previewId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Question builder</h1>
        <p className="mt-2 text-muted-foreground">
          {title} · Selected questions: {selected.length}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions" className="max-w-sm" />
        <Button type="button" variant="outline" onClick={() => setSelected(filtered.map((item) => item.id))}>
          Select all shown
        </Button>
        <Button type="button" variant="ghost" onClick={() => setSelected([])}>
          Clear
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <h2 className="font-medium">Available questions</h2>
          <ul className="max-h-[520px] space-y-2 overflow-auto rounded-2xl border p-3">
            {filtered.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={selectedSet.has(item.id)} onChange={() => toggle(item.id)} />
                <button type="button" className="text-left" onClick={() => setPreviewId(item.id)}>
                  <span className="font-medium">Q{item.order}</span> {item.prompt}
                  <span className="mt-1 flex gap-1">
                    <Badge variant="outline">{item.difficulty}</Badge>
                    <Badge variant="secondary">{item.isFree ? "Free" : "Premium"}</Badge>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="font-medium">Selected order</h2>
          <ul className="max-h-[320px] space-y-2 overflow-auto rounded-2xl border p-3">
            {selected.map((id, index) => {
              const item = questions.find((question) => question.id === id);
              if (!item) {
                return null;
              }
              return (
                <li key={id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {index + 1}. Q{item.order} {item.prompt.slice(0, 80)}
                  </span>
                  <span className="flex gap-1">
                    <Button type="button" size="sm" variant="ghost" onClick={() => move(id, -1)}>
                      Up
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => move(id, 1)}>
                      Down
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => toggle(id)}>
                      Remove
                    </Button>
                  </span>
                </li>
              );
            })}
          </ul>
          {preview ? (
            <div className="rounded-2xl border p-4 text-sm">
              <p className="font-medium">Preview</p>
              <p className="mt-2">{preview.prompt}</p>
            </div>
          ) : null}
        </div>
      </div>
      <form action={savePaperQuestionsAction}>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="questionIds" value={selected.join(",")} />
        <Button type="submit">Save paper</Button>
      </form>
    </div>
  );
}
