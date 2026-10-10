import { db } from "@/lib/db";

export async function getDashboardData() {
  const active = { deletedAt: null } as const;
  const [total, paid, unpaid, unknownFee, veterans, noEmail, noCard, municipalities, subcommittees, births] = await Promise.all([
    db.member.count({ where: active }),
    db.member.count({ where: { ...active, membershipFeePaid: true } }),
    db.member.count({ where: { ...active, membershipFeePaid: false } }),
    db.member.count({ where: { ...active, membershipFeePaid: null } }),
    db.member.count({ where: { ...active, warVeteranStatus: true } }),
    db.member.count({ where: { ...active, email: null } }),
    db.member.count({ where: { ...active, membershipCardNumber: null } }),
    db.member.groupBy({ by: ["municipality"], where: { ...active, municipality: { not: null } }, _count: true, orderBy: { _count: { municipality: "desc" } }, take: 8 }),
    db.member.groupBy({ by: ["subcommittee"], where: { ...active, subcommittee: { not: null } }, _count: true, orderBy: { _count: { subcommittee: "desc" } }, take: 8 }),
    db.member.findMany({ where: active, select: { dateOfBirth: true } }),
  ]);
  const ageGroups = new Map([["< 18", 0], ["18–30", 0], ["31–45", 0], ["46–60", 0], ["61–75", 0], ["76+", 0], ["Ni podatka", 0]]);
  const today = new Date();
  for (const { dateOfBirth } of births) {
    if (!dateOfBirth) { ageGroups.set("Ni podatka", ageGroups.get("Ni podatka")! + 1); continue; }
    let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
    const birthdayPassed = today.getUTCMonth() > dateOfBirth.getUTCMonth() || (today.getUTCMonth() === dateOfBirth.getUTCMonth() && today.getUTCDate() >= dateOfBirth.getUTCDate());
    if (!birthdayPassed) age -= 1;
    const group = age < 18 ? "< 18" : age <= 30 ? "18–30" : age <= 45 ? "31–45" : age <= 60 ? "46–60" : age <= 75 ? "61–75" : "76+";
    ageGroups.set(group, ageGroups.get(group)! + 1);
  }
  return {
    stats: { total, paid, unpaid, unknownFee, veterans, noEmail, noCard },
    municipalities: municipalities.map((row) => ({ label: row.municipality!, value: row._count })),
    subcommittees: subcommittees.map((row) => ({ label: row.subcommittee!, value: row._count })),
    fees: [{ label: "Plačana", value: paid }, { label: "Neplačana", value: unpaid }, { label: "Ni podatka", value: unknownFee }],
    ages: Array.from(ageGroups, ([label, value]) => ({ label, value })),
  };
}
