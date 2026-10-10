"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Member } from "@/generated/prisma/client";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { memberStatusOptions, type MemberStatusValue } from "@/lib/members/status";
import { dateInputValueInSlovenia } from "@/lib/utils";

type MemberAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

const fields = [
  ["sequenceNumber", "Zap. št.", "number"], ["membershipCardNumber", "Št. izkaznice", "text"],
  ["surname", "Priimek", "text"], ["firstName", "Ime", "text"], ["dateOfBirth", "Rojstni datum", "date"],
  ["street", "Ulica", "text"], ["settlement", "Naselje", "text"], ["postalCode", "Poštna številka", "text"],
  ["postOffice", "Pošta", "text"], ["email", "E-pošta", "email"], ["municipality", "Občina", "text"],
  ["subcommittee", "Pododbor", "text"], ["vpo", "VPO", "text"],
] as const;

function valueOf(member: Member | null, field: keyof Member) {
  const value = member?.[field];
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value === null || value === undefined ? "" : String(value);
}

export function MemberForm({ member, action }: { member: Member | null; action: MemberAction }) {
  const [state, formAction] = useActionState(action, initialActionState);
  const initialStatus = member?.memberStatus ?? "OTHER";
  const initialStatusDate = member ? valueOf(member, "statusChangedAt") : dateInputValueInSlovenia();
  const [memberStatus, setMemberStatus] = useState<MemberStatusValue>(initialStatus);
  const [statusChangedAt, setStatusChangedAt] = useState(initialStatusDate);
  const [statusChangedAtExplicit, setStatusChangedAtExplicit] = useState(false);
  return <form action={formAction} className="grid gap-6" noValidate>
    {state.error && <div role="alert" className="rounded-[6px] border border-[#f2b8b5] bg-[#fff1f0] p-3 text-[var(--danger)]">{state.error}</div>}
    <div className="form-grid">{fields.map(([name, label, type]) => <div className="field" key={name}><label htmlFor={name}>{label}{["surname", "firstName"].includes(name) && " *"}</label><Input id={name} name={name} type={type} defaultValue={valueOf(member, name)} required={["surname", "firstName"].includes(name)} min={type === "number" ? 1 : undefined} /><FieldError errors={state.fieldErrors?.[name]} /></div>)}
      <div className="field"><label htmlFor="membershipFeePaid">Plačilo članarine</label><Select id="membershipFeePaid" name="membershipFeePaid" defaultValue={member?.membershipFeePaid === null || !member ? "UNKNOWN" : String(member.membershipFeePaid)}><option value="UNKNOWN">Ni podatka</option><option value="true">Da</option><option value="false">Ne</option></Select></div>
      <div className="field"><label htmlFor="warVeteranStatus">Status vojnega veterana</label><Select id="warVeteranStatus" name="warVeteranStatus" defaultValue={member?.warVeteranStatus === null || !member ? "UNKNOWN" : String(member.warVeteranStatus)}><option value="UNKNOWN">Ni podatka</option><option value="true">Da</option><option value="false">Ne</option></Select></div>
      <div className="field"><label htmlFor="memberStatus">Status člana *</label><Select id="memberStatus" name="memberStatus" value={memberStatus} required onChange={(event) => { const nextStatus = event.target.value as MemberStatusValue; setMemberStatus(nextStatus); setStatusChangedAt(nextStatus === initialStatus ? initialStatusDate : dateInputValueInSlovenia()); setStatusChangedAtExplicit(false); }}>{memberStatusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</Select><FieldError errors={state.fieldErrors?.memberStatus} /></div>
      <div className="field"><label htmlFor="statusChangedAt">Datum spremembe statusa</label><Input id="statusChangedAt" name="statusChangedAt" type="date" value={statusChangedAt} onChange={(event) => { setStatusChangedAt(event.target.value); setStatusChangedAtExplicit(true); }} aria-describedby="statusChangedAt-help" /><input type="hidden" name="statusChangedAtExplicit" value={String(statusChangedAtExplicit)} /><p id="statusChangedAt-help" className="field-help">Ob spremembi statusa se samodejno nastavi današnji datum; po potrebi ga lahko popravite.</p><FieldError errors={state.fieldErrors?.statusChangedAt} /></div>
      <div className="field field-full"><label htmlFor="notes">Opombe</label><Textarea id="notes" name="notes" rows={5} maxLength={5_000} defaultValue={valueOf(member, "notes")} aria-describedby="notes-help" /><p id="notes-help" className="field-help">Največ 5.000 znakov.</p><FieldError errors={state.fieldErrors?.notes} /></div>
      <label className="field-full flex items-start gap-3 rounded-[6px] border border-[var(--border)] bg-[#f8fafb] p-3"><input className="mt-1 size-5" type="checkbox" name="postalOverride" /><span><strong>Dovoli nestandardno poštno številko</strong><span className="block text-sm text-[var(--text-muted)]">Potrdite le, če poštna številka namerno ni sestavljena iz štirih števk.</span></span></label>
    </div>
    <div className="actions"><SubmitButton /><Button asChild variant="secondary"><Link href={member ? `/clani/${member.id}` : "/clani"}>Prekliči</Link></Button></div>
  </form>;
}

function FieldError({ errors }: { errors?: string[] }) { return errors?.length ? <p className="field-error" role="alert">{errors[0]}</p> : null; }
