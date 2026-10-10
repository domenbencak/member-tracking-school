import { Download, Pencil, Printer } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MemberDeleteButton } from "@/components/member-delete-button";
import { requirePageUser } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { boolLabel, formatDateTime, formatSlovenianDate } from "@/lib/utils";
import { memberStatusBadgeClass, memberStatusLabel } from "@/lib/members/status";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requirePageUser()]);
  const member = await db.member.findFirst({ where: { id, deletedAt: null } }); if (!member) notFound();
  const groups = [
    ["Osebni podatki", [["Ime", member.firstName], ["Priimek", member.surname], ["Rojstni datum", formatSlovenianDate(member.dateOfBirth)]]],
    ["Kontaktni podatki", [["E-pošta", member.email]]],
    ["Naslov", [["Ulica", member.street], ["Naselje", member.settlement], ["Poštna številka", member.postalCode], ["Pošta", member.postOffice]]],
    ["Članstvo", [["Zap. št.", member.sequenceNumber], ["Št. izkaznice", member.membershipCardNumber], ["Status člana", memberStatusLabel(member.memberStatus)], ["Datum spremembe statusa", formatSlovenianDate(member.statusChangedAt)], ["Plačilo članarine", boolLabel(member.membershipFeePaid)], ["Status vojnega veterana", boolLabel(member.warVeteranStatus)], ["VPO", member.vpo]]],
    ["Organizacijski podatki", [["Občina", member.municipality], ["Pododbor", member.subcommittee]]],
    ["Opombe", [["Opombe", member.notes]]],
    ["Sistemski podatki", [["Ustvarjeno", formatDateTime(member.createdAt)], ["Posodobljeno", formatDateTime(member.updatedAt)], ["ID", member.id]]],
  ] as const;
  return <><div className="page-header"><div><div className="mb-2 flex flex-wrap items-center gap-2"><Badge className={memberStatusBadgeClass(member.memberStatus)}>{memberStatusLabel(member.memberStatus)}</Badge>{member.membershipFeePaid === true && <Badge className="border-[#a8d8c2] bg-[#e8f5ee] text-[#12613e]">Plačana članarina</Badge>}</div><h1 className="page-title">{member.firstName} {member.surname}</h1><p className="page-description">{member.membershipCardNumber ? `Številka izkaznice: ${member.membershipCardNumber}` : "Brez številke izkaznice"}</p></div><div className="actions"><Button asChild variant="secondary"><Link href={`/clani/${id}/nalepka`}><Printer className="size-4" />Natisni nalepko</Link></Button>{user.role === "ADMIN" && <><Button asChild><Link href={`/clani/${id}/uredi`}><Pencil className="size-4" />Uredi</Link></Button><MemberDeleteButton id={id} fullName={`${member.firstName} ${member.surname}`} /></>}</div></div><div className="details-grid">{groups.map(([title, rows]) => <Card className={title === "Opombe" ? "details-wide" : undefined} key={title}><h2 className="mt-0 text-lg text-[var(--navy)]">{title}</h2><dl className="detail-list">{rows.map(([label, value]) => <div className="contents" key={label}><dt>{label}</dt><dd className={label === "Opombe" ? "whitespace-pre-wrap" : undefined}>{value === null || value === "" ? "Ni podatka" : String(value)}</dd></div>)}</dl></Card>)}</div>{user.role === "ADMIN" && <Card className="mt-4"><h2 className="mt-0 text-lg text-[var(--navy)]">Izvoz podatkov</h2><div className="actions"><Button asChild variant="secondary"><a href={`/api/members/${id}/export?format=json`}><Download className="size-4" />JSON</a></Button><Button asChild variant="secondary"><a href={`/api/members/${id}/export?format=csv`}><Download className="size-4" />CSV</a></Button></div></Card>}</>;
}
