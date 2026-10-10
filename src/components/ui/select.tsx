import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("min-h-11 w-full rounded-[6px] border border-[var(--border)] bg-white px-3 py-2 text-base shadow-sm", className)} {...props} />;
}
