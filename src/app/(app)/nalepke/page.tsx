import { Tags } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LabelsPage() { return <><div className="page-header"><div><h1 className="page-title">Nalepke</h1><p className="page-description">Tiskanje kuvertnih nalepk za izbrane člane</p></div></div><Card className="max-w-2xl"><Tags className="mb-3 size-7 text-[var(--police-blue)]" aria-hidden="true" /><h2 className="mt-0 text-xl text-[var(--navy)]">Izberite člane v seznamu</h2><p>V seznamu članov označite prejemnike. Izbor se ohrani med stranmi in lahko vsebuje največ 140 članov.</p><div className="actions"><Button asChild><Link href="/clani">Odpri seznam članov</Link></Button><Button asChild variant="secondary"><Link href="/nalepke/a4?start=1">Odpri prazen predogled</Link></Button></div></Card></>; }
