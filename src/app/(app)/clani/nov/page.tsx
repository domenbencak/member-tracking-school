import type { Metadata } from "next";
import { MemberForm } from "@/components/member-form";
import { createMemberAction } from "@/lib/members/actions";
import { requireAdmin } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Dodaj člana" };
export default async function NewMemberPage() {
  await requireAdmin();
  return <><div className="page-header"><div><h1 className="page-title">Dodaj člana</h1><p className="page-description">Ročni vnos novega člana</p></div></div><section className="rounded-[6px] border border-[var(--border)] bg-white p-5"><MemberForm member={null} action={createMemberAction} /></section></>;
}
