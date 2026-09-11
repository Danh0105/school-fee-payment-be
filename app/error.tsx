"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <CircleAlert className="size-8" />
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-900">
        Không thể tải nội dung
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Đã có lỗi ngoài dự kiến. Vui lòng thử lại hoặc kiểm tra kết nối tới máy
        chủ.
      </p>
      <Button className="mt-6" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}
