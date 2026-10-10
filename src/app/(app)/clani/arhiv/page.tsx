import { Archive } from "lucide-react";
import { RestoreMemberButton } from "@/components/restore-member-button";
import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function ArchivedMembersPage() {
  await requireAdmin();
  const members = await db.member.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" }, take: 100 });
  return <><div className="page-header"><div><h1 className="page-title">Arhiv članov</h1><p className="page-description">Izbrisane zapise je mogoče obnoviti</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Član</th><th>Št. izkaznice</th><th>Arhivirano</th><th>Dejanje</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td className="font-semibold">{member.firstName} {member.surname}</td><td>{member.membershipCardNumber ?? "—"}</td><td>{member.deletedAt ? formatDateTime(member.deletedAt) : "—"}</td><td><RestoreMemberButton id={member.id} /></td></tr>)}</tbody></table>{members.length === 0 && <div className="p-8 text-center text-[var(--text-muted)]"><Archive className="mx-auto mb-2 size-7" /><p>Arhiv je prazen.</p></div>}</div></>;
}
