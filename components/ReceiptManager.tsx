
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { numberToIndianWords } from '../utils/currency';
import { 
  Save, Printer, Trash2, Copy, Plus, Search, 
  FileDown, RefreshCcw, Database, ShieldCheck, Download, Upload 
} from 'lucide-react';
import { ReceiptRecord, ReceiptItem } from '../types';
import * as XLSX from 'xlsx';

const ReceiptManager: React.FC = () => {
  const currentFY = "2025-26";
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
      fy: currentFY,
      receiptNo,
      date: receiptDate,
      customerName,
      payerName,
      houseNo,
      items,
      totalAmount,
      currencyWords: numberToIndianWords(totalAmount),
      createdAt: Date.now()
    };

    if (editId) {
      await db.receipts.update(editId, record);
      alert("ERP Record Synchronized!");
    } else {
      await db.receipts.add(record);
      alert("Society Receipt Persisted to IndexedDB!");
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
    if (id && confirm("Are you sure? This will permanently delete the digital ledger entry.")) {
      await db.receipts.delete(id);
    }
  };

  const handleExportCSV = () => {
    if (!allReceipts) return;
    const headers = ['FiscalYear', 'Date', 'Receipt No', 'Name', 'House No', 'Total', 'Words'];
    const csvContent = [
      headers.join(','),
      ...allReceipts.map(r => [r.fy, r.date, r.receiptNo, `"${r.customerName}"`, r.houseNo, r.totalAmount, `"${r.currencyWords}"`].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nilkanth_Society_Ledger_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBackup = () => {
    if (!allReceipts) return;
    const data = JSON.stringify(allReceipts);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nilkanth_Society_Backup_${new Date().getTime()}.json`;
    link.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          // Fix: Dexie transaction API usage and removal of explicit IDs for restoration
          await db.transaction('rw', db.receipts, async () => {
            for (const item of data) {
              const record = { ...item };
              delete record.id;
              await db.receipts.add(record);
            }
          });
          alert("Database Restoration Complete!");
        }
      } catch (err) {
        console.error("Restoration Error:", err);
        alert("Invalid restoration file format or internal database error.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ERP ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl shadow-2xl no-print sticky top-4 z-50 border border-slate-800">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col border-r border-slate-700 pr-6">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Collections</span>
            <span className="text-xl font-black text-emerald-400">
              ₹{(allReceipts?.reduce((s, r) => s + r.totalAmount, 0) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Financial Year</span>
            <span className="text-sm font-black text-white">{currentFY}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button onClick={resetForm} className="btn-action bg-slate-800 text-white hover:bg-slate-700">
            <Plus size={16} /> <span className="hidden sm:inline">New Entry</span>
          </button>
          <button onClick={handleSave} className="btn-action bg-emerald-600 text-white hover:bg-emerald-500">
            <Save size={16} /> <span className="hidden sm:inline">{editId ? 'Update Ledger' : 'Persist Record'}</span>
          </button>
          <div className="flex space-x-1">
            <button onClick={handleBackup} className="btn-action bg-indigo-600 text-white hover:bg-indigo-500 rounded-r-none" title="Backup DB">
              <Download size={16} />
            </button>
            <label className="btn-action bg-indigo-600 text-white hover:bg-indigo-500 rounded-l-none cursor-pointer" title="Restore DB">
              <Upload size={16} />
              <input type="file" className="hidden" onChange={handleRestore} accept=".json" />
            </label>
          </div>
          <button onClick={() => window.print()} className="btn-action bg-blue-600 text-white hover:bg-blue-500">
            <Printer size={16} /> <span className="hidden sm:inline">Generate PDF</span>
          </button>
        </div>
      </div>

      {/* THE PHYSICAL RECEIPT CARD (Optimized for Screen and Print) */}
      <div className="bg-white border-[8px] border-double border-[#b32d2e] p-8 relative shadow-2xl overflow-hidden print:m-0 print:border-[4px] print:shadow-none mx-auto max-w-[950px] transform transition-transform hover:scale-[1.005]">
        {/* PHYSICAL WATERMARK LAYER */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex flex-wrap justify-around items-center gap-12 rotate-[-15deg] scale-[1.5] z-0 overflow-hidden select-none">
          {Array(60).fill("NILKANTH APARTMENT ").map((t, i) => (
            <span key={i} className="text-[10px] font-black whitespace-nowrap text-black">{t}</span>
          ))}
        </div>

        <div className="relative z-10 border-[1.5px] border-[#b32d2e] p-6 bg-white/95">
          <div className="text-center mb-6">
            <span className="border-[1.5px] border-[#b32d2e] px-10 py-2 rounded-full text-[#b32d2e] text-sm font-black uppercase tracking-[0.2em] bg-white shadow-sm">જમા પાવતી (Credit Receipt)</span>
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
               <p className="text-[#b32d2e] font-black text-xl">કો.ઓ.હાઉસિંગ સર્વિસ સોસાયટી લી.</p>
               <p className="text-[11px] text-slate-500 font-black mt-1 uppercase tracking-tighter">વંદે માતરમ્ ચાર રસ્તા નજીક, અમદાવાદ | (બ્લોક ૧ થી ૬)</p>
             </div>
             <div className="border-[3px] border-[#b32d2e] rounded-lg bg-white overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform">
                <div className="bg-[#b32d2e] text-white text-[11px] font-black text-center py-1.5 uppercase tracking-widest">વિભાગ-૧ (Section-1)</div>
                <div className="p-2 text-center">
                  <span className="text-[10px] font-black text-[#b32d2e] block uppercase opacity-70 mb-1 tracking-tighter">બ્લોક/ઘર નં (Block/House No):</span>
                  <input 
                    type="text" 
                    value={houseNo} 
                    onChange={e => setHouseNo(e.target.value)} 
                    placeholder="B-001"
                    className="w-full text-center text-4xl font-black text-[#b32d2e] border-none outline-none bg-transparent placeholder-[#b32d2e]/20"
                  />
                </div>
             </div>
          </header>

          <div className="flex justify-between mt-10 text-[#b32d2e] font-black border-b-2 border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-lg">પહોંચ નં (Receipt No):</span> 
              <input value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className="border-b-2 border-dotted border-[#b32d2e]/40 bg-transparent outline-none px-2 w-32 text-black font-black text-xl" />
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg">તારીખ (Date):</span> 
              <input value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="border-b-2 border-dotted border-[#b32d2e]/40 bg-transparent outline-none px-2 text-black font-black text-xl" />
            </div>
          </div>

          <div className="space-y-8 mt-10">
            <div className="flex items-baseline text-[#b32d2e] text-2xl font-black">
              શ્રી/શ્રીમતી (Mr/Ms),
              <input 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className="flex-1 ml-6 border-b-2 border-dotted border-[#b32d2e]/40 bg-transparent outline-none text-black font-black px-3 placeholder-slate-200" 
                placeholder="Full Member Name"
              />
            </div>
            <div className="flex items-baseline text-[#b32d2e] text-2xl font-black">
              હસ્તે (Through),
              <input 
                value={payerName} 
                onChange={e => setPayerName(e.target.value)} 
                className="flex-1 mx-6 border-b-2 border-dotted border-[#b32d2e]/40 bg-transparent outline-none text-black font-black px-3 placeholder-slate-200" 
                placeholder="Payer's Name (if any)"
              />
              <span className="whitespace-nowrap">તરફથી મળ્યા છે.</span>
            </div>
          </div>

          <table className="w-full mt-12 border-collapse border-[2.5px] border-[#b32d2e] shadow-xl rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#fff5f5] text-[#b32d2e] text-xs uppercase font-black">
                <th className="border-2 border-[#b32d2e] p-4 w-20 text-center">ક્રમ</th>
                <th className="border-2 border-[#b32d2e] p-4 text-left">વિગત (Particulars)</th>
                <th className="border-2 border-[#b32d2e] p-4 w-64 text-right">રકમ રૂ. (Amount ₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-all">
                  <td className="border border-[#b32d2e] p-4 text-center font-mono text-base font-black">{idx + 1}</td>
                  <td className="border border-[#b32d2e] p-4 font-black text-[#b32d2e] text-sm uppercase tracking-tight">{item.label}</td>
                  <td className="border border-[#b32d2e] p-0 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b32d2e]/30 font-black text-xl">₹</span>
                    <input 
                      type="number" 
                      value={item.amount || ''} 
                      onChange={e => handleItemAmountChange(idx, e.target.value)}
                      className="w-full h-full p-4 text-right font-black outline-none bg-transparent pr-6 text-2xl"
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-[#fff8f8] font-black text-4xl text-[#b32d2e]">
                <td colSpan={2} className="border-2 border-[#b32d2e] p-6 text-right uppercase tracking-[0.2em] bg-white">કુલ (Total)...</td>
                <td className="border-2 border-[#b32d2e] p-6 text-right font-mono bg-white">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-baseline mt-12 text-[#b32d2e] text-xl font-black bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
            અંકે રૂપિયા (In Words):
            <div className="flex-1 ml-6 text-slate-800 italic px-3 text-xl font-black underline decoration-dotted decoration-slate-300 underline-offset-8">
              {totalAmount > 0 ? numberToIndianWords(totalAmount) : 'Zero Rupees Only'}
            </div>
          </div>

          {/* OFFICIAL STAMP & SIGNATORY LAYER */}
          <div className="flex justify-between items-end mt-20 relative">
             <div className="border-[2.5px] border-[#b32d2e] p-6 w-[360px] bg-white text-[12px] text-[#b32d2e] rounded-xl shadow-inner group">
               <p className="font-black mb-4 border-b border-[#b32d2e]/10 pb-2 flex items-center"><Database size={14} className="mr-3"/> ચેકની વિગત (Cheque Details):</p>
               <p className="border-b border-slate-200 mb-4 pb-1">તારીખ (Date): ____________________</p>
               <p className="border-b border-slate-200">બેંક (Bank): ______________________</p>
             </div>

             <div className="absolute right-56 bottom-4 w-44 h-44 opacity-95 rotate-[-15deg] pointer-events-none select-none transition-transform duration-700 hover:rotate-0">
                <svg viewBox="0 0 200 200" className="text-[#1a4299]">
                   <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="3.5"/>
                   <path id="stPath" fill="none" d="M 35,100 A 65,65 0 1,1 165,100" />
                   <text fill="currentColor" fontSize="8" fontWeight="black" letterSpacing="0.8"><textPath xlink:href="#stPath">ધી નીલકંઠ એપાર્ટમેન્ટ વિભાગ-૧ કો.ઓ. સોસાયટી</textPath></text>
                   <text x="100" y="95" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="black">OFFICIAL ERP STAMP</text>
                   <text x="100" y="115" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="black">FISCAL VALID {currentFY}</text>
                   <text x="100" y="150" textAnchor="middle" fill="currentColor" fontSize="28">★</text>
                </svg>
             </div>

             <div className="text-center font-black text-[#b32d2e] space-y-6">
                <div className="w-64 h-[2px] bg-[#b32d2e] mx-auto opacity-40" />
                <div className="space-y-2">
                  <p className="text-2xl tracking-tight">નાણાં લેનારની સહી</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] font-black opacity-60">(Authorized Signatory)</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL DATABASE VIEW */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden no-print transition-all hover:shadow-blue-900/10">
        <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-slate-50/50">
          <div className="flex items-center space-x-5">
             <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/30">
               <RefreshCcw size={28} className="text-white" />
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">Financial Ledger Database</h3>
               <p className="text-sm text-slate-500 font-black uppercase tracking-widest mt-1">Smart Search & Transaction Log</p>
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search member, house, no..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-4 border border-slate-200 rounded-2xl text-base font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-96 transition-all shadow-sm"
              />
            </div>
            <button onClick={handleExportCSV} className="flex items-center space-x-3 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-amber-500/20 active:scale-95">
              <FileDown size={20} /> <span>Export CSV</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/50 text-slate-500 text-[11px] uppercase font-black tracking-[0.25em]">
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6">No.</th>
                <th className="px-10 py-6">Member Name</th>
                <th className="px-10 py-6">Location</th>
                <th className="px-10 py-6 text-right">Amount (₹)</th>
                <th className="px-10 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts?.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/40 transition-all group">
                  <td className="px-10 py-6 text-sm font-black text-slate-500">{r.date}</td>
                  <td className="px-10 py-6 text-sm font-mono font-black text-blue-600">#{r.receiptNo}</td>
                  <td className="px-10 py-6">
                    <div className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{r.customerName}</div>
                    <div className="text-[11px] text-slate-400 font-bold italic tracking-wide mt-1">{r.payerName || 'Primary Member'}</div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-black tracking-[0.1em] uppercase shadow-lg shadow-slate-900/20">{r.houseNo}</span>
                  </td>
                  <td className="px-10 py-6 text-right text-base font-black text-slate-900">₹{r.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-10 py-6 text-center space-x-3">
                    <button onClick={() => loadForEdit(r)} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-2xl transition-all shadow-sm" title="Edit/Restore">
                      <RefreshCcw size={20} />
                    </button>
                    <button onClick={() => { loadForEdit(r); setEditId(null); }} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-2xl transition-all shadow-sm" title="Copy As New">
                      <Copy size={20} />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all shadow-sm" title="Delete Permanent">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!filteredReceipts || filteredReceipts.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-10 py-40 text-center text-slate-400 font-black italic bg-slate-50/20">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                      <ShieldCheck size={64} className="mb-2" />
                      <p className="text-xl tracking-tight">Financial Ledger is empty or search criteria returned zero results.</p>
                      <button onClick={() => setSearchQuery('')} className="text-blue-600 hover:underline font-black uppercase text-sm tracking-widest">Reset Database Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .btn-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 1rem;
          font-weight: 900;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .btn-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .btn-action:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default ReceiptManager;
