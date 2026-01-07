
import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { numberToIndianWords } from '../utils/currency';
import { Save, Plus, Printer, FileDown, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const Financials: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  
  const invoices = useLiveQuery(() => db.invoices.toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || amount <= 0) return;

    const currencyWords = numberToIndianWords(amount);
    
    await db.invoices.add({
      customerName,
      amount,
      description,
      date: new Date().toLocaleDateString(),
      currencyWords
    });

    setCustomerName('');
    setAmount(0);
    setDescription('');
  };

  const handleExportXLSX = () => {
    if (!invoices) return;
    const worksheet = XLSX.utils.json_to_sheet(invoices);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, `Invoices_${new Date().getTime()}.xlsx`);
  };

  const handleExportCSV = () => {
    if (!invoices) return;
    const headers = ['ID', 'Customer', 'Amount', 'Date', 'Description', 'Words'];
    const rows = invoices.map(inv => [
      inv.id,
      inv.customerName,
      inv.amount,
      inv.date,
      inv.description,
      inv.currencyWords
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id?: number) => {
    if (id) await db.invoices.delete(id);
  };

  return (
    <div className="space-y-8">
      {/* Entry Form */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Plus className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">New Transaction</h3>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="0.00"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none h-20"
              placeholder="Internal project reference..."
            />
          </div>
          
          <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
             <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-1">Indian Currency Mapping</p>
             <p className="text-blue-900 font-medium italic">
                {amount > 0 ? numberToIndianWords(amount) : 'Enter an amount to see conversion...'}
             </p>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              <Save size={18} />
              <span>Save to IndexedDB</span>
            </button>
          </div>
        </form>
      </section>

      {/* List & Export */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transaction Ledger</h3>
          <div className="flex items-center space-x-2">
             <button 
               onClick={handleExportCSV}
               className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
             >
               <FileDown size={16} />
               <span>CSV</span>
             </button>
             <button 
               onClick={handleExportXLSX}
               className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
             >
               <FileDown size={16} />
               <span>Excel</span>
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Currency Words</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices?.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">#{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{invoice.customerName}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-900">₹{invoice.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{invoice.currencyWords}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => window.print()}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    >
                      <Printer size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(invoice.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!invoices || invoices.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    No transactions found in local persistence.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Financials;
