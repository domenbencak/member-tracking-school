import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserControls } from "@/components/user-controls";
import { UserCreateForm } from "@/components/user-create-form";
import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function UsersPage() { await requireAdmin(); const users = await db.user.findMany({ orderBy: [{ isActive: "desc" }, { email: "asc" }] }); return <><div className="page-header"><div><h1 className="page-title">Uporabniki</h1><p className="page-description">Upravljanje dostopa in vlog</p></div></div><Card className="mb-5"><h2 className="mt-0 text-lg text-[var(--navy)]">Nov uporabnik</h2><UserCreateForm /></Card><div className="table-wrap"><table className="data-table"><thead><tr><th>E-pošta</th><th>Vloga</th><th>Stanje</th><th>Ustvarjeno</th><th>Dejanja</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td className="font-semibold">{user.email}{user.mustChangePassword && <span className="block text-xs font-normal text-[var(--text-muted)]">Zahtevana sprememba gesla</span>}</td><td><Badge>{user.role === "ADMIN" ? "Administrator" : "Uporabnik"}</Badge></td><td><Badge className={user.isActive ? "border-[#a8d8c2] bg-[#e8f5ee] text-[#12613e]" : "border-[#f0bbb7] bg-[#fff0ef] text-[#982016]"}>{user.isActive ? "Omogočen" : "Onemogočen"}</Badge></td><td>{formatDateTime(user.createdAt)}</td><td><UserControls id={user.id} email={user.email} role={user.role} isActive={user.isActive} /></td></tr>)}</tbody></table></div></>; }
