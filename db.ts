import { Dexie, type Table } from 'dexie';
import { ReceiptRecord, InvoiceRecord } from './types';

// AppDatabase extends Dexie to provide a typed interface for NilkanthProDB
export class AppDatabase extends Dexie {
  receipts!: Table<ReceiptRecord>;
  invoices!: Table<InvoiceRecord>;

  constructor() {
    super('NilkanthProDB');
    
    // Define the database schema and versioning. 
    // Fixed: Using the named export Dexie ensures that inheritance and instance methods like .version() 
    // are correctly typed and recognized by the TypeScript compiler.
    this.version(1).stores({
      receipts: '++id, receiptNo, customerName, date, houseNo, totalAmount',
      invoices: '++id, customerName, amount, date'
    });
  }
}

export const db = new AppDatabase();