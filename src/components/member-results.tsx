"use client";

import { ArrowDown, ArrowUp, Eye, Pencil, Printer, Tags } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Member } from "@/generated/prisma/client";
import type { MemberQuery } from "@/lib/members/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { boolLabel, formatSlovenianDate } from "@/lib/utils";
import { memberStatusBadgeClass, memberStatusLabel, type MemberStatusValue } from "@/lib/members/status";

type SerializableMember = Omit<Member, "dateOfBirth" | "statusChangedAt" | "createdAt" | "updatedAt" | "deletedAt"> & {
  dateOfBirth: string | null;
  statusChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const storageKey = "member-label-selection";

export function MemberResults({ members, query, total, isAdmin }: { members: SerializableMember[]; query: MemberQuery; total: number; isAdmin: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setSelected(JSON.parse(sessionStorage.getItem(storageKey) || "[]"));
      } catch {
        setSelected([]);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggle(id: string) {
    setSelected((current) => {
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length < 140 ? [...current, id] : current;
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  return <>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <p className="m-0" aria-live="polite"><strong>{total}</strong> rezultatov</p>
      <Button asChild variant="secondary">
        <Link href={selected.length ? `/nalepke/a4?ids=${selected.join(",")}&start=1` : "/nalepke"}>
          <Tags className="size-4" aria-hidden="true" />Izbrane nalepke ({selected.length})
        </Link>
      </Button>
    </div>

    <div className="table-wrap desktop-member-table">
      <table className="data-table member-summary-table">
        <colgroup>
          <col className="member-select-column" />
          <col className="member-person-column" />
          <col className="member-status-column" />
          <col className="member-contact-column" />
          <col className="member-membership-column" />
          <col className="member-organization-column" />
          <col className="member-actions-column" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Izberi</span></th>
            <SortTh field="surname" label="Član" query={query} />
            <SortTh field="memberStatus" label="Status" query={query} />
            <SortTh field="email" label="Kontakt in naslov" query={query} />
            <SortTh field="membershipCardNumber" label="Članstvo" query={query} />
            <SortTh field="subcommittee" label="Organizacija" query={query} />
            <th scope="col" className="text-right">Dejanja</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const street = [member.street, member.settlement].filter(Boolean).join(", ");
            const locality = [member.postalCode, member.postOffice].filter(Boolean).join(" ");
            return <tr key={member.id}>
              <td>
                <input className="size-5" type="checkbox" checked={selected.includes(member.id)} onChange={() => toggle(member.id)} aria-label={`Izberi ${member.firstName} ${member.surname}`} />
              </td>
              <td>
                <div className="member-cell-stack">
                  <Link className="font-semibold text-[var(--police-blue)] underline" href={`/clani/${member.id}`}>{member.surname}, {member.firstName}</Link>
                  <span className="member-cell-meta">Rojen: {formatSlovenianDate(member.dateOfBirth)}</span>
                </div>
              </td>
              <td>
                <div className="member-cell-stack">
                  <MemberStatusBadge value={member.memberStatus} />
                  <span className="member-cell-meta">Od: {formatSlovenianDate(member.statusChangedAt)}</span>
                </div>
              </td>
              <td>
                <div className="member-cell-stack">
                  {member.email ? <a className="text-[var(--police-blue)] underline" href={`mailto:${member.email}`}>{member.email}</a> : <span className="member-cell-meta">E-pošta ni vnesena</span>}
                  {(street || locality) ? <address className="member-address">{street}{street && locality && <br />}{locality}</address> : <span className="member-cell-meta">Naslov ni vnesen</span>}
                </div>
              </td>
              <td>
                <div className="member-cell-stack">
                  <span><span className="member-cell-label">Izkaznica:</span> {member.membershipCardNumber ?? "—"}</span>
                  <span><span className="member-cell-label">Zap. št.:</span> {member.sequenceNumber ?? "—"}</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Status label="Članarina" value={member.membershipFeePaid} />
                    <Status label="Veteran" value={member.warVeteranStatus} />
                  </div>
                </div>
              </td>
              <td>
                <div className="member-cell-stack">
                  <span><span className="member-cell-label">Pododbor:</span> {member.subcommittee ?? "—"}</span>
                  <span><span className="member-cell-label">Občina:</span> {member.municipality ?? "—"}</span>
                  <span><span className="member-cell-label">VPO:</span> {member.vpo ?? "—"}</span>
                </div>
              </td>
              <td>
                <div className="member-actions">
                  <IconLink href={`/clani/${member.id}`} label="Odpri"><Eye /></IconLink>
                  <IconLink href={`/clani/${member.id}/nalepka`} label="Natisni nalepko"><Printer /></IconLink>
                  {isAdmin && <IconLink href={`/clani/${member.id}/uredi`} label="Uredi"><Pencil /></IconLink>}
                </div>
              </td>
            </tr>;
          })}
        </tbody>
      </table>
      {members.length === 0 && <p className="p-6 text-center text-[var(--text-muted)]">Ni članov, ki bi ustrezali izbranim pogojem.</p>}
    </div>

    <div className="mobile-member-list">
      {members.map((member) => <article className="member-card" key={member.id}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg"><Link className="text-[var(--police-blue)] underline" href={`/clani/${member.id}`}>{member.firstName} {member.surname}</Link></h2>
            <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">{member.membershipCardNumber ? `Izkaznica ${member.membershipCardNumber}` : "Brez številke izkaznice"}</p>
          </div>
          <input className="size-6" type="checkbox" checked={selected.includes(member.id)} onChange={() => toggle(member.id)} aria-label={`Izberi ${member.firstName} ${member.surname}`} />
        </div>
        <dl className="member-card-grid">
          <div><dt>E-pošta</dt><dd>{member.email ? <a className="text-[var(--police-blue)] underline" href={`mailto:${member.email}`}>{member.email}</a> : "Ni podatka"}</dd></div>
          <div><dt>Rojstni datum</dt><dd>{formatSlovenianDate(member.dateOfBirth)}</dd></div>
          <div><dt>Status</dt><dd><MemberStatusBadge value={member.memberStatus} /></dd></div>
          <div><dt>Datum spremembe statusa</dt><dd>{formatSlovenianDate(member.statusChangedAt)}</dd></div>
          <div><dt>Naslov</dt><dd>{[member.street, member.settlement, member.postalCode, member.postOffice].filter(Boolean).join(", ") || "Ni podatka"}</dd></div>
          <div><dt>Občina / pododbor</dt><dd>{[member.municipality, member.subcommittee].filter(Boolean).join(" / ") || "Ni podatka"}</dd></div>
          <div><dt>Članarina / veteran</dt><dd>{boolLabel(member.membershipFeePaid)} / {boolLabel(member.warVeteranStatus)}</dd></div>
          <div><dt>Zap. št. / VPO</dt><dd>{member.sequenceNumber ?? "—"} / {member.vpo ?? "—"}</dd></div>
        </dl>
        <div className="actions mt-4">
          <Button asChild variant="secondary"><Link href={`/clani/${member.id}`}><Eye className="size-4" />Odpri</Link></Button>
          <Button asChild variant="secondary"><Link href={`/clani/${member.id}/nalepka`}><Printer className="size-4" />Nalepka</Link></Button>
          {isAdmin && <Button asChild variant="secondary"><Link href={`/clani/${member.id}/uredi`}><Pencil className="size-4" />Uredi</Link></Button>}
        </div>
      </article>)}
      {members.length === 0 && <p className="rounded-[6px] border border-[var(--border)] bg-white p-6 text-center text-[var(--text-muted)]">Ni članov, ki bi ustrezali izbranim pogojem.</p>}
    </div>
  </>;
}

function SortTh({ field, label, query }: { field: MemberQuery["sort"]; label: string; query: MemberQuery }) {
  const active = query.sort === field;
  const nextDir = active && query.dir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== "" && value !== undefined).map(([key, value]) => [key, String(value)]));
  params.set("sort", field);
  params.set("dir", nextDir);
  params.set("page", "1");
  return <th scope="col" aria-sort={active ? (query.dir === "asc" ? "ascending" : "descending") : "none"}>
    <Link className="inline-flex min-h-10 items-center gap-1" href={`?${params}`}>{label}{active && (query.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}</Link>
  </th>;
}

function Status({ label, value }: { label: string; value: boolean | null }) {
  return <Badge className={value === true ? "border-[#a8d8c2] bg-[#e8f5ee] text-[#12613e]" : value === false ? "border-[#f0bbb7] bg-[#fff0ef] text-[#982016]" : ""}>
    <span className="status-dot" />{label}: {boolLabel(value)}
  </Badge>;
}

function MemberStatusBadge({ value }: { value: MemberStatusValue }) {
  return <Badge className={memberStatusBadgeClass(value)}><span className="status-dot" />{memberStatusLabel(value)}</Badge>;
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactElement<{ className?: string }> }) {
  return <Link href={href} className="grid size-11 shrink-0 place-items-center rounded-[6px] text-[var(--police-blue)] hover:bg-[#e8f2f9]" aria-label={label} title={label}>{children}</Link>;
}
