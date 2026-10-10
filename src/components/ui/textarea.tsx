import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full resize-y rounded-[6px] border border-[var(--border)] bg-white px-3 py-2 text-base text-[var(--text)] shadow-sm placeholder:text-[#71808e] disabled:bg-[#edf1f4]", className)} {...props} />;
}
