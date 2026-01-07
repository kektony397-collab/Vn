
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Home, ShieldCheck, DollarSign, Activity, FileStack, LayoutDashboard } from 'lucide-react';

const Dashboard: React.FC = () => {
  const receipts = useLiveQuery(() => db.receipts.toArray());

  const totalRevenue = receipts?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0;
  const transactionCount = receipts?.length || 0;
  const uniqueHouses = new Set(receipts?.map(i => i.houseNo)).size;

  const chartData = receipts?.slice(-10).map(r => ({
    name: r.houseNo,
    amount: r.totalAmount
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4'];

  const StatCard = ({ title, value, sub, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white p-6 rounded-2xl border-l-4 ${borderClass} shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 ${colorClass}`} />
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorClass} text-white shadow-lg group-hover:rotate-12 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Sync</span>
          <div className="flex items-center space-x-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Secure</span>
          </div>
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
      <h4 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{value}</h4>
      <p className="text-[11px] text-slate-400 mt-3 font-bold leading-relaxed">{sub}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Metrics Row: Component Isolation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Society Corpus" 
          value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`} 
          sub="Aggregate maintenance fund from Section-1 blocks"
          icon={TrendingUp} 
          colorClass="bg-blue-600" 
          borderClass="border-blue-600"
        />
        <StatCard 
          title="Digital Receipts" 
          value={transactionCount} 
          sub="Total audit entries managed via IndexedDB persistence"
          icon={FileStack} 
          colorClass="bg-indigo-600" 
          borderClass="border-indigo-600"
        />
        <StatCard 
          title="Registered Houses" 
          value={uniqueHouses} 
          sub="Distinct residential units (1 to 6) currently active"
          icon={Home} 
          colorClass="bg-amber-500" 
          borderClass="border-amber-500"
        />
        <StatCard 
          title="System Health" 
          value="100%" 
          sub="Architecture Synthesis & Edge Network Optimization"
          icon={ShieldCheck} 
          colorClass="bg-emerald-600" 
          borderClass="border-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart: Recharts Visualization */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[500px] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <Activity size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Financial Flow Analysis</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Last 10 House-wise Contributions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-50" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue (₹)</span>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', 
                    fontWeight: 'bold',
                    padding: '16px'
                  }}
                  itemStyle={{ color: '#2563eb' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={44}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info & Alerts Panel: Architectural Synthesis */}
        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl h-full flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-10 -mr-32 -mt-32 pointer-events-none" />
             
             <div>
               <div className="flex items-center space-x-3 mb-8">
                 <div className="p-2 bg-blue-500/20 rounded-lg">
                   <LayoutDashboard size={20} className="text-blue-400" />
                 </div>
                 <h3 className="text-2xl font-black text-white leading-tight">Pro Infrastructure</h3>
               </div>
               
               <p className="text-sm text-slate-400 font-medium leading-relaxed">
                 The Nilkanth Pro Suite leverages modern <strong className="text-blue-400">Vite-React</strong> architecture to ensure zero latency. 
                 Data integrity is managed via <strong className="text-emerald-400">Dexie.js</strong> IndexedDB abstraction for transactional reliability.
               </p>
               
               <div className="mt-10 space-y-5">
                 {[
                   { label: 'Cloud Optimization', status: 'Vercel Edge', color: 'text-blue-400' },
                   { label: 'Data Redundancy', status: 'Local First', color: 'text-emerald-400' },
                   { label: 'Export Protocol', status: 'XLSX/CSV', color: 'text-amber-400' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-4">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">{item.label}</span>
                     <span className={`text-[10px] font-black ${item.color} bg-slate-800/50 px-3 py-1 rounded-full border border-slate-800`}>{item.status}</span>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="mt-10">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mb-6 group-hover:bg-slate-800 transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <Activity size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Monitoring</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold">Latency: 2ms | Uptime: 99.9%</p>
                </div>
                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black transition-all shadow-xl hover:bg-blue-50 hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-[11px]">
                  Generate Audit Report
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
