export type Role =
  "SUPER_ADMIN" | "ADMIN" | "ACCOUNTANT" | "CASHIER" | "VIEWER";

export type SortOrder = "ASC" | "DESC";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  schoolId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  [key: string]: string | number | undefined;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface School extends BaseEntity {
  companyId: string | null;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  taxCode: string | null;
  managerInfo: string | null;
  salesRepresentative: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface AcademicYear extends BaseEntity {
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
}

export interface Semester extends BaseEntity {
  academicYearId: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
}

export interface SchoolClass extends BaseEntity {
  schoolId: string;
  academicYearId: string;
  code: string;
  name: string;
  grade: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface Student extends BaseEntity {
  schoolId: string;
  studentCode: string;
  identifierCode: string | null;
  fullName: string;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  address: string | null;
  phone: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "TRANSFERRED";
}

export interface ParentSchoolOption {
  id: string;
  name: string;
  code: string;
}

export interface ParentStudentSummary {
  id: string;
  schoolId: string;
  school?: Pick<School, "id" | "name">;
  studentCode: string;
  fullName: string;
  dateOfBirth: string | null;
  parentName: string | null;
  parentPhone: string | null;
  status: Student["status"];
}

export interface ParentAccessResponse {
  accessToken: string;
  student: ParentStudentSummary;
}

export interface FeeCategory extends BaseEntity {
  schoolId: string;
  code: string;
  name: string;
  description: string | null;
  accountingCode: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface FeePlan extends BaseEntity {
  schoolId: string;
  academicYearId: string;
  semesterId: string | null;
  feeCategoryId: string;
  feeCategory?: FeeCategory;
  code: string;
  name: string;
  description: string | null;
  billingType: "ONE_TIME" | "MONTHLY" | "CUSTOM";
  unitPrice: string;
  quantity: string;
  defaultAmount: string;
  startDate: string | null;
  dueDate: string | null;
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "CANCELLED";
}

export type ReceivableStatus =
  "DRAFT" | "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";

export interface Receivable extends BaseEntity {
  schoolId: string;
  studentId: string;
  student?: Student;
  academicYearId: string;
  semesterId: string | null;
  feePlanId: string;
  feePlan?: FeePlan;
  receivableCode: string;
  description: string | null;
  quantity: string;
  unitPrice: string;
  originalAmount: string;
  discountAmount: string;
  adjustmentAmount: string;
  amountDue: string;
  amountPaid: string;
  amountOutstanding: string;
  dueDate: string | null;
  status: ReceivableStatus;
}

export interface Discount extends BaseEntity {
  studentId: string;
  receivableId: string;
  type: "FIXED_AMOUNT" | "PERCENTAGE";
  value: string;
  amount: string;
  reason: string;
  approvedAt: string | null;
}

export interface Adjustment extends BaseEntity {
  receivableId: string;
  adjustmentCode: string;
  type: "INCREASE" | "DECREASE";
  amount: string;
  reason: string;
  status: "DRAFT" | "APPROVED" | "CANCELLED";
  approvedAt: string | null;
}

export interface LedgerEntry {
  id: string;
  postingDate: string;
  entryType: string;
  description: string;
  referenceType: string;
  referenceId: string;
  debitAmount: string;
  creditAmount: string;
  balance: string;
}

export interface StudentLedger {
  studentId: string;
  entries: LedgerEntry[];
  closingBalance: string;
}

export interface StudentCredit extends BaseEntity {
  schoolId: string;
  studentId: string;
  sourcePaymentTransactionId: string;
  amount: string;
  remainingAmount: string;
  status: "AVAILABLE" | "HELD" | "REFUNDED" | "ALLOCATED";
  note: string | null;
}

export interface StudentCredits {
  credits: StudentCredit[];
  availableBalance: string;
}

export type PaymentMethod =
  | "BANK_TRANSFER"
  | "VIETQR"
  | "VIETINBANK"
  | "CASH"
  | "OTHER";
export type PaymentOrderStatus =
  "PENDING" | "PAID" | "PARTIALLY_PAID" | "EXPIRED" | "CANCELLED" | "FAILED";

export interface PaymentOrderItem extends BaseEntity {
  paymentOrderId: string;
  receivableId: string;
  receivable?: Receivable;
  requestedAmount: string;
}

export interface PaymentOrder extends BaseEntity {
  schoolId: string;
  studentId: string;
  student?: Student;
  orderCode: string;
  requestedAmount: string;
  status: PaymentOrderStatus;
  paymentMethod: PaymentMethod;
  bankCode: string | null;
  bankAccountNumber: string | null;
  transferContent: string;
  qrPayload: string | null;
  qrUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  items: PaymentOrderItem[];
}

export interface PaymentOrderQr {
  qrPayload: string | null;
  qrUrl: string | null;
  expiresAt: string | null;
  status: PaymentOrderStatus;
}

export type PaymentTransactionStatus =
  "RECEIVED" | "MATCHED" | "UNMATCHED" | "ALLOCATED" | "REVERSED";

export interface PaymentTransaction extends BaseEntity {
  schoolId: string;
  provider: "VIETQR" | "MANUAL_BANK";
  externalTransactionId: string;
  bankTransactionId: string | null;
  bankCode: string | null;
  bankAccountNumber: string | null;
  amount: string;
  transferContent: string | null;
  transactionTime: string;
  status: PaymentTransactionStatus;
}

export interface Reconciliation extends BaseEntity {
  paymentTransactionId: string;
  paymentTransaction: PaymentTransaction;
  paymentOrderId: string | null;
  paymentOrder?: PaymentOrder | null;
  status: string;
  note: string | null;
  matchedAt: string | null;
}

export interface ReceiptItem extends BaseEntity {
  description: string;
  amount: string;
  receivableId: string | null;
}

export interface Receipt extends BaseEntity {
  schoolId: string;
  studentId: string;
  student?: Student;
  receiptNumber: string;
  paymentTransactionId: string | null;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  payerName: string | null;
  payerPhone: string | null;
  description: string | null;
  status: "ISSUED" | "CANCELLED";
  issuedAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  items?: ReceiptItem[];
}

export interface Refund extends BaseEntity {
  refundCode: string;
  studentId: string;
  paymentTransactionId: string;
  receiptId: string | null;
  amount: string;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "COMPLETED" | "REJECTED" | "CANCELLED";
}

export interface ImportRowError {
  sheet: string;
  row: number;
  column: string;
  field: string;
  value: unknown;
  message: string;
}

export interface ImportPreview {
  importSessionId: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ImportRowError[];
}

export interface ImportResult {
  studentsCreated: number;
  studentsMatched: number;
  receivablesCreated: number;
  receivablesSkipped: number;
}

export interface DashboardSummary {
  totalReceivable: string;
  totalPaid: string;
  totalOutstanding: string;
  collectionRate: number;
  studentsPaid: number;
  studentsUnpaid: number;
  studentsPartial: number;
  transactionsToday: number;
  amountToday: string;
}

export interface RevenueDay {
  date: string;
  amount: string;
  transactions: number;
}

export interface RevenueMonth {
  month: string;
  amount: string;
  transactions: number;
}

export interface DashboardBreakdown {
  classId?: string;
  className?: string;
  feeCategoryId?: string;
  feeCategoryName?: string;
  totalDue: string;
  totalPaid: string;
  totalOutstanding: string;
  collectionRate: number;
}

export interface ReceivablesReportSummary {
  totalReceivable: string;
  totalDiscount: string;
  totalAdjustmentIncrease: string;
  totalAdjustmentDecrease: string;
  totalDue: string;
  totalPaid: string;
  totalOutstanding: string;
  studentsPaid: number;
  studentsUnpaid: number;
  studentsPartial: number;
  collectionRate: number;
}

export interface ReceivablesReport extends PaginatedResult<Receivable> {
  summary: ReceivablesReportSummary;
}

export interface ClassReportRow {
  studentId: string;
  studentCode: string;
  fullName: string;
  amountDue: string;
  amountPaid: string;
  amountOutstanding: string;
  status: ReceivableStatus;
}

export interface ClassReport {
  classId: string;
  className: string;
  studentCount: number;
  totalDue: string;
  totalPaid: string;
  totalOutstanding: string;
  collectionRate: number;
  students: ClassReportRow[];
}

export interface AuditLog extends BaseEntity {
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
}
