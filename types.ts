
export interface ReceiptItem {
  label: string;
  amount: number;
}

export interface ReceiptRecord {
  id?: number;
  receiptNo: string;
  date: string;
  customerName: string;
  payerName: string;
  houseNo: string;
  items: ReceiptItem[];
  totalAmount: number;
  currencyWords: string;
  chequeDetails?: string;
  bankName?: string;
}

// Added InvoiceRecord to support the Financials ledger
export interface InvoiceRecord {
  id?: number;
  customerName: string;
  amount: number;
  description: string;
  date: string;
  currencyWords: string;
}

export interface MigrationMapping {
  legacy: string;
  modern: string;
  significance: string;
}
