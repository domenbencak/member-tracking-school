"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeReturnPath } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), redirect: false });
    setPending(false);
    if (result?.error) { setError("Prijava ni uspela. Preverite vnesene podatke ali poskusite pozneje."); return; }
    router.push(safeReturnPath(searchParams.get("callbackUrl"), "/")); router.refresh();
  }
  return <form className="grid gap-5" onSubmit={submit}>
    <div className="field"><label htmlFor="email">E-pošta</label><Input id="email" name="email" type="email" autoComplete="username" required /></div>
    <div className="field"><label htmlFor="password">Geslo</label><div className="flex gap-2"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required /><Button type="button" size="icon" variant="secondary" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Skrij geslo" : "Pokaži geslo"}>{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</Button></div></div>
    {error && <p role="alert" className="m-0 text-sm text-[var(--danger)]">{error}</p>}
    <Button type="submit" disabled={pending}>{pending && <LoaderCircle className="size-4 animate-spin" />}Prijava</Button>
  </form>;
}
