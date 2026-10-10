"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/prijava" })}><LogOut className="size-4" aria-hidden="true" />Odjava</Button>;
}
