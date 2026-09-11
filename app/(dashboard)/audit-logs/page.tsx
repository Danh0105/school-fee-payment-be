"use client";

import { useState } from "react";
import { z } from "zod";
import { DataTable, type DataColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { JsonChangeCell } from "@/features/audit-logs/components/json-change-cell";
import { useAuditLogs } from "@/features/audit-logs/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { formatDate, shortId } from "@/lib/format";
import type { AuditLog } from "@/lib/types";

export default function AuditLogsPage() {
  const table = useDataTable("createdAt");
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [userId, setUserId] = useState("");
  const validUserId = z.uuid().safeParse(userId).success ? userId : undefined;
  const result = useAuditLogs({
    ...table.query,
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    userId: validUserId,
  });
  const columns: DataColumn<AuditLog>[] = [
    {
      key: "createdAt",
      header: "Thời gian",
      sortable: true,
      render: (row) => formatDate(row.createdAt, true),
    },
    {
      key: "action",
      header: "Hành động",
      render: (row) => (
        <Badge
          variant={
            row.action.includes("DELETE") ||
            row.action.includes("CANCEL") ||
            row.action.includes("UNMATCH")
              ? "destructive"
              : "secondary"
          }
        >
          {row.action}
        </Badge>
      ),
    },
    {
      key: "entityType",
      header: "Đối tượng",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.entityType}</p>
          <p
            className="font-mono text-xs text-slate-400"
            title={row.entityId ?? undefined}
          >
            {shortId(row.entityId)}
          </p>
        </div>
      ),
    },
    {
      key: "userId",
      header: "Người thực hiện",
      render: (row) => (
        <span className="font-mono text-xs" title={row.userId ?? undefined}>
          {shortId(row.userId)}
        </span>
      ),
    },
    {
      key: "changes",
      header: "Dữ liệu thay đổi",
      render: (row) => (
        <JsonChangeCell oldData={row.oldData} newData={row.newData} />
      ),
    },
    { key: "ipAddress", header: "IP", render: (row) => row.ipAddress || "—" },
  ];
  const filters = (
    <div className="flex flex-wrap gap-2">
      <Input
        value={entityType}
        onChange={(event) => setEntityType(event.target.value)}
        placeholder="Loại đối tượng"
        className="w-40"
      />
      <Input
        value={entityId}
        onChange={(event) => setEntityId(event.target.value)}
        placeholder="Entity ID"
        className="w-44 font-mono text-xs"
      />
      <div>
        <Input
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="User UUID"
          className="w-44 font-mono text-xs"
        />
        {userId && !validUserId && (
          <p className="mt-1 text-[10px] text-amber-600">Chưa đủ UUID</p>
        )}
      </div>
    </div>
  );
  return (
    <>
      <PageHeader
        eyebrow="Kiểm soát nội bộ"
        title="Nhật ký hệ thống"
        description="Tra cứu dấu vết thay đổi dữ liệu và các nghiệp vụ tài chính quan trọng."
      />
      <DataTable
        columns={columns}
        data={result.data?.data}
        meta={result.data?.meta}
        loading={result.isLoading}
        getRowKey={(row) => row.id}
        {...table}
        onSearch={table.setSearch}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        onSort={table.toggleSort}
        filters={filters}
      />
    </>
  );
}
