"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const [searching, setSearching] = useState(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <div className="relative">{searching ? <LoaderCircle className="pointer-events-none absolute left-3 top-3 size-5 animate-spin text-[var(--police-blue)]" aria-hidden="true" /> : <Search className="pointer-events-none absolute left-3 top-3 size-5 text-[var(--text-muted)]" aria-hidden="true" />}<Input className="pl-10" type="search" name="q" defaultValue={defaultValue} placeholder="Ime, priimek, e-pošta, naslov, izkaznica …" aria-label="Iskanje članov" aria-busy={searching} onChange={(event) => { if (timer.current) clearTimeout(timer.current); setSearching(true); const form = event.currentTarget.form; timer.current = setTimeout(() => form?.requestSubmit(), 450); }} /><span className="sr-only" aria-live="polite">{searching ? "Iskanje poteka" : ""}</span></div>;
}
