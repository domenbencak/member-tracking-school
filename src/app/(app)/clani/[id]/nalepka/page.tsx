import Link from "next/link";
import { notFound } from "next/navigation";
import { LabelContent } from "@/components/label-content";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import styles from "./single-label.module.css";

export default async function SingleLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await db.member.findFirst({ where: { id, deletedAt: null }, select: { firstName: true, surname: true, street: true, postalCode: true, postOffice: true } });
  if (!member) notFound();
  return <div className="single-print-page"><div className="print-controls"><div className="page-header"><div><h1 className="page-title">Nalepka za kuverto</h1><p className="page-description">Predogled nalepke 99,1 × 38,1 mm</p></div><div className="actions"><PrintButton /><Button asChild variant="secondary"><Link href={`/clani/${id}`}>Nazaj</Link></Button></div></div><div className="rounded-[6px] border border-[#e2c76f] bg-[#fff9df] p-3 text-sm"><strong>Nastavitve tiskanja:</strong> merilo 100 % oziroma dejanska velikost, brez robov ter brez glav in nog.</div></div><div className={styles.preview}><div className={styles.label} data-testid="single-label"><LabelContent member={member} /></div></div></div>;
}
