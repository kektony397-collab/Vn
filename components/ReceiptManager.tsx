
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { numberToIndianWords } from '../utils/currency';
import { Save, Printer, Trash2, Copy, Plus, Search, FileDown, RefreshCcw } from 'lucide-react';
import { ReceiptRecord, ReceiptItem } from '../types';

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
      alert("Receipt Updated!");
    } else {
      await db.receipts.add(record);
      alert("Receipt Saved!");
    }
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setCustomerName('');
    setPayerName('');
    setHouseNo('');
    setItems(items.map(i => ({ ...i, amount: 0 })));
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
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nilkanth_Receipts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl shadow-lg no-print">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Collection</span>
            <span className="text-xl font-bold text-emerald-400">
              ₹{(allReceipts?.reduce((s, r) => s + r.totalAmount, 0) || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={resetForm} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            <Plus size={16} /> <span>New Receipt</span>
          </button>
          <button onClick={handleSave} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            <Save size={16} /> <span>{editId ? 'Update' : 'Save'} Record</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            <Printer size={16} /> <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Receipt Card */}
      <div className="bg-white border-[6px] border-double border-[#b32d2e] p-8 relative shadow-xl overflow-hidden print:m-0 print:border-3 print:shadow-none mx-auto max-w-[950px]">
        {/* Print Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] text-[14px] font-bold rotate-[-15deg] scale-[1.3] flex flex-col justify-center items-center text-center leading-[3] z-0">
          NILKANTH APARTMENT SECTION-1 (1 TO 6) DIGITAL RECEIPT VALID AUTHENTIC
          <br />NILKANTH APARTMENT SECTION-1 (1 TO 6) DIGITAL RECEIPT VALID AUTHENTIC
          <br />NILKANTH APARTMENT SECTION-1 (1 TO 6) DIGITAL RECEIPT VALID AUTHENTIC
        </div>

        <div className="relative z-10 border-[1.5px] border-[#b32d2e] p-6 bg-white/80">
          <div className="text-center mb-4">
            <span className="border-[1.5px] border-[#b32d2e] px-8 py-1.5 rounded-full text-[#b32d2e] text-sm font-bold uppercase tracking-widest">જમા પાવતી (Credit Receipt)</span>
          </div>

          <header className="grid grid-cols-[100px_1fr_240px] gap-6 items-center">
             <div className="flex justify-center">
               <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#b32d2e]">
                 <circle cx="50" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                 <path d="M50 12 L50 68 M32 40 L68 40" stroke="currentColor" strokeWidth="3"/>
                 <text x="50" y="90" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor">નીલકંઠ</text>
               </svg>
             </div>
             <div className="text-center">
               <h1 className="text-3xl font-black text-[#b32d2e] tracking-tight">ધી નીલકંઠ એપાર્ટમેન્ટ વિભાગ-૧</h1>
               <p className="text-[#b32d2e] font-semibold text-lg">કો.ઓ.હાઉસિંગ સર્વિસ સોસાયટી લી.</p>
               <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">વંદે માતરમ્ ચાર રસ્તા નજીક, અમદાવાદ | (બ્લોક ૧ થી ૬)</p>
             </div>
             <div className="border-[2.5px] border-[#b32d2e] rounded">
                <div className="bg-[#b32d2e] text-white text-[10px] font-bold text-center py-1">વિભાગ-૧ (Section-1)</div>
                <div className="p-2 text-center">
                  <span className="text-[9px] font-bold text-[#b32d2e] block uppercase">બ્લોક/ઘર નં (Block No):</span>
                  <input 
                    type="text" 
                    value={houseNo} 
                    onChange={e => setHouseNo(e.target.value)} 
                    placeholder="B-001"
                    className="w-full text-center text-2xl font-black text-[#b32d2e] border-none outline-none bg-transparent"
                  />
                </div>
             </div>
          </header>

          <div className="flex justify-between mt-6 text-[#b32d2e] font-bold border-b border-slate-100 pb-2">
            <div>પહોંચ નં (No): <input value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className="border-b border-dotted border-slate-400 bg-transparent outline-none px-2 w-20 text-black font-bold" /></div>
            <div>તારીખ (Date): <input value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="border-b border-dotted border-slate-400 bg-transparent outline-none px-2 text-black font-bold" /></div>
          </div>

          <div className="space-y-6 mt-6">
            <div className="flex items-baseline text-[#b32d2e] text-xl">
              શ્રી/શ્રીમતી (Mr/Ms),
              <input 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className="flex-1 ml-4 border-b border-dotted border-slate-400 bg-transparent outline-none text-black font-bold px-2" 
                placeholder="Member Name"
              />
            </div>
            <div className="flex items-baseline text-[#b32d2e] text-xl">
              હસ્તે (Through),
              <input 
                value={payerName} 
                onChange={e => setPayerName(e.target.value)} 
                className="flex-1 mx-4 border-b border-dotted border-slate-400 bg-transparent outline-none text-black font-bold px-2" 
                placeholder="Payer Name"
              />
              <span>તરફથી મળ્યા છે.</span>
            </div>
          </div>

          <table className="w-full mt-8 border-collapse border-[1.5px] border-[#b32d2e]">
            <thead>
              <tr className="bg-[#fff5f5] text-[#b32d2e] text-xs uppercase font-bold">
                <th className="border border-[#b32d2e] p-2 w-12 text-center">ક્રમ</th>
                <th className="border border-[#b32d2e] p-2 text-left">વિગત (Particulars)</th>
                <th className="border border-[#b32d2e] p-2 w-48 text-right">રકમ રૂ. (Amount ₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="text-lg">
                  <td className="border border-[#b32d2e] p-2 text-center font-mono text-sm">{idx + 1}</td>
                  <td className="border border-[#b32d2e] p-2 font-medium text-[#b32d2e]/80 text-sm">{item.label}</td>
                  <td className="border border-[#b32d2e] p-0">
                    <input 
                      type="number" 
                      value={item.amount || ''} 
                      onChange={e => handleItemAmountChange(idx, e.target.value)}
                      className="w-full h-full p-2 text-right font-black outline-none bg-transparent"
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-[#fff8f8] font-black text-2xl text-[#b32d2e]">
                <td colSpan={2} className="border border-[#b32d2e] p-4 text-right">કુલ (Total)...</td>
                <td className="border border-[#b32d2e] p-4 text-right">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-baseline mt-8 text-[#b32d2e] text-lg font-bold">
            અંકે રૂપિયા (In Words):
            <div className="flex-1 ml-4 border-b border-dotted border-slate-400 text-slate-700 italic px-2 text-base">
              {totalAmount > 0 ? numberToIndianWords(totalAmount) : 'Zero Rupees Only'}
            </div>
          </div>

          {/* Official Stamp & Signatory */}
          <div className="flex justify-between items-end mt-12 relative">
             <div className="border-[1.5px] border-[#b32d2e] p-4 w-[280px] bg-white text-[11px] text-[#b32d2e]">
               <p className="font-bold mb-2">ચેકની વિગત (Cheque Details):</p>
               <p className="border-b border-slate-100 mb-2">તારીખ (Date): ________________</p>
               <p className="border-b border-slate-100">બેંક (Bank): __________________</p>
             </div>

             <div className="absolute right-40 bottom-4 w-32 h-32 opacity-80 rotate-[-12deg] pointer-events-none">
                <svg viewBox="0 0 200 200" className="text-[#1a4299]">
                   <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                   <path id="stPath" fill="none" d="M 35,100 A 65,65 0 1,1 165,100" />
                   <text fill="currentColor" fontSize="8" fontWeight="bold"><textPath xlink:href="#stPath">ધી નીલકંઠ એપાર્ટમેન્ટ વિભાગ-૧ કો.ઓ. સોસાયટી</textPath></text>
                   <text x="100" y="95" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">OFFICIAL STAMP</text>
                   <text x="100" y="115" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">REVENUE VALID</text>
                   <text x="100" y="145" textAnchor="middle" fill="currentColor" fontSize="16">★</text>
                </svg>
             </div>

             <div className="text-center font-bold text-[#b32d2e] space-y-2">
                <div className="w-48 border-b border-[#b32d2e] mx-auto" />
                <p>નાણાં લેનારની સહી</p>
                <p className="text-[10px] uppercase tracking-tighter">(Authorized Signatory)</p>
             </div>
          </div>
        </div>
      </div>

      {/* History & Search Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
             <div className="bg-slate-100 p-2 rounded-lg">
               <RefreshCcw size={18} className="text-slate-500" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-800">Billing History</h3>
               <p className="text-xs text-slate-500">Search and manage existing society records</p>
             </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, house, no..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
            <button onClick={handleExportCSV} className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-all">
              <FileDown size={16} /> <span>Export CSV</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Receipt No</th>
                <th className="px-6 py-4">Member Name</th>
                <th className="px-6 py-4">House No</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts?.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600">{r.date}</td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900">#{r.receiptNo}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">{r.customerName}</div>
                    <div className="text-[10px] text-slate-400 italic">{r.payerName || 'Direct Payer'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{r.houseNo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900">₹{r.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => loadForEdit(r)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
                      <RefreshCcw size={16} />
                    </button>
                    <button onClick={() => { loadForEdit(r); setEditId(null); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Duplicate/Copy">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!filteredReceipts || filteredReceipts.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 text-sm italic">
                    No matching records found in Nilkanth database.
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
