"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { restoreMemberAction } from "@/lib/members/actions";
import { Button } from "@/components/ui/button";

export function RestoreMemberButton({ id }: { id: string }) { const [pending, startTransition] = useTransition(); const router = useRouter(); return <Button disabled={pending} variant="secondary" onClick={() => startTransition(async () => { try { await restoreMemberAction(id); toast.success("Član je obnovljen."); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Obnovitev ni uspela."); } })}><RotateCcw className="size-4" />{pending ? "Obnavljam …" : "Obnovi"}</Button>; }
