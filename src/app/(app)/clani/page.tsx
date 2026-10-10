import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MemberFilters } from "@/components/member-filters";
import { MemberResults } from "@/components/member-results";
import { getCurrentUser } from "@/lib/auth/authorization";
import { listMembers, memberFilterOptions, parseMemberQuery } from "@/lib/members/queries";

export default async function MembersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const query = parseMemberQuery(params);
  const [{ items, total, pages }, options] = await Promise.all([listMembers(query), memberFilterOptions()]);
  const serialized = items.map((member) => ({ ...member, dateOfBirth: member.dateOfBirth?.toISOString() ?? null, statusChangedAt: member.statusChangedAt?.toISOString() ?? null, createdAt: member.createdAt.toISOString(), updatedAt: member.updatedAt.toISOString(), deletedAt: member.deletedAt?.toISOString() ?? null }));
  return <><div className="page-header"><div><h1 className="page-title">Člani</h1><p className="page-description">Iskanje in pregled evidence članstva</p></div>{user?.role === "ADMIN" && <div className="actions"><Button asChild variant="secondary"><a href="/api/exports/members.csv"><Download className="size-4" aria-hidden="true" />Izvozi CSV</a></Button><Button asChild><Link href="/clani/nov"><Plus className="size-4" aria-hidden="true" />Dodaj člana</Link></Button></div>}</div><MemberFilters query={query} options={options} /><MemberResults members={serialized} query={query} total={total} isAdmin={user?.role === "ADMIN"} /><Pagination query={query} pages={pages} /></>;
}

function Pagination({ query, pages }: { query: ReturnType<typeof parseMemberQuery>; pages: number }) { const href = (page: number) => { const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== "" && value !== undefined).map(([key, value]) => [key, String(value)])); params.set("page", String(page)); return `?${params}`; }; return <nav className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label="Strani"><Button asChild variant="secondary"><Link aria-disabled={query.page <= 1} className={query.page <= 1 ? "pointer-events-none opacity-50" : ""} href={href(Math.max(1, query.page - 1))}>Prejšnja stran</Link></Button><span>Stran <strong>{Math.min(query.page, pages)}</strong> od <strong>{pages}</strong></span><form method="get" className="flex items-center gap-2">{Object.entries(query).filter(([key, value]) => !["page", "pageSize"].includes(key) && value !== "" && value !== undefined).map(([key, value]) => <input type="hidden" key={key} name={key} value={String(value)} />)}<label htmlFor="page-size">Na stran</label><select id="page-size" name="pageSize" defaultValue={query.pageSize} className="min-h-11 rounded-[6px] border border-[var(--border)] bg-white px-2" onChange={undefined}><option>25</option><option>50</option><option>100</option></select><Button variant="secondary" type="submit">Prikaži</Button></form><Button asChild variant="secondary"><Link aria-disabled={query.page >= pages} className={query.page >= pages ? "pointer-events-none opacity-50" : ""} href={href(Math.min(pages, query.page + 1))}>Naslednja stran</Link></Button></nav>; }
