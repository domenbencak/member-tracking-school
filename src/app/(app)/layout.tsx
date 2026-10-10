import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  return <AppShell user={user}>{children}</AppShell>;
}
