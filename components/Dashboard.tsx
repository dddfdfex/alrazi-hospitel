
import React from 'react';
import { MedicalItem, Transaction, TransactionType } from '../types';
import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowLeft } from 'lucide-react';

interface DashboardProps {
  items: MedicalItem[];
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, transactions, setActiveTab }) => {
  const totalItems = items.length;
  const lowStockItems = items.filter(i => i.currentQuantity < 10);
  
  const today = new Date().toISOString().split('T')[0];
  const todayTxs = transactions.filter(t => t.timestamp.startsWith(today));
  
  const inboundCount = todayTxs.filter(t => t.type === TransactionType.INBOUND).length;
  const outboundCount = todayTxs.filter(t => t.type === TransactionType.OUTBOUND).length;

  const stats = [
    { label: 'إجمالي الأصناف', value: totalItems, icon: Package, color: 'blue' },
    { label: 'عمليات الوارد (اليوم)', value: inboundCount, icon: TrendingUp, color: 'green' },
    { label: 'عمليات المنصرف (اليوم)', value: outboundCount, icon: TrendingDown, color: 'medical-blue' },
    { label: 'أصناف قاربت على النفاذ', value: lowStockItems.length, icon: AlertTriangle, color: 'orange' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">مرحباً بك في لوحة التحكم</h2>
          <p className="text-slate-500">نظرة عامة على حالة المخزون الطبي اليوم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              أصناف قاربت على النفاذ
            </h3>
            <button 
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-medical-blue font-bold hover:underline flex items-center gap-1"
            >
              عرض الكل <ArrowLeft size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-3">الكود</th>
                  <th className="px-6 py-3">اسم الصنف</th>
                  <th className="px-6 py-3 text-center">الكمية الحالية</th>
                  <th className="px-6 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.slice(0, 5).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-400">{item.code}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                    <td className="px-6 py-4 text-center font-bold text-red-600">{item.currentQuantity} {item.unit}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] rounded-full font-bold">حرج</span>
                    </td>
                  </tr>
                ))}
                {lowStockItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">لا توجد أصناف منخفضة المخزون حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-50">
            <h3 className="font-bold text-slate-800">آخر التحركات</h3>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
            {transactions.slice(0, 8).map(tx => (
              <div key={tx.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className={`p-2 rounded-lg ${tx.type === TransactionType.INBOUND ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {tx.type === TransactionType.INBOUND ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{tx.itemName}</p>
                  <p className="text-[10px] text-slate-500">
                    {tx.type === TransactionType.INBOUND ? 'وارد' : 'منصرف'}: {tx.quantity} وحدات
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-slate-400">{new Date(tx.timestamp).toLocaleTimeString('ar-EG', { hour12: true, hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12 text-slate-400">لا توجد عمليات مسجلة حتى الآن</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
