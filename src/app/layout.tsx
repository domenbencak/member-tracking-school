import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { publicConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: publicConfig.organizationName, template: `%s | ${publicConfig.organizationName}` },
  description: "Interna aplikacija za evidenco članstva.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sl"><body>{children}<Toaster richColors position="top-right" /></body></html>;
}
