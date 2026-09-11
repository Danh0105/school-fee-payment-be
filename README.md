# ICHI SKILL Finance — Quản lý thu tiền học sinh

Frontend quản trị cho hệ thống công nợ, thanh toán QR động, đối soát và báo cáo học phí. Ứng dụng dùng Next.js App Router, TypeScript strict, Tailwind CSS, các primitive shadcn/ui, TanStack Query, React Hook Form + Zod, Zustand và Axios.

## Chạy dự án

Yêu cầu Node.js 20.9 trở lên và backend đang chạy tại `F:\school-fee-payment-be`.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Swagger của backend ở `http://localhost:3010/api/docs`.

Tạo `.env.local` nếu backend không dùng địa chỉ mặc định:

```env
NEXT_PUBLIC_API_URL=http://localhost:3010
```

## Tài khoản kiểm thử

| Vai trò     | Email                   | Mật khẩu        |
| ----------- | ----------------------- | --------------- |
| SUPER_ADMIN | `admin@kimdong.edu.vn`  | `Admin@123456`  |
| ACCOUNTANT  | `ketoan@kimdong.edu.vn` | `KeToan@123456` |
| CASHIER     | `thuquy@kimdong.edu.vn` | `ThuQuy@123456` |

## Kiểm tra chất lượng

```bash
npm run lint
npm run build
```

## Ghi chú kiến trúc

- Tất cả request đi qua `lib/api-client.ts`: tự gắn Bearer token, unwrap response envelope, chỉ refresh một lần khi nhiều request đồng thời nhận 401 và đưa lỗi về `ApiError` thống nhất.
- API và React Query hooks được chia theo module trong `features/`; query key được tập trung ở `lib/query-keys.ts`.
- Tiền được giữ dưới dạng chuỗi decimal. `decimal.js` xử lý và làm tròn trước khi `Intl.NumberFormat` định dạng VND, tránh phép toán float thông thường.
- `proxy.ts` chỉ kiểm tra cookie đánh dấu phiên để chuyển hướng sớm. `AuthGuard` phía client xác thực state đã lưu, còn backend luôn là lớp phân quyền cuối cùng.
- Backend hiện không có API liệt kê Payment Order. Vì vậy thao tác khớp thủ công yêu cầu nhập UUID của Payment Order thay vì gọi một endpoint không tồn tại.
- Bản backend hiện tại khai báo hai DTO `@Query()` riêng trên `GET /reports/receivables` trong khi bật `forbidNonWhitelisted`; vì vậy mọi query filter/pagination đều bị trả `VALIDATION_ERROR`. Frontend ưu tiên endpoint báo cáo chính và tự động dùng `/receivables` để tổng hợp bằng `decimal.js` khi phát hiện đúng lỗi tương thích này. Khi controller backend được gộp thành một DTO query, frontend sẽ tự dùng lại endpoint chính.

## Lưu trữ token

Ứng dụng hiện là SPA client-side nên lưu access token và refresh token trong `localStorage` để Axios có thể refresh trực tiếp. Cách này đơn giản cho môi trường quản trị nội bộ nhưng token có thể bị đọc nếu xảy ra XSS. Khi triển khai production, nên chuyển refresh token sang cookie `httpOnly`, `Secure`, `SameSite` thông qua BFF/Route Handler; đồng thời áp dụng CSP chặt chẽ. Cookie `school_fee_session` hiện tại chỉ là cờ điều hướng, không chứa token hay dữ liệu nhạy cảm.

## Lỗi hydration do tiện ích trình duyệt

Một số extension chèn thuộc tính như `inmaintabuse` vào `<body>` trước khi React hydrate. Root layout dùng `suppressHydrationWarning` ở đúng nút này để bỏ cảnh báo thuộc tính bên ngoài; ứng dụng không phụ thuộc vào thuộc tính đó.
