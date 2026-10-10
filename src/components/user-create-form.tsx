"use client";

import { useActionState } from "react";
import { createUserAction } from "@/lib/users/actions";
import { initialActionState } from "@/lib/action-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";

export function UserCreateForm() { const [state, action] = useActionState(createUserAction, initialActionState); return <form action={action} className="grid gap-4"><div className="form-grid"><div className="field"><label htmlFor="new-user-email">E-pošta</label><Input id="new-user-email" name="email" type="email" required autoComplete="off" />{state.fieldErrors?.email && <p className="field-error">{state.fieldErrors.email[0]}</p>}</div><div className="field"><label htmlFor="new-user-role">Vloga</label><Select id="new-user-role" name="role" defaultValue="USER"><option value="USER">Uporabnik</option><option value="ADMIN">Administrator</option></Select></div><div className="field field-full"><label htmlFor="new-user-password">Začasno geslo</label><Input id="new-user-password" name="password" type="password" minLength={12} required autoComplete="new-password" /><p className="field-help">Najmanj 12 znakov. Ob prvi prijavi ga mora uporabnik spremeniti.</p>{state.fieldErrors?.password && <p className="field-error">{state.fieldErrors.password[0]}</p>}</div></div>{state.error && <p role="alert" className="field-error">{state.error}</p>}{state.success && <p role="status" className="text-[var(--success)]">{state.success}</p>}<div><SubmitButton>Ustvari uporabnika</SubmitButton></div></form>; }
