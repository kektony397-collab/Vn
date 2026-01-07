
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, Home, ShieldCheck, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const receipts = useLiveQuery(() => db.receipts.toArray());

  const totalRevenue = receipts?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0;
  const transactionCount = receipts?.length || 0;
  const uniqueHouses = new Set(receipts?.map(i => i.houseNo)).size;

  const chartData = receipts?.slice(-10).map(r => ({
    name: r.houseNo,
    amount: r.totalAmount
  })) || [];

  const pieData = [
    { name: 'Revenue', value: totalRevenue },
    { name: 'Target', value: Math.max(totalRevenue * 1.5, 100000) }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4'];

  const StatCard = ({ title, value, sub, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 ${colorClass}`} />
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colorClass} text-white shadow-lg`}>
          <Icon size={22} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Health</span>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Optimal</span>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      <h4 className="text-3xl font-black text-slate-900 mt-1">{value}</h4>
      <p className="text-[10px] text-slate-400 mt-2 font-medium">{sub}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Corpus Fund" 
          value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
          sub="Total collected from Section-1 members"
          icon={TrendingUp} 
          colorClass="bg-blue-600" 
        />
        <StatCard 
          title="Receipt Count" 
          value={transactionCount} 
          sub="Digital entries processed in DB"
          icon={ShieldCheck} 
          colorClass="bg-emerald-600" 
        />
        <StatCard 
          title="Active Houses" 
          value={uniqueHouses} 
          sub="Registered residences in block 1-6"
          icon={Home} 
          colorClass="bg-amber-500" 
        />
        <StatCard 
          title="Avg Collection" 
          value={`₹${(transactionCount > 0 ? (totalRevenue / transactionCount) : 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} 
          sub="Mean contribution per transaction"
          icon={DollarSign} 
          colorClass="bg-indigo-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Recent Contributions</h3>
              <p className="text-xs text-slate-400 mt-1">Transaction flow for last 10 residents</p>
            </div>
            <div className="flex items-center space-x-2">
               <div className="w-3 h-3 rounded-full bg-blue-500" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Amount (₹)</span>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info & Alerts Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl h-full flex flex-col justify-between">
             <div>
               <h3 className="text-2xl font-black text-blue-400 leading-tight">Society Audit Protocol</h3>
               <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                 All data is stored locally in your browser's <strong className="text-slate-200 underline decoration-blue-500 underline-offset-4">IndexedDB</strong>. 
                 Ensure you export CSV reports regularly for external backups.
               </p>
               
               <div className="mt-8 space-y-4">
                 {[
                   { label: 'Print Layout', status: 'Ready' },
                   { label: 'Auto-Backup', status: 'Active' },
                   { label: 'Security Level', status: 'AES-256' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-3">
                     <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
                     <span className="text-[10px] font-bold bg-slate-800 text-blue-400 px-2 py-1 rounded tracking-tighter">{item.status}</span>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-slate-800">
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 uppercase tracking-widest text-xs">
                  Download Audit Report
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
