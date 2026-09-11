"use client";

import { useState } from "react";
import Decimal from "decimal.js";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  CircleDollarSign,
  CreditCard,
  ReceiptText,
  TrendingUp,
  UserCheck,
  UserMinus,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { useDashboard } from "@/features/dashboard/hooks";
import { useSchools } from "@/features/schools/hooks";
import { formatCurrency } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";

const chartCurrency = (value: string | number) => formatCurrency(String(value));
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [schoolId, setSchoolId] = useState(user?.schoolId ?? "");
  const currentYear = useCurrentAcademicYear(schoolId || undefined);
  const filter = {
    schoolId: schoolId || undefined,
    academicYearId: currentYear.data?.id,
  };
  const dashboard = useDashboard(filter, Boolean(schoolId && currentYear.data));
  const schools = useSchools({ limit: 200 });
  const summary = dashboard.summary.data;
  const cards = [
    {
      label: "Tổng phải thu",
      value: formatCurrency(summary?.totalReceivable),
      icon: CircleDollarSign,
      tone: "bg-[linear-gradient(145deg,#054c3b,#078247)] text-white border-transparent",
    },
    {
      label: "Đã thu",
      value: formatCurrency(summary?.totalPaid),
      icon: Banknote,
      tone: "bg-[linear-gradient(145deg,#155e92,#237fb5)] text-white border-transparent",
    },
    {
      label: "Còn phải thu",
      value: formatCurrency(summary?.totalOutstanding),
      icon: CreditCard,
      tone: "bg-white text-[#123f36]",
    },
    {
      label: "Tỷ lệ thu",
      value: `${summary?.collectionRate ?? 0}%`,
      icon: TrendingUp,
      tone: "bg-[linear-gradient(145deg,#f6d57e,#dfa72f)] text-[#5b4108] border-transparent",
    },
    {
      label: "Đã đóng đủ",
      value: summary?.studentsPaid ?? 0,
      icon: UserCheck,
      tone: "bg-white text-[#123f36]",
    },
    {
      label: "Chưa đóng",
      value: summary?.studentsUnpaid ?? 0,
      icon: UserMinus,
      tone: "bg-white text-[#123f36]",
    },
    {
      label: "Đóng một phần",
      value: summary?.studentsPartial ?? 0,
      icon: UsersRound,
      tone: "bg-white text-[#123f36]",
    },
    {
      label: "Thu hôm nay",
      value: formatCurrency(summary?.amountToday),
      sub: `${summary?.transactionsToday ?? 0} giao dịch`,
      icon: ReceiptText,
      tone: "bg-white text-[#123f36]",
    },
  ];
  const daily =
    dashboard.daily.data?.map((item) => ({
      ...item,
      amountValue: new Decimal(item.amount).toNumber(),
    })) ?? [];
  const monthly =
    dashboard.monthly.data?.map((item) => ({
      ...item,
      amountValue: new Decimal(item.amount).toNumber(),
    })) ?? [];
  const categories = dashboard.categories.data ?? [];
  const pie = summary
    ? [
        {
          name: "Đã thu",
          value: new Decimal(summary.totalPaid).toNumber(),
          color: "#078247",
        },
        {
          name: "Còn nợ",
          value: new Decimal(summary.totalOutstanding).toNumber(),
          color: "#dfa72f",
        },
      ]
    : [];
  return (
    <>
      <PageHeader
        eyebrow={`Xin chào, ${user?.fullName?.split(" ").slice(-1)[0] ?? "bạn"}`}
        title="Bức tranh thu học phí hôm nay"
        description="Dữ liệu được tổng hợp trực tiếp từ công nợ và giao dịch đã ghi nhận."
        actions={
          <div className="flex gap-2">
            {!user?.schoolId && (
              <Select value={schoolId || undefined} onValueChange={setSchoolId}>
                <SelectTrigger className="w-52">
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
              emptyLabel="Chọn trường để xem dữ liệu"
            />
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.summary.isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))
          : cards.map((item) => (
              <Card key={item.label} className={item.tone}>
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p
                      className={`text-xs font-semibold ${item.tone.includes("text-white") ? "text-white/60" : "text-slate-400"}`}
                    >
                      {item.label}
                    </p>
                    <p className="mt-3 font-display text-2xl font-bold tracking-tight">
                      {item.value}
                    </p>
                    {item.sub && (
                      <p className="mt-1 text-xs opacity-60">{item.sub}</p>
                    )}
                  </div>
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${item.tone.includes("bg-white") ? "bg-slate-100 text-teal-700" : "bg-white/12"}`}
                  >
                    <item.icon className="size-5" />
                  </span>
                </CardContent>
              </Card>
            ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu 30 ngày gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {dashboard.daily.isLoading ? (
              <Skeleton className="h-full" />
            ) : daily.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={daily}
                  margin={{ left: 4, right: 10, top: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#237fb5"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="#237fb5"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e8ecea" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `${Math.round(Number(value) / 1_000_000)}tr`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      chartCurrency(String(value)),
                      "Doanh thu",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 30px rgba(15,23,42,.12)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amountValue"
                    stroke="#237fb5"
                    strokeWidth={2.5}
                    fill="url(#revenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu thu</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {dashboard.summary.isLoading ? (
              <Skeleton className="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {pie.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => chartCurrency(String(value))}
                  />
                  <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    className="fill-slate-400 text-xs"
                  >
                    Tỷ lệ thu
                  </text>
                  <text
                    x="50%"
                    y="57%"
                    textAnchor="middle"
                    className="fill-slate-950 text-2xl font-bold"
                  >
                    {summary?.collectionRate ?? 0}%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Doanh thu 12 tháng gần nhất</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {dashboard.monthly.isLoading ? (
            <Skeleton className="h-full" />
          ) : monthly.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthly}
                margin={{ left: 4, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e8ecea" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    `${Math.round(Number(value) / 1_000_000)}tr`
                  }
                />
                <Tooltip
                  formatter={(value) => [
                    chartCurrency(String(value)),
                    "Doanh thu",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 30px rgba(15,23,42,.12)",
                  }}
                />
                <Bar
                  dataKey="amountValue"
                  fill="#d99a41"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </CardContent>
      </Card>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hiệu quả theo lớp</CardTitle>
          </CardHeader>
          <CardContent className="h-[310px]">
            {dashboard.classes.isLoading ? (
              <Skeleton className="h-full" />
            ) : dashboard.classes.data?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboard.classes.data.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid horizontal={false} stroke="#e8ecea" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="className"
                    tick={{ fontSize: 11 }}
                    width={70}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, "Tỷ lệ thu"]} />
                  <Bar
                    dataKey="collectionRate"
                    fill="#078247"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Theo danh mục khoản thu</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.categories.isLoading ? (
              <Skeleton className="h-64" />
            ) : categories.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-right">Đã thu</TableHead>
                    <TableHead className="text-right">Còn nợ</TableHead>
                    <TableHead className="text-right">Tỷ lệ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.slice(0, 7).map((item) => (
                    <TableRow key={item.feeCategoryId}>
                      <TableCell className="font-semibold text-slate-900">
                        {item.feeCategoryName}
                      </TableCell>
                      <TableCell className="text-right text-emerald-700">
                        {formatCurrency(item.totalPaid)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.totalOutstanding)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {item.collectionRate}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
function Empty() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Chưa có dữ liệu trong phạm vi đã chọn.
    </div>
  );
}
