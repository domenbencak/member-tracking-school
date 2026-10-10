import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex min-h-6 items-center gap-1 rounded-full border border-[var(--border)] bg-[#edf3f7] px-2 py-0.5 text-xs font-semibold text-[var(--navy)]", className)} {...props} />;
}
