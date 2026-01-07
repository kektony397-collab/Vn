
import React from 'react';
import { LayoutDashboard, Receipt, Code, Settings, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receipts', label: 'Receipt Manager', icon: Receipt },
    { id: 'migration', label: 'ArchSynth AI', icon: Code },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden no-print">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center font-bold text-white">N</div>
            <h1 className="text-xl font-bold tracking-tight text-white">Nilkanth</h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Pro Management Suite</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-2 bg-slate-800/40 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Admin Access</p>
              <p className="text-[10px] text-slate-500">Section-1 (1 to 6)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="text-[10px] font-bold bg-emerald-100 px-2 py-1 rounded text-emerald-700 uppercase tracking-tighter">
               System Online
             </div>
             <button className="p-2 text-slate-400 hover:text-slate-600">
               <Settings size={18} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
