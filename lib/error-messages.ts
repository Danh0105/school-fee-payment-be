const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.",
  UNAUTHORIZED: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống.",
  NOT_FOUND: "Không tìm thấy dữ liệu.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  INVALID_REFRESH_TOKEN: "Phiên đăng nhập đã hết hạn.",
  USER_NOT_FOUND: "Không tìm thấy người dùng.",
  USER_INACTIVE: "Tài khoản đã bị vô hiệu hóa.",
  EMAIL_ALREADY_EXISTS: "Email này đã tồn tại.",
  COMPANY_NOT_FOUND: "Không tìm thấy công ty.",
  COMPANY_CODE_EXISTS: "Mã công ty đã tồn tại.",
  SCHOOL_NOT_FOUND: "Không tìm thấy trường học.",
  SCHOOL_CODE_EXISTS: "Mã trường đã tồn tại.",
  SCHOOL_OUT_OF_SCOPE: "Bạn không có quyền truy cập trường học này.",
  ACADEMIC_YEAR_NOT_FOUND: "Không tìm thấy năm học.",
  SEMESTER_NOT_FOUND: "Không tìm thấy học kỳ.",
  CLASS_NOT_FOUND: "Không tìm thấy lớp học.",
  CLASS_CODE_EXISTS: "Mã lớp đã tồn tại.",
  STUDENT_NOT_FOUND: "Không tìm thấy học sinh.",
  STUDENT_IDENTIFIER_NOT_FOUND: "Không tìm thấy học sinh với mã định danh này.",
  STUDENT_CODE_EXISTS: "Mã học sinh đã tồn tại.",
  FEE_CATEGORY_NOT_FOUND: "Không tìm thấy danh mục khoản thu.",
  FEE_PLAN_NOT_FOUND: "Không tìm thấy khoản thu.",
  FEE_PLAN_NOT_ACTIVE: "Khoản thu chưa được kích hoạt.",
  RECEIVABLE_NOT_FOUND: "Không tìm thấy khoản công nợ.",
  RECEIVABLE_ALREADY_PAID: "Khoản công nợ đã được thanh toán đủ.",
  RECEIVABLE_CANCELLED: "Khoản công nợ đã bị hủy.",
  DISCOUNT_INVALID: "Thông tin miễn giảm không hợp lệ.",
  ADJUSTMENT_NOT_FOUND: "Không tìm thấy chứng từ điều chỉnh.",
  PAYMENT_ORDER_NOT_FOUND: "Không tìm thấy yêu cầu thanh toán.",
  PAYMENT_ORDER_EXPIRED: "Yêu cầu thanh toán đã hết hạn.",
  PAYMENT_ORDER_NOT_PENDING: "Yêu cầu thanh toán không còn chờ xử lý.",
  TRANSACTION_DUPLICATED: "Giao dịch đã được ghi nhận trước đó.",
  TRANSACTION_NOT_FOUND: "Không tìm thấy giao dịch.",
  TRANSACTION_ALREADY_ALLOCATED: "Giao dịch đã được phân bổ toàn bộ.",
  TRANSACTION_ALREADY_MATCHED: "Giao dịch đã được đối soát.",
  TRANSACTION_REVERSED: "Giao dịch đã bị đảo.",
  PAYMENT_AMOUNT_INVALID: "Số tiền thanh toán không hợp lệ.",
  PAYMENT_AMOUNT_EXCEEDS_AVAILABLE: "Số tiền vượt quá giá trị khả dụng.",
  RECEIPT_NOT_FOUND: "Không tìm thấy phiếu thu.",
  RECEIPT_ALREADY_CANCELLED: "Phiếu thu đã bị hủy.",
  REFUND_NOT_FOUND: "Không tìm thấy yêu cầu hoàn tiền.",
  REFUND_AMOUNT_INVALID: "Số tiền hoàn không hợp lệ.",
  STUDENT_CREDIT_INSUFFICIENT: "Số dư có của học sinh không đủ.",
  IMPORT_VALIDATION_FAILED: "Dữ liệu import chưa hợp lệ.",
  IMPORT_SESSION_NOT_FOUND: "Không tìm thấy phiên import.",
};

export class ApiError extends Error {
  /** The backend's own message, before it is replaced by the code's text. */
  public readonly serverMessage: string;

  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(ERROR_MESSAGES[code] ?? message);
    this.name = "ApiError";
    this.serverMessage = message;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}
