import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { createMetadata } from "@/lib/seo";

export function ContentPage({
  title,
  description,
  path,
  children,
}: {
  title: string;
  description: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <PageContainer className="max-w-3xl py-12">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-8 space-y-4 text-sm leading-6 text-muted-foreground">{children}</div>
    </PageContainer>
  );
}

export function contentMetadata(title: string, description: string, path: string): Metadata {
  return createMetadata({ title, description, path });
}
