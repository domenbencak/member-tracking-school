import { CreditCard, MailWarning, ShieldCheck, UserRoundX, UsersRound, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardBarList } from "@/components/dashboard-bar-list";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const cards = [
    ["Skupno število članov", data.stats.total, UsersRound], ["Plačana članarina", data.stats.paid, WalletCards],
    ["Neplačana članarina", data.stats.unpaid, CreditCard], ["Brez podatka o članarini", data.stats.unknownFee, UserRoundX],
    ["Vojni veterani", data.stats.veterans, ShieldCheck], ["Člani brez e-pošte", data.stats.noEmail, MailWarning],
    ["Brez številke izkaznice", data.stats.noCard, CreditCard],
  ] as const;
  return <><div className="page-header"><div><h1 className="page-title">Nadzorna plošča</h1><p className="page-description">Pregled aktivnega članstva</p></div></div><section className="stats-grid" aria-label="Povzetek članstva">{cards.map(([label, value, Icon]) => <Card key={label}><div className="mb-3 flex items-center justify-between gap-3 text-[var(--police-blue)]"><span className="text-sm font-semibold text-[var(--text-muted)]">{label}</span><Icon className="size-5" aria-hidden="true" /></div><strong className="text-3xl tabular-nums text-[var(--navy)]">{value}</strong></Card>)}</section><div className="mt-6 grid gap-4 lg:grid-cols-2"><DashboardBarList title="Člani po občinah" items={data.municipalities} /><DashboardBarList title="Člani po pododborih" items={data.subcommittees} /><DashboardBarList title="Plačilo članarine" items={data.fees} /><DashboardBarList title="Starostna porazdelitev" items={data.ages} /></div>{data.stats.total === 0 && <Card className="mt-6 text-center"><h2 className="mt-0 text-lg">Ni podatkov za prikaz</h2><p className="mb-0 text-[var(--text-muted)]">Administrator lahko člane doda ročno ali uvozi iz Excelove datoteke.</p></Card>}</>;
}
