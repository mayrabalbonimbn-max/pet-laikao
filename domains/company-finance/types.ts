export type FinancialDirection = "inflow" | "outflow";
export type FinancialEntryType =
  | "income"
  | "fixed_expense"
  | "variable_expense"
  | "inventory_purchase"
  | "service_receipt"
  | "withdrawal"
  | "other";
export type FinancialEntryStatus = "pending" | "paid" | "cancelled";
export type FinancialPaymentMethod = "pix" | "credit_card" | "debit_card" | "cash" | "bank_transfer" | "other";

export type FinancialCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  direction: FinancialDirection;
  description?: string;
  active: boolean;
};

export type FinancialEntryRecord = {
  id: string;
  categoryId: string;
  categoryName: string;
  direction: FinancialDirection;
  entryType: FinancialEntryType;
  description: string;
  notes?: string;
  occurredOn: string;
  amountCents: number;
  paymentMethod: FinancialPaymentMethod;
  status: FinancialEntryStatus;
  isRecurringFixed: boolean;
  referenceType?: string;
  referenceId?: string;
};

export type FinancialEntryFilters = {
  from?: string;
  to?: string;
  categoryId?: string;
  direction?: FinancialDirection | "all";
  entryType?: FinancialEntryType | "all";
  status?: FinancialEntryStatus | "all";
};

export type FinancialSummary = {
  inflowCents: number;
  outflowCents: number;
  balanceCents: number;
  pendingCents: number;
  paidCount: number;
  entryCount: number;
};

export type AnnualReportRow = {
  source: "manual_entry" | "appointment_payment" | "order_payment";
  date: string;
  category: string;
  description: string;
  amountCents: number;
  direction: FinancialDirection;
  paymentMethod: string;
  status: string;
};

export type AnnualReportCategoryTotal = {
  category: string;
  direction: FinancialDirection;
  totalCents: number;
};

export type AnnualFinanceReport = {
  year: number;
  rows: AnnualReportRow[];
  categoryTotals: AnnualReportCategoryTotal[];
  totals: {
    inflowCents: number;
    outflowCents: number;
    balanceCents: number;
  };
};

export const financialDirectionLabels: Record<FinancialDirection, string> = {
  inflow: "Entrada",
  outflow: "Saida"
};

export const financialEntryTypeLabels: Record<FinancialEntryType, string> = {
  income: "Entrada geral",
  fixed_expense: "Despesa fixa",
  variable_expense: "Despesa variavel",
  inventory_purchase: "Compra de mercadoria",
  service_receipt: "Recebimento de servico",
  withdrawal: "Retirada",
  other: "Outro"
};

export const financialStatusLabels: Record<FinancialEntryStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  cancelled: "Cancelado"
};

export const financialPaymentMethodLabels: Record<FinancialPaymentMethod, string> = {
  pix: "Pix",
  credit_card: "Cartao de credito",
  debit_card: "Cartao de debito",
  cash: "Dinheiro",
  bank_transfer: "Transferencia",
  other: "Outro"
};
