
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  MinusCircle, 
  History, 
  FileBarChart, 
  Settings as SettingsIcon 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'inventory', label: 'قائمة الأصناف', icon: Package },
    { id: 'inbound', label: 'تسجيل وارد', icon: PlusCircle },
    { id: 'outbound', label: 'تسجيل منصرف', icon: MinusCircle },
    { id: 'history', label: 'سجل الحركات', icon: History },
    { id: 'reports', label: 'التقارير', icon: FileBarChart },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white border-l border-slate-200 py-6 no-print">
      <nav className="space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-medical-blue text-white shadow-md shadow-medical-blue/20' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-medical-darkBlue'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-medical-blue'} />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-10 px-6">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-[11px] text-slate-400 font-bold uppercase mb-2">حالة النظام</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600">متصل (قاعدة بيانات محلية)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
