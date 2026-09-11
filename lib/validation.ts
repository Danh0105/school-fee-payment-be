import Decimal from "decimal.js";
import { z } from "zod";

export const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} là bắt buộc`);
export const optionalText = z.string().optional();
export const uuid = (label: string) =>
  z
    .string()
    .min(1, `Vui lòng chọn ${label}`)
    .pipe(z.uuid(`${label} không hợp lệ`));
export const isUuid = (value?: string | null) =>
  z.uuid().safeParse(value).success;
export const moneyString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, "Nhập chuỗi số hợp lệ")
  .refine(
    (value) => new Decimal(value).greaterThan(0),
    "Giá trị phải lớn hơn 0",
  );

export function omitEmpty<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== undefined,
    ),
  ) as T;
}
