"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { useClasses } from "@/features/classes/hooks";
import { useSchools } from "@/features/schools/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function ClassReportsIndexPage() {
  const [classId, setClassId] = useState("");
  const router = useRouter();
  const userSchoolId = useAuthStore((state) => state.user?.schoolId) ?? "";
  const [schoolId, setSchoolId] = useState(userSchoolId);
  const currentYear = useCurrentAcademicYear(schoolId || undefined);
  const ready = Boolean(schoolId && currentYear.data);
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const classes = useClasses(
    {
      limit: 200,
      schoolId: schoolId || undefined,
      academicYearId: currentYear.data?.id,
      sortBy: "name",
      sortOrder: "ASC",
    },
    ready,
  );
  return (
    <>
      <PageHeader
        eyebrow="Báo cáo"
        title="Báo cáo theo lớp"
        description="Chọn lớp để xem sĩ số, tổng công nợ và tiến độ thu của từng học sinh."
        actions={
          <>
            {!userSchoolId && (
              <Select
                value={schoolId || undefined}
                onValueChange={(value) => {
                  setSchoolId(value);
                  setClassId("");
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn trường" />
                </SelectTrigger>
                <SelectContent>
                  {schools.data?.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <CurrentAcademicYearBadge
              name={currentYear.data?.name}
              loading={currentYear.isLoading}
              error={currentYear.error}
            />
          </>
        }
      />
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-teal-700" />
            Chọn lớp cần xem
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={classId || undefined}
            onValueChange={setClassId}
            disabled={!ready || classes.isLoading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Chọn một lớp học" />
            </SelectTrigger>
            <SelectContent>
              {classes.data?.data.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} · Khối {item.grade ?? "—"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!classId}
            onClick={() => router.push(`/reports/classes/${classId}`)}
          >
            Xem báo cáo
            <ArrowRight />
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
