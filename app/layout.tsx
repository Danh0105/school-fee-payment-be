import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProvider } from "@/providers/app-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ICHI SKILL · Quản lý học phí",
  description: "Hệ thống quản lý công nợ và thanh toán học phí ICHI SKILL",
  icons: { icon: "/ichi-skill-logo.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
