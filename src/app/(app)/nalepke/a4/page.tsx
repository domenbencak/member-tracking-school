import Link from "next/link";
import { LabelContent } from "@/components/label-content";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { db } from "@/lib/db";
import { LABELS_PER_SHEET } from "@/lib/printing";
import styles from "./a4-labels.module.css";

export default async function A4LabelsPage({ searchParams }: { searchParams: Promise<{ ids?: string; start?: string }> }) {
  const query = await searchParams;
  const ids = (query.ids ?? "").split(",").filter(Boolean).slice(0, 140);
  const start = Math.min(14, Math.max(1, Number(query.start) || 1));
  const rows = ids.length ? await db.member.findMany({ where: { id: { in: ids }, deletedAt: null }, select: { id: true, firstName: true, surname: true, street: true, postalCode: true, postOffice: true } }) : [];
  const map = new Map(rows.map((row) => [row.id, row])); const members = ids.map((id) => map.get(id)).filter((value): value is NonNullable<typeof value> => Boolean(value));
  const cells: (typeof members[number] | null)[] = [...Array(start - 1).fill(null), ...members]; while (cells.length % LABELS_PER_SHEET !== 0) cells.push(null);
  const sheets = Array.from({ length: Math.max(1, Math.ceil(cells.length / LABELS_PER_SHEET)) }, (_, index) => cells.slice(index * LABELS_PER_SHEET, (index + 1) * LABELS_PER_SHEET));
  return <div className="a4-print-page"><div className="print-controls"><div className="page-header"><div><h1 className="page-title">A4 list nalepk</h1><p className="page-description">2 stolpca × 7 vrstic, nalepke 99,1 × 38,1 mm</p></div><div className="actions"><PrintButton /><Button asChild variant="secondary"><Link href="/nalepke">Spremeni izbor</Link></Button></div></div><form method="get" className="mb-4 flex flex-wrap items-end gap-3 rounded-[6px] border border-[var(--border)] bg-white p-3"><input type="hidden" name="ids" value={ids.join(",")} /><div className="field min-w-48"><label htmlFor="start-position">Začetni položaj</label><Select id="start-position" name="start" defaultValue={String(start)}>{Array.from({ length: 14 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</Select></div><Button type="submit" variant="secondary">Posodobi predogled</Button></form><div className="mb-4 rounded-[6px] border border-[#e2c76f] bg-[#fff9df] p-3 text-sm"><strong>Nastavitve tiskanja:</strong> A4 pokončno, merilo 100 % oziroma dejanska velikost, brez robov ter brez glav in nog. Začetni položaj: {start}.</div>{members.length === 0 && <p role="alert" className="rounded-[6px] border border-[#f0bbb7] bg-[#fff0ef] p-3 text-[var(--danger)]">Izbran ni noben član.</p>}</div><div className={styles.screenScroll}>{sheets.map((sheet, page) => <section className={styles.sheet} aria-label={`List ${page + 1}`} key={page} data-testid="a4-sheet">{sheet.map((member, index) => member ? <div className={styles.cell} key={member.id}><LabelContent member={member} /></div> : <div className={styles.empty} key={`empty-${index}`} aria-hidden="true" />)}</section>)}</div></div>;
}
