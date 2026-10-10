import { requireAdmin } from "@/lib/auth/authorization";
import { writeAudit } from "@/lib/audit";
import { csvRow } from "@/lib/csv";
import { db } from "@/lib/db";
import { boolLabel } from "@/lib/utils";
import { memberStatusLabel } from "@/lib/members/status";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(); const { id } = await context.params;
  const member = await db.member.findUnique({ where: { id } }); if (!member) return Response.json({ error: "Član ne obstaja." }, { status: 404 });
  const url = new URL(request.url); const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const exported = {
    id: member.id, sequenceNumber: member.sequenceNumber, membershipCardNumber: member.membershipCardNumber,
    surname: member.surname, firstName: member.firstName, dateOfBirth: member.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    memberStatus: member.memberStatus, statusChangedAt: member.statusChangedAt?.toISOString().slice(0, 10) ?? null, notes: member.notes,
    street: member.street, settlement: member.settlement, postalCode: member.postalCode, postOffice: member.postOffice,
    warVeteranStatus: member.warVeteranStatus, email: member.email, municipality: member.municipality,
    subcommittee: member.subcommittee, membershipFeePaid: member.membershipFeePaid, vpo: member.vpo,
    createdAt: member.createdAt.toISOString(), updatedAt: member.updatedAt.toISOString(), archivedAt: member.deletedAt?.toISOString() ?? null,
  };
  await writeAudit(actor, "MEMBER_EXPORTED", "Member", id, { format });
  if (format === "json") return new Response(JSON.stringify(exported, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="clan-${id}.json"`, "Cache-Control": "no-store" } });
  const headers = ["ID", "Zap. št.", "Št. izkaznice", "Priimek", "Ime", "Rojstni datum", "Status člana", "Datum spremembe statusa", "Opombe", "Ulica", "Naselje", "Poštna številka", "Pošta", "Vojni veteran", "E-pošta", "Občina", "Pododbor", "Članarina", "VPO", "Ustvarjeno", "Posodobljeno"];
  const values = [member.id, member.sequenceNumber, member.membershipCardNumber, member.surname, member.firstName, exported.dateOfBirth, memberStatusLabel(member.memberStatus), exported.statusChangedAt, member.notes, member.street, member.settlement, member.postalCode, member.postOffice, boolLabel(member.warVeteranStatus), member.email, member.municipality, member.subcommittee, boolLabel(member.membershipFeePaid), member.vpo, exported.createdAt, exported.updatedAt];
  return new Response(`\uFEFF${csvRow(headers)}${csvRow(values)}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="clan-${id}.csv"`, "Cache-Control": "no-store" } });
}
