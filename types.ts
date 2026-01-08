
export interface ReceiptItem {
  label: string;
  amount: number;
}

export interface ReceiptRecord {
  id?: number;
  fy: string;
  receiptNo: string;
  date: string;
  customerName: string;
  payerName: string;
  houseNo: string;
  items: ReceiptItem[];
  totalAmount: number;
  currencyWords: string;
  chequeDetails?: {
    date: string;
    bank: string;
  };
  createdAt: number;
}

export interface InvoiceRecord {
  id?: number;
  customerName: string;
  amount: number;
  description: string;
  date: string;
  currencyWords: string;
}
