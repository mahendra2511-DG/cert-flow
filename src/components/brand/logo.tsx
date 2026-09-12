import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  withTagline = false,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <Image
      src={withTagline ? "/brand/logo-full.png" : "/brand/logo-mark.png"}
      alt="Certiva"
      width={2172}
      height={withTagline ? 724 : 521}
      priority
      className={cn("h-9 w-auto", className)}
    />
  );
}
