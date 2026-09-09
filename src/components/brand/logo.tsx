import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M8 20.5c3.2-1.8 5.1-4.6 5.6-8.4.3 2.4 1.4 4.3 3.4 5.6 1.6 1 3.5 1.4 5.5 1.2-2.6 3.4-6.7 5.3-11.3 5.3-1.2 0-2.3-.1-3.2-.4Z"
        className="fill-primary-foreground/90"
      />
      <path
        d="M16 7.5c.4 3.8 2.6 6.7 6.5 8.1-1.9-3.7-2.1-7.2-.6-10.6-2.2.4-4.2 1.2-5.9 2.5Z"
        className="fill-primary-foreground"
      />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-heading text-lg font-semibold tracking-tight", className)}>
      Certiva
    </span>
  );
}
