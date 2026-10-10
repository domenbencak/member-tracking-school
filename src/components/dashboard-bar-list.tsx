export function DashboardBarList({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  if (!items.some((item) => item.value > 0)) return null;
  const max = Math.max(...items.map((item) => item.value), 1);
  return <section className="rounded-[6px] border border-[var(--border)] bg-white p-5" aria-labelledby={`chart-${title}`}><h2 id={`chart-${title}`} className="m-0 mb-4 text-lg text-[var(--navy)]">{title}</h2><ol className="m-0 grid list-none gap-3 p-0">{items.map((item) => <li key={item.label}><div className="mb-1 flex justify-between gap-3 text-sm"><span>{item.label}</span><strong className="tabular-nums">{item.value}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#e2e9ee]" aria-hidden="true"><div className="h-full bg-[var(--police-blue)]" style={{ width: `${(item.value / max) * 100}%` }} /></div></li>)}</ol></section>;
}
