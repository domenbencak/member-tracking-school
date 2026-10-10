"use client";

import { signOut } from "next-auth/react";
import { useActionState, useEffect } from "react";
import { changeOwnPasswordAction } from "@/lib/users/actions";
import { initialActionState } from "@/lib/action-state";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function ChangePasswordForm() { const [state, action] = useActionState(changeOwnPasswordAction, initialActionState); useEffect(() => { if (state.success) { const timer = setTimeout(() => signOut({ callbackUrl: "/prijava" }), 1500); return () => clearTimeout(timer); } }, [state.success]); return <form action={action} className="grid max-w-xl gap-4"><div className="field"><label htmlFor="currentPassword">Trenutno geslo</label><Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" /></div><div className="field"><label htmlFor="newPassword">Novo geslo</label><Input id="newPassword" name="newPassword" type="password" required minLength={12} autoComplete="new-password" /><p className="field-help">Najmanj 12 znakov.</p></div>{state.error && <p role="alert" className="field-error">{state.error}</p>}{state.success && <p role="status" className="text-[var(--success)]">{state.success}</p>}<div><SubmitButton>Spremeni geslo</SubmitButton></div></form>; }
