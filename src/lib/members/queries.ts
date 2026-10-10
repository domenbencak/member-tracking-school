import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { MEMBER_STATUSES } from "@/lib/members/status";

const sortFields = [
  "sequenceNumber", "membershipCardNumber", "surname", "firstName", "dateOfBirth",
  "postalCode", "postOffice", "email", "municipality", "subcommittee", "membershipFeePaid",
  "warVeteranStatus", "createdAt", "updatedAt",
  "memberStatus", "statusChangedAt",
] as const;

const triState = z.enum(["all", "yes", "no", "unknown"]).default("all");
const presence = z.enum(["all", "yes", "no"]).default("all");
const optionalDate = z.preprocess(
  (value) => value === "" || value === undefined ? undefined : value,
  z.iso.date().optional(),
);
const optionalAge = z.preprocess(
  (value) => value === "" || value === undefined ? undefined : value,
  z.coerce.number().int().min(0).max(130).optional(),
);

export const memberQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().pipe(z.union([z.literal(25), z.literal(50), z.literal(100)])).default(25),
  q: z.string().trim().max(100).default(""),
  sort: z.enum(sortFields).default("surname"),
  dir: z.enum(["asc", "desc"]).default("asc"),
  fee: triState,
  veteran: triState,
  status: z.enum(["all", ...MEMBER_STATUSES]).default("all"),
  municipality: z.string().trim().max(120).default(""),
  subcommittee: z.string().trim().max(120).default(""),
  postalCode: z.string().trim().max(20).default(""),
  postOffice: z.string().trim().max(120).default(""),
  hasEmail: presence,
  hasCard: presence,
  dobFrom: optionalDate,
  dobTo: optionalDate,
  ageMin: optionalAge,
  ageMax: optionalAge,
  columns: z.string().default(""),
});

export type MemberQuery = z.infer<typeof memberQuerySchema>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseMemberQuery(params: Record<string, string | string[] | undefined>) {
  const raw = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, key === "columns" && Array.isArray(value) ? value.join(",") : first(value)]));
  const parsed = memberQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : memberQuerySchema.parse({});
}

function triStateWhere(value: MemberQuery["fee"]) {
  if (value === "yes") return true;
  if (value === "no") return false;
  if (value === "unknown") return null;
  return undefined;
}

function utcDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function subtractYears(years: number) {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
}

export function buildMemberWhere(query: MemberQuery, archived = false): Prisma.MemberWhereInput {
  const and: Prisma.MemberWhereInput[] = [{ deletedAt: archived ? { not: null } : null }];
  if (query.q) {
    const contains = { contains: query.q, mode: "insensitive" as const };
    and.push({ OR: [
      { firstName: contains }, { surname: contains }, { membershipCardNumber: contains },
      { street: contains }, { settlement: contains }, { postalCode: contains },
      { postOffice: contains }, { email: contains }, { municipality: contains },
      { subcommittee: contains }, { vpo: contains }, { notes: contains },
    ] });
  }
  const fee = triStateWhere(query.fee);
  const veteran = triStateWhere(query.veteran);
  if (fee !== undefined) and.push({ membershipFeePaid: fee });
  if (veteran !== undefined) and.push({ warVeteranStatus: veteran });
  if (query.status !== "all") and.push({ memberStatus: query.status });
  for (const field of ["municipality", "subcommittee", "postalCode", "postOffice"] as const) {
    if (query[field]) and.push({ [field]: query[field] });
  }
  if (query.hasEmail !== "all") and.push({ email: query.hasEmail === "yes" ? { not: null } : null });
  if (query.hasCard !== "all") and.push({ membershipCardNumber: query.hasCard === "yes" ? { not: null } : null });
  const dateFilter: Prisma.DateTimeNullableFilter = {};
  if (query.dobFrom) dateFilter.gte = utcDate(query.dobFrom);
  if (query.dobTo) dateFilter.lte = utcDate(query.dobTo);
  if (typeof query.ageMin === "number") dateFilter.lte = subtractYears(query.ageMin);
  if (typeof query.ageMax === "number") dateFilter.gt = subtractYears(query.ageMax + 1);
  if (Object.keys(dateFilter).length) and.push({ dateOfBirth: dateFilter });
  return { AND: and };
}

export function buildMemberOrderBy(query: Pick<MemberQuery, "sort" | "dir">): Prisma.MemberOrderByWithRelationInput {
  const requiredFields = new Set<MemberQuery["sort"]>(["surname", "firstName", "memberStatus", "createdAt", "updatedAt"]);
  return requiredFields.has(query.sort)
    ? { [query.sort]: query.dir }
    : { [query.sort]: { sort: query.dir, nulls: "last" } };
}

export async function listMembers(query: MemberQuery, archived = false) {
  const where = buildMemberWhere(query, archived);
  const [items, total] = await db.$transaction([
    db.member.findMany({
      where,
      orderBy: buildMemberOrderBy(query),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    db.member.count({ where }),
  ]);
  return { items, total, pages: Math.max(1, Math.ceil(total / query.pageSize)) };
}

export async function memberFilterOptions() {
  const selectDistinct = async (field: "municipality" | "subcommittee" | "postalCode" | "postOffice") => {
    const rows = await db.member.findMany({
      where: { deletedAt: null, [field]: { not: null } },
      distinct: [field],
      select: { [field]: true },
      orderBy: { [field]: "asc" },
    });
    return rows
      .map((row) => (row as unknown as Record<string, string | null>)[field])
      .filter((value): value is string => value !== null);
  };
  const [municipalities, subcommittees, postalCodes, postOffices] = await Promise.all([
    selectDistinct("municipality"), selectDistinct("subcommittee"),
    selectDistinct("postalCode"), selectDistinct("postOffice"),
  ]);
  return { municipalities, subcommittees, postalCodes, postOffices };
}
