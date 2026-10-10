import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[6px] border border-[var(--border)] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,67,.08)]", className)} {...props} />;
}
