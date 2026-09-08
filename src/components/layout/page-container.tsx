import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props}>
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  titleId,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  titleId?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-sm font-medium tracking-wide text-primary uppercase">{eyebrow}</p>
        ) : null}
        <h2 id={titleId} className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
