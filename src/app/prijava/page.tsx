import { Shield } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/authorization";
import { publicConfig } from "@/lib/config";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return <main className="grid min-h-dvh place-items-center bg-[#e9eff3] p-4"><Card className="w-full max-w-md p-7"><div className="mb-7 flex items-center gap-4"><span className="brand-mark bg-[var(--navy)]"><Shield className="size-6" aria-hidden="true" /></span><div><h1 className="m-0 text-2xl text-[var(--navy)]">{publicConfig.organizationName}</h1><p className="m-0 mt-1 text-sm text-[var(--text-muted)]">Varovan dostop do evidence članstva</p></div></div><LoginForm /></Card></main>;
}
