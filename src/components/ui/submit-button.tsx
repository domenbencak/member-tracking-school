"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ children = "Shrani" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}{pending ? "Shranjujem …" : children}</Button>;
}
