
import Dexie, { Table } from 'dexie';
import { ReceiptRecord, InvoiceRecord } from './types';

// AppDatabase extends Dexie to provide a typed interface for NilkanthProDB
export class AppDatabase extends Dexie {
  receipts!: Table<ReceiptRecord>;
  invoices!: Table<InvoiceRecord>;

  constructor() {
    super('NilkanthProDB');
    
    // Define the database schema and versioning. 
    // This resolves the "Property 'version' does not exist" error by ensuring 
    // the instance is correctly initialized with Dexie's versioning system.
    this.version(1).stores({
      receipts: '++id, receiptNo, customerName, date, houseNo, totalAmount',
      invoices: '++id, customerName, amount, date'
    });
  }
}

export const db = new AppDatabase();
