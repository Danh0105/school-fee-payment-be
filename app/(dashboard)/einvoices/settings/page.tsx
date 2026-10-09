"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EInvoiceConfigForm } from "@/features/einvoices/components/einvoice-config-form";
import {
  useEInvoiceConfig,
  useEInvoiceProviderStatus,
} from "@/features/einvoices/hooks";
import { useSchools } from "@/features/schools/hooks";
import { can, PERMISSIONS } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

export default function EInvoiceSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [pickedSchoolId, setPickedSchoolId] = useState("");
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const schoolId = user?.schoolId ?? pickedSchoolId;
  const config = useEInvoiceConfig(schoolId);
  const provider = useEInvoiceProviderStatus();
  const canEdit = can(user?.role, PERMISSIONS.accounting);

  return (
    <>
      <PageHeader
        eyebrow="Hóa đơn điện tử"
        title="Cấu hình Viettel S-Invoice"
        description="Mẫu số, ký hiệu và thuế suất dùng khi phát hành hóa đơn học phí của từng trường."
        actions={
          <Button variant="outline" asChild>
            <Link href="/einvoices">
              <ArrowLeft />
              Danh sách hóa đơn
            </Link>
          </Button>
        }
      />
      {provider.data && !provider.data.enabled && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#dfa72f]/30 bg-[#fff6df] p-4 text-sm text-[#7a5406]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Tích hợp Viettel S-Invoice đang tắt trên máy chủ. Cấu hình vẫn lưu
            được, nhưng chưa phát hành hóa đơn cho tới khi tích hợp được bật.
          </p>
        </div>
      )}
      <Card className="max-w-4xl">
        <CardContent className="space-y-6 p-6">
          {!user?.schoolId && (
            <div className="max-w-sm space-y-2">
              <Label>Trường học</Label>
              <Select value={pickedSchoolId} onValueChange={setPickedSchoolId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trường để cấu hình…" />
                </SelectTrigger>
                <SelectContent>
                  {schools.data?.data.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {!schoolId ? (
            <p className="text-sm text-slate-500">
              Chọn một trường để xem và chỉnh cấu hình hóa đơn điện tử.
            </p>
          ) : config.isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : config.isError ? (
            <p className="text-sm text-rose-600">
              Không tải được cấu hình hóa đơn điện tử của trường.
            </p>
          ) : (
            <EInvoiceConfigForm
              key={`${schoolId}:${config.data?.updatedAt ?? "new"}`}
              schoolId={schoolId}
              config={config.data ?? null}
              canEdit={canEdit}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
