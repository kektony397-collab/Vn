
import Dexie, { type Table } from 'dexie';
import { ReceiptRecord, InvoiceRecord } from './types';

// Use default import for Dexie to ensure proper prototype inheritance for version() and transaction()
export class AppDatabase extends Dexie {
  receipts!: Table<ReceiptRecord>;
  invoices!: Table<InvoiceRecord>;

  constructor() {
    super('NilkanthProERP');
    
    // Define database schema
    this.version(2).stores({
      receipts: '++id, fy, receiptNo, customerName, houseNo, totalAmount, date',
      invoices: '++id, customerName, amount, date'
    });
  }
}

export const db = new AppDatabase();
