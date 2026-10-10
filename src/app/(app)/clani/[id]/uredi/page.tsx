import { notFound } from "next/navigation";
import { MemberForm } from "@/components/member-form";
import { db } from "@/lib/db";
import { updateMemberAction } from "@/lib/members/actions";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); const { id } = await params;
  const member = await db.member.findFirst({ where: { id, deletedAt: null } });
  if (!member) notFound();
  return <><div className="page-header"><div><h1 className="page-title">Uredi člana</h1><p className="page-description">{member.firstName} {member.surname}</p></div></div><section className="rounded-[6px] border border-[var(--border)] bg-white p-5"><MemberForm member={member} action={updateMemberAction.bind(null, id)} /></section></>;
}
