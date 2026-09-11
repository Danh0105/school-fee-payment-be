import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f8f5] px-6 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <SearchX className="size-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-slate-900">
        Không tìm thấy trang
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Đường dẫn bạn mở không tồn tại hoặc đã được thay đổi.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Về trang tổng quan</Link>
      </Button>
    </main>
  );
}
