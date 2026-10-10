import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border px-4 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "border-[var(--police-blue)] bg-[var(--police-blue)] text-white hover:bg-[var(--police-blue-hover)]",
        secondary: "border-[var(--border)] bg-white text-[var(--navy)] hover:bg-[#edf3f7]",
        danger: "border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-[#8f1c13]",
        ghost: "border-transparent bg-transparent text-current hover:bg-black/5",
      },
      size: { default: "", icon: "size-11 px-0" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
