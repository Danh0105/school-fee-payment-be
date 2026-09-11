import Decimal from "decimal.js";
import { format, isValid, parseISO } from "date-fns";

const vnd = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  try {
    const integer = new Decimal(value)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toFixed(0);
    return vnd.format(BigInt(integer));
  } catch {
    return value;
  }
}

export function formatDate(
  value: string | null | undefined,
  withTime = false,
): string {
  if (!value) return "—";
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
}

export function shortId(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}
