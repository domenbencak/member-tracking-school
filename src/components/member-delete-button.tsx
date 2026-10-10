"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { archiveMemberAction } from "@/lib/members/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MemberDeleteButton({ id, fullName }: { id: string; fullName: string }) {
  const [confirmation, setConfirmation] = useState(""); const [pending, startTransition] = useTransition(); const router = useRouter();
  return <AlertDialog.Root><AlertDialog.Trigger asChild><Button variant="danger"><Trash2 className="size-4" aria-hidden="true" />Izbriši</Button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/50" /><AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white p-6 shadow-xl"><AlertDialog.Title className="m-0 text-xl text-[var(--navy)]">Arhiviraj člana</AlertDialog.Title><AlertDialog.Description className="mt-2 text-[var(--text-muted)]">Za potrditev vnesite polno ime <strong>{fullName}</strong>. Člana bo mogoče obnoviti v arhivu.</AlertDialog.Description><div className="field mt-4"><label htmlFor="delete-confirmation">Polno ime</label><Input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoFocus /></div><div className="actions mt-5 justify-end"><AlertDialog.Cancel asChild><Button variant="secondary">Prekliči</Button></AlertDialog.Cancel><Button variant="danger" disabled={pending || confirmation.trim().toLocaleLowerCase("sl-SI") !== fullName.toLocaleLowerCase("sl-SI")} onClick={() => startTransition(async () => { try { await archiveMemberAction(id, confirmation); toast.success("Član je arhiviran."); router.push("/clani"); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Brisanje ni uspelo."); } })}>{pending ? "Arhiviram …" : "Potrdi brisanje"}</Button></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root>;
}
