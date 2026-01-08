
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { 
  TrendingUp, Users, Home, ShieldCheck, DollarSign, 
  Activity, FileStack, LayoutDashboard, Globe, Zap, Database 
} from 'lucide-react';

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
    <div className={`bg-white p-8 rounded-[2rem] border-l-[6px] ${borderClass} shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}>
      <div className={`absolute top-0 right-0 w-40 h-40 -mr-16 -mt-16 rounded-full opacity-[0.04] group-hover:scale-150 transition-transform duration-1000 ${colorClass}`} />
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${colorClass} text-white shadow-xl group-hover:rotate-[15deg] transition-transform duration-500`}>
          <Icon size={28} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Runtime Status</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">Synchronized</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">{title}</p>
      <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h4>
      <p className="text-xs text-slate-400 mt-4 font-bold leading-relaxed pr-6">{sub}</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* ENTERPRISE METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Society Corpus" 
          value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`} 
          sub="Aggregate financial holdings collected from Block 1-6"
          icon={TrendingUp} 
          colorClass="bg-blue-600" 
          borderClass="border-blue-600"
        />
        <StatCard 
          title="Digital Ledgers" 
          value={transactionCount} 
          sub="Audit-ready transaction records persisted in local-first DB"
          icon={FileStack} 
          colorClass="bg-indigo-600" 
          borderClass="border-indigo-600"
        />
        <StatCard 
          title="Resident Participation" 
          value={`${uniqueHouses} Units`} 
          sub="Distinct house identifiers actively contributing to society funds"
          icon={Home} 
          colorClass="bg-amber-500" 
          borderClass="border-amber-500"
        />
        <StatCard 
          title="Vercel Infrastructure" 
          value="STABLE" 
          sub="Optimized React/Vite build deployed with edge-network caching"
          icon={ShieldCheck} 
          colorClass="bg-emerald-600" 
          borderClass="border-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* INTERACTIVE ANALYTICS CHART */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col h-[550px] transition-all hover:shadow-indigo-900/5">
          <div className="flex flex-wrap items-center justify-between mb-12 gap-4">
            <div className="flex items-center space-x-5">
              <div className="p-4 bg-slate-50 rounded-[1.5rem] shadow-inner">
                <Activity size={32} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Collection Trends</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Real-time financial flow by resident location</p>
              </div>
            </div>
            <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 space-x-4">
               <div className="flex items-center space-x-2 px-3">
                 <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Revenue (₹)</span>
               </div>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} 
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 30px 60px -12px rgb(0 0 0 / 0.15)', 
                    fontWeight: 'black',
                    padding: '24px',
                    fontSize: '14px'
                  }}
                  itemStyle={{ color: '#2563eb' }}
                  labelStyle={{ marginBottom: '8px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Bar dataKey="amount" radius={[12, 12, 0, 0]} barSize={50} fill="url(#barGradient)">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SYSTEM PERFORMANCE & INSIGHTS */}
        <div className="flex flex-col space-y-8">
          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl flex-1 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[140px] opacity-[0.15] -mr-40 -mt-40 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500 rounded-full blur-[120px] opacity-[0.1] -ml-30 -mb-30 pointer-events-none" />
             
             <div className="relative z-10">
               <div className="flex items-center space-x-4 mb-10">
                 <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                   <Zap size={24} className="text-blue-400" />
                 </div>
                 <h3 className="text-2xl font-black text-white tracking-tight">System Core</h3>
               </div>
               
               <p className="text-base text-slate-400 font-bold leading-relaxed mb-10">
                 Engineered with <strong className="text-blue-400">Vite-React</strong> for instantaneous rendering. 
                 Persistence is decoupled using <strong className="text-emerald-400">IndexedDB</strong> to ensure zero-loss data integrity in offline-first scenarios.
               </p>
               
               <div className="space-y-6">
                 {[
                   { label: 'Cloud Distribution', status: 'Vercel Edge', icon: Globe },
                   { label: 'Compute Efficiency', status: 'Optimized', icon: Activity },
                   { label: 'Storage Interface', status: 'Local First', icon: Database }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                     <div className="flex items-center space-x-3">
                        <item.icon size={16} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                     </div>
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{item.status}</span>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
                <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black transition-all shadow-2xl hover:bg-blue-50 hover:-translate-y-1 active:scale-95 uppercase tracking-[0.2em] text-[11px]">
                  Perform Society Audit
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
