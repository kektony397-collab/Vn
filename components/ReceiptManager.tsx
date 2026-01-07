
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { numberToIndianWords } from '../utils/currency';
import { Save, Printer, Trash2, Copy, Plus, Search, FileDown, RefreshCcw, Table as TableIcon } from 'lucide-react';
import { ReceiptRecord, ReceiptItem } from '../types';
import * as XLSX from 'xlsx';

const ReceiptManager: React.FC = () => {
  const [editId, setEditId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [payerName, setPayerName] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toLocaleDateString('en-GB').replace(/\//g, ' - '));
  const [searchQuery, setSearchQuery] = useState('');

  const [items, setItems] = useState<ReceiptItem[]>([
    { label: 'સભાસદ દાખલ ફી (Member Entry Fee)', amount: 0 },
    { label: 'શેર ફાળા પેટે (Share Contribution)', amount: 0 },
    { label: 'ડેવલપમેન્ટ ફાળા ખાતે (Development Fund)', amount: 0 },
    { label: 'વહીવટી ફાળા પેટે (Admin Fund)', amount: 0 },
    { label: 'બાકી / વ્યાજ / દંડ (Pending/Interest/Fine)', amount: 0 },
  ]);

  const allReceipts = useLiveQuery(() => db.receipts.toArray());
  const filteredReceipts = allReceipts?.filter(r => 
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.houseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.receiptNo.includes(searchQuery)
  ).sort((a, b) => (b.id || 0) - (a.id || 0));

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    if (!editId && allReceipts) {
      const maxNo = allReceipts.reduce((max, r) => Math.max(max, parseInt(r.receiptNo) || 0), 100);
      setReceiptNo((maxNo + 1).toString());
    }
  }, [allReceipts, editId]);

  const handleItemAmountChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index].amount = parseFloat(val) || 0;
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!customerName || !houseNo || totalAmount <= 0) {
      alert("Please complete the required fields (Name, House No, and Amount)");
      return;
    }

    const record: ReceiptRecord = {
      receiptNo,
      date: receiptDate,
      customerName,
      payerName,
      houseNo,
      items,
      totalAmount,
      currencyWords: numberToIndianWords(totalAmount)
    };

    if (editId) {
      await db.receipts.update(editId, record);
      alert("Receipt Updated Successfully!");
    } else {
      await db.receipts.add(record);
      alert("Receipt Saved Successfully!");
    }
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setCustomerName('');
    setPayerName('');
    setHouseNo('');
    setItems(items.map(i => ({ ...i, amount: 0 })));
    setReceiptDate(new Date().toLocaleDateString('en-GB').replace(/\//g, ' - '));
  };

  const loadForEdit = (record: ReceiptRecord) => {
    setEditId(record.id || null);
    setReceiptNo(record.receiptNo);
    setReceiptDate(record.date);
    setCustomerName(record.customerName);
    setPayerName(record.payerName);
    setHouseNo(record.houseNo);
    setItems(record.items);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id?: number) => {
    if (id && confirm("Delete this receipt permanently?")) {
      await db.receipts.delete(id);
    }
  };

  const handleExportCSV = () => {
    if (!allReceipts) return;
    const headers = ['Date', 'Receipt No', 'Name', 'House No', 'Total', 'Words'];
    const csvContent = [
      headers.join(','),
      ...allReceipts.map(r => [r.date, r.receiptNo, r.customerName, r.houseNo, r.totalAmount, `"${r.currencyWords}"`].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nilkanth_Receipts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportXLSX = () => {
    if (!allReceipts) return;
    const data = allReceipts.map(r => ({
      'Date': r.date,
      'Receipt No': r.receiptNo,
      'Member Name': r.customerName,
      'Payer Name': r.payerName,
      'House No': r.houseNo,
      'Total Amount': r.totalAmount,
      'Words': r.currencyWords
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receipts");
    XLSX.writeFile(workbook, `Nilkanth_Receipts_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Vite-React Orchestration: Dynamic Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl shadow-lg no-print sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col border-r border-slate-700 pr-6">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Society Fund</span>
            <span className="text-xl font-black text-emerald-400">
              ₹{(allReceipts?.reduce((s, r) => s + r.totalAmount, 0) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Database Persistence</span>
            <span className="text-xs font-bold text-blue-400">IndexedDB ACTIVE</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={resetForm} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all transform hover:scale-105 active:scale-95">
            <Plus size={16} /> <span>New Receipt</span>
          </button>
          <button onClick={handleSave} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20">
            <Save size={16} /> <span>{editId ? 'Update' : 'Save Record'}</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20">
            <Printer size={16} /> <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Receipt Card: Componentized Syntactic Transformation */}
      <div className="bg-white border-[6px] border-double border-[#b32d2e] p-8 relative shadow-xl overflow-hidden print:m-0 print:border-[3px] print:shadow-none mx-auto max-w-[950px] transition-all duration-500">
        {/* Print Watermark - Legacy requirement */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] text-[14px] font-bold rotate-[-15deg] scale-[1.3] flex flex-col justify-center items-center text-center leading-[3] z-0 select-none">
          NILKANTH APARTMENT SECTION-1 (1 TO 6) DIGITAL RECEIPT VALID AUTHENTIC
          <br />NILKANTH APARTMENT SECTION-1 (1 TO 6) DIGITAL RECEIPT VALID AUTHENTIC
          <br />NILKANTH APARTMENT SECTION-1 (1 TO 6) DIGITAL RECEIPT VALID AUTHENTIC
        </div>

        <div className="relative z-10 border-[1.5px] border-[#b32d2e] p-6 bg-white/80">
          <div className="text-center mb-4">
            <span className="border-[1.5px] border-[#b32d2e] px-8 py-1.5 rounded-full text-[#b32d2e] text-sm font-black uppercase tracking-widest bg-white shadow-sm">જમા પાવતી (Credit Receipt)</span>
          </div>

          <header className="grid grid-cols-[100px_1fr_240px] gap-6 items-center">
             <div className="flex justify-center">
               <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#b32d2e]">
                 <circle cx="50" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                 <path d="M50 12 L50 68 M32 40 L68 40" stroke="currentColor" strokeWidth="3"/>
                 <text x="50" y="90" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor">નીલકંઠ</text>
               </svg>
             </div>
             <div className="text-center">
               <h1 className="text-3xl font-black text-[#b32d2e] tracking-tight">ધી નીલકંઠ એપાર્ટમેન્ટ વિભાગ-૧</h1>
               <p className="text-[#b32d2e] font-bold text-lg">કો.ઓ.હાઉસિંગ સર્વિસ સોસાયટી લી.</p>
               <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">વંદે માતરમ્ ચાર રસ્તા નજીક, અમદાવાદ | (બ્લોક ૧ થી ૬)</p>
             </div>
             <div className="border-[2.5px] border-[#b32d2e] rounded bg-white overflow-hidden shadow-sm">
                <div className="bg-[#b32d2e] text-white text-[10px] font-black text-center py-1 uppercase tracking-widest">વિભાગ-૧ (Section-1)</div>
                <div className="p-2 text-center">
                  <span className="text-[9px] font-bold text-[#b32d2e] block uppercase opacity-80 mb-1">બ્લોક/ઘર નં (Block/House No):</span>
                  <input 
                    type="text" 
                    value={houseNo} 
                    onChange={e => setHouseNo(e.target.value)} 
                    placeholder="B-001"
                    className="w-full text-center text-3xl font-black text-[#b32d2e] border-none outline-none bg-transparent placeholder-[#b32d2e]/20"
                  />
                </div>
             </div>
          </header>

          <div className="flex justify-between mt-8 text-[#b32d2e] font-black border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span>પહોંચ નં (No):</span> 
              <input value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className="border-b border-dotted border-[#b32d2e]/40 bg-transparent outline-none px-2 w-24 text-black font-black" />
            </div>
            <div className="flex items-center space-x-2">
              <span>તારીખ (Date):</span> 
              <input value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="border-b border-dotted border-[#b32d2e]/40 bg-transparent outline-none px-2 text-black font-black" />
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-baseline text-[#b32d2e] text-2xl font-bold">
              શ્રી/શ્રીમતી (Mr/Ms),
              <input 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className="flex-1 ml-4 border-b border-dotted border-[#b32d2e]/40 bg-transparent outline-none text-black font-black px-2 placeholder-slate-200" 
                placeholder="Member Name (Alphabetical)"
              />
            </div>
            <div className="flex items-baseline text-[#b32d2e] text-2xl font-bold">
              હસ્તે (Through),
              <input 
                value={payerName} 
                onChange={e => setPayerName(e.target.value)} 
                className="flex-1 mx-4 border-b border-dotted border-[#b32d2e]/40 bg-transparent outline-none text-black font-black px-2 placeholder-slate-200" 
                placeholder="Payer Full Name"
              />
              <span className="whitespace-nowrap">તરફથી મળ્યા છે.</span>
            </div>
          </div>

          <table className="w-full mt-10 border-collapse border-[2px] border-[#b32d2e] shadow-sm">
            <thead>
              <tr className="bg-[#fff5f5] text-[#b32d2e] text-xs uppercase font-black">
                <th className="border-2 border-[#b32d2e] p-3 w-16 text-center">ક્રમ</th>
                <th className="border-2 border-[#b32d2e] p-3 text-left">વિગત (Particulars)</th>
                <th className="border-2 border-[#b32d2e] p-3 w-52 text-right">રકમ રૂ. (Amount ₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="border border-[#b32d2e] p-3 text-center font-mono text-sm font-bold">{idx + 1}</td>
                  <td className="border border-[#b32d2e] p-3 font-bold text-[#b32d2e] text-sm uppercase tracking-tight">{item.label}</td>
                  <td className="border border-[#b32d2e] p-0 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b32d2e]/30 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={item.amount || ''} 
                      onChange={e => handleItemAmountChange(idx, e.target.value)}
                      className="w-full h-full p-3 text-right font-black outline-none bg-transparent pr-4"
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-[#fff8f8] font-black text-3xl text-[#b32d2e]">
                <td colSpan={2} className="border-2 border-[#b32d2e] p-5 text-right uppercase tracking-widest">કુલ (Total)...</td>
                <td className="border-2 border-[#b32d2e] p-5 text-right font-mono">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-baseline mt-10 text-[#b32d2e] text-lg font-black bg-slate-50/50 p-4 rounded-lg border border-slate-100">
            અંકે રૂપિયા (In Words):
            <div className="flex-1 ml-4 text-slate-700 italic px-2 text-lg font-bold">
              {totalAmount > 0 ? numberToIndianWords(totalAmount) : 'Zero Rupees Only'}
            </div>
          </div>

          {/* Official Stamp & Signatory: Legacy Precision Printing */}
          <div className="flex justify-between items-end mt-16 relative">
             <div className="border-[2px] border-[#b32d2e] p-5 w-[320px] bg-white text-[11px] text-[#b32d2e] rounded-md shadow-sm">
               <p className="font-black mb-3 border-b border-[#b32d2e]/10 pb-1 flex items-center"><TableIcon size={12} className="mr-2"/> ચેકની વિગત (Cheque Details):</p>
               <p className="border-b border-slate-200 mb-3 pb-1">તારીખ (Date): ____________________</p>
               <p className="border-b border-slate-200">બેંક (Bank): ______________________</p>
             </div>

             <div className="absolute right-48 bottom-4 w-40 h-40 opacity-90 rotate-[-12deg] pointer-events-none select-none">
                <svg viewBox="0 0 200 200" className="text-[#1a4299]">
                   <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="3"/>
                   <path id="stPath" fill="none" d="M 35,100 A 65,65 0 1,1 165,100" />
                   <text fill="currentColor" fontSize="8" fontWeight="black" letterSpacing="0.5"><textPath xlink:href="#stPath">ધી નીલકંઠ એપાર્ટમેન્ટ વિભાગ-૧ કો.ઓ. સોસાયટી</textPath></text>
                   <text x="100" y="95" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="black">OFFICIAL STAMP</text>
                   <text x="100" y="115" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="black">REVENUE VALID 2025</text>
                   <text x="100" y="150" textAnchor="middle" fill="currentColor" fontSize="24">★</text>
                </svg>
             </div>

             <div className="text-center font-black text-[#b32d2e] space-y-4">
                <div className="w-56 h-[1.5px] bg-[#b32d2e] mx-auto opacity-50" />
                <div className="space-y-1">
                  <p className="text-xl">નાણાં લેનારની સહી</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">(Authorized Signatory)</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* History & Search Section: Data Interoperability */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden no-print">
        <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-slate-50/50">
          <div className="flex items-center space-x-4">
             <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
               <RefreshCcw size={24} className="text-white" />
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Billing Database</h3>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">IndexedDB Transaction Log</p>
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search name, house, no..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-11 pr-5 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-80 transition-all shadow-sm"
              />
            </div>
            <div className="flex space-x-2">
              <button onClick={handleExportCSV} className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all shadow-sm">
                <FileDown size={18} /> <span>CSV</span>
              </button>
              <button onClick={handleExportXLSX} className="flex items-center space-x-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-500/20">
                <FileDown size={18} /> <span>EXCEL</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/50 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Receipt No</th>
                <th className="px-8 py-5">Society Member</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Amount (₹)</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts?.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{r.date}</td>
                  <td className="px-8 py-5 text-sm font-mono font-black text-blue-600">#{r.receiptNo}</td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{r.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-bold italic tracking-wide mt-0.5">{r.payerName || 'Primary Member'}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black tracking-widest uppercase">{r.houseNo}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">₹{r.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => loadForEdit(r)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-all" title="Edit/Restore">
                      <RefreshCcw size={18} />
                    </button>
                    <button onClick={() => { loadForEdit(r); setEditId(null); }} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all" title="Copy (New from Existing)">
                      <Copy size={18} />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all" title="Permanently Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!filteredReceipts || filteredReceipts.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center text-slate-400 font-bold italic bg-slate-50/30">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                      <Search size={48} className="mb-2" />
                      <p>No society records found for the given search criteria.</p>
                      <button onClick={() => setSearchQuery('')} className="text-blue-600 hover:underline">Clear Filters</button>
                    </div>
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

export default ReceiptManager;
