import { Archive, FileClock, FileUp, Gauge, History, KeyRound, Menu, Shield, Tags, UserRoundCog, UsersRound } from "lucide-react";
import Link from "next/link";
import type { AuthenticatedUser } from "@/lib/auth/authorization";
import { publicConfig } from "@/lib/config";
import { sl } from "@/lib/i18n/sl";
import { SignOutButton } from "@/components/sign-out-button";

const primaryLinks = [
  { href: "/", label: sl.navigation.dashboard, icon: Gauge },
  { href: "/clani", label: sl.navigation.members, icon: UsersRound },
  { href: "/nalepke", label: sl.navigation.labels, icon: Tags },
];
const adminLinks = [
  { href: "/uvoz", label: sl.navigation.importData, icon: FileUp },
  { href: "/uvozi", label: sl.navigation.importHistory, icon: FileClock },
  { href: "/clani/arhiv", label: sl.navigation.memberArchive, icon: Archive },
  { href: "/uporabniki", label: sl.navigation.users, icon: UserRoundCog },
  { href: "/revizijska-sled", label: sl.navigation.auditLog, icon: History },
];

function Navigation({ user }: { user: AuthenticatedUser }) {
  const links = user.role === "ADMIN" ? [...primaryLinks, ...adminLinks] : primaryLinks;
  return <nav aria-label={sl.navigation.main}><ul className="nav-list">{links.map(({ href, label, icon: Icon }) => <li key={href}><Link className="nav-link" href={href}><Icon className="size-5 shrink-0" aria-hidden="true" /><span>{label}</span></Link></li>)}</ul></nav>;
}

export function AppShell({ user, children }: { user: AuthenticatedUser; children: React.ReactNode }) {
  return <div className="app-grid">
    <a className="skip-link" href="#main-content">{sl.navigation.skipToContent}</a>
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="brand-mark"><Shield className="size-6" aria-hidden="true" /></span><span>{publicConfig.organizationName}</span></Link>
      <Navigation user={user} />
    </aside>
    <div className="app-main">
      <header className="topbar">
        <details className="mobile-nav"><summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold"><Menu className="size-5" aria-hidden="true" />{sl.navigation.menu}</summary><Navigation user={user} /></details>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2 text-sm"><span>{user.email}</span>{user.role === "ADMIN" && <span className="font-semibold text-[var(--police-blue)]">{sl.roles.administrator}</span>}<Link className="inline-flex min-h-11 items-center gap-2 px-2" href="/racun/geslo"><KeyRound className="size-4" aria-hidden="true" />{sl.navigation.password}</Link><SignOutButton /></div>
      </header>
      <main id="main-content" className="page">{children}</main>
      <footer className="footer"><Link className="underline" href="/zasebnost">{sl.navigation.privacy}</Link><span aria-hidden="true"> · </span>{sl.footer.disclaimer}</footer>
    </div>
  </div>;
}
