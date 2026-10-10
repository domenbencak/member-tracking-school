import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-11 w-full rounded-[6px] border border-[var(--border)] bg-white px-3 py-2 text-base text-[var(--text)] shadow-sm placeholder:text-[#71808e] disabled:bg-[#edf1f4]", className)} {...props} />;
}
