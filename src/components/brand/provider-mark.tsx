import Image from "next/image";
import { cn } from "@/lib/utils";

const accents: Record<string, string> = {
  microsoft: "bg-indigo-600",
  aws: "bg-amber-500",
  "google-cloud": "bg-emerald-600",
  cisco: "bg-sky-600",
  comptia: "bg-rose-600",
  "cloud-native": "bg-violet-600",
  vmware: "bg-slate-700",
  oracle: "bg-red-600",
  salesforce: "bg-cyan-600",
  servicenow: "bg-green-700",
  adobe: "bg-pink-600",
  fortinet: "bg-orange-600",
  "palo-alto": "bg-amber-700",
};

export function ProviderMark({
  slug,
  name,
  initials,
  logo,
  className,
}: {
  slug: string;
  name: string;
  initials?: string;
  logo?: string;
  className?: string;
}) {
  if (logo) {
    return (
      <span
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5",
          className,
        )}
      >
        <Image
          src={logo}
          alt={`${name} logo`}
          width={64}
          height={64}
          className="size-full object-contain"
        />
      </span>
    );
  }

  const letters =
    initials ??
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-xl text-xs font-semibold tracking-wide text-white shadow-sm",
        accents[slug] ?? "bg-primary",
        className,
      )}
    >
      {letters}
    </span>
  );
}
