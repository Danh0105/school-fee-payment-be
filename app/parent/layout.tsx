import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ParentHeader } from "@/features/parent-portal/components/parent-header";

export const metadata: Metadata = {
  title: "Cổng phụ huynh · ICHI SKILL",
  description: "Tra cứu công nợ và thanh toán học phí trực tuyến.",
};

export default function ParentPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef8ee_0%,#f8faf5_32%,#f5f7ef_100%)]">
      <ParentHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="mx-auto max-w-3xl px-6 pb-8 text-center text-xs leading-5 text-slate-500">
        Thông tin thanh toán được bảo vệ theo từng học sinh. Không chia sẻ mã
        định danh hoặc đường dẫn thanh toán cho người khác.
      </footer>
    </div>
  );
}
