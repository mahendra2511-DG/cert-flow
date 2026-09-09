import {
  BookOpenCheck,
  FileText,
  Gauge,
  ListChecks,
  RefreshCw,
  Shield,
  Sparkles,
  Headset,
} from "lucide-react";
import { PageContainer, SectionHeader } from "@/components/layout/page-container";

const reasons = [
  { icon: BookOpenCheck, title: "Free practice", body: "Twenty questions on every published exam, no payment required." },
  { icon: ListChecks, title: "Detailed explanations", body: "Each item includes why the near-miss option fails." },
  { icon: Gauge, title: "Realistic tests", body: "Timed sittings, flags, and a question grid that behaves like an exam." },
  { icon: RefreshCw, title: "Updated content", body: "Authors refresh banks when public skill outlines change." },
  { icon: Sparkles, title: "Progress tracking", body: "Scores and attempts live on your dashboard after you sign in." },
  { icon: FileText, title: "Premium PDFs", body: "Downloadable study notes, authorized only after a verified purchase." },
  { icon: Shield, title: "Secure payments", body: "Razorpay in INR with server-side signature verification." },
  { icon: Headset, title: "Fast support", body: "Account and checkout help from the support desk." },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="why-heading">
      <PageContainer>
        <SectionHeader
          titleId="why-heading"
          eyebrow="Why Certiva"
          title="Practice. Prepare. Certify."
          description="Free practice first. Premium when the first 20 are not enough."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <li
              key={reason.title}
              className="rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <reason.icon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-heading text-base font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{reason.body}</p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
