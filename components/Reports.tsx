
import React, { useState, useMemo } from 'react';
import { MedicalItem, Transaction, TransactionType } from '../types';
import { Printer, FileText, Calendar, Filter, Clock } from 'lucide-react';

interface ReportsProps {
  items: MedicalItem[];
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ items, transactions }) => {
  const [reportType, setReportType] = useState<'DAILY' | 'INVENTORY' | 'INBOUND' | 'OUTBOUND'>('DAILY');
  
  const handlePrint = () => {
    // نستخدم تأخير بسيط لضمان تحديث الـ DOM قبل الطباعة
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTxs = transactions.filter(t => t.timestamp.startsWith(today));
    const inboundTxs = transactions.filter(t => t.type === TransactionType.INBOUND);
    const outboundTxs = transactions.filter(t => t.type === TransactionType.OUTBOUND);
    
    return { todayTxs, inboundTxs, outboundTxs };
  }, [transactions]);

  const getReportTitle = () => {
    switch(reportType) {
      case 'DAILY': return `تقرير النشاط اليومي - ${new Date().toLocaleDateString('ar-EG')}`;
      case 'INVENTORY': return 'تقرير جرد المخزون الحالي';
      case 'INBOUND': return 'تقرير الواردات الإجمالي (وارد)';
      case 'OUTBOUND': return 'تقرير المصروفات والمنصرفات (منصرف)';
      default: return '';
    }
  };

  const currentReportData = useMemo(() => {
    if (reportType === 'INBOUND') return stats.inboundTxs;
    if (reportType === 'OUTBOUND') return stats.outboundTxs;
    return [];
  }, [reportType, stats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">مركز التقارير الطبية</h2>
          <p className="text-slate-500 text-sm">استخراج وطباعة تقارير مخزنية دقيقة لمستشفى الرازي</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-medical-darkBlue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-medical-blue/20 hover:bg-medical-blue hover:-translate-y-1 transition-all"
        >
          <Printer size={22} />
          طباعة التقرير (PDF)
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print mb-6">
        {[
          { id: 'DAILY', label: 'النشاط اليومي', icon: Clock },
          { id: 'INVENTORY', label: 'الجرد الحالي', icon: FileText },
          { id: 'INBOUND', label: 'سجل الوارد', icon: Calendar },
          { id: 'OUTBOUND', label: 'سجل المنصرف', icon: Filter }
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as any)}
            className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 shadow-sm ${
              reportType === type.id 
                ? 'bg-medical-blue border-medical-blue text-white shadow-medical-blue/30 scale-105' 
                : 'bg-white border-slate-100 text-slate-500 hover:border-medical-blue/30 hover:bg-slate-50'
            }`}
          >
            <type.icon size={28} />
            <span className="font-bold text-sm">{type.label}</span>
          </button>
        ))}
      </div>

      {/* منطقة التقرير - محاطة بـ div بخصائص محددة للطباعة */}
      <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-slate-100 printable-content">
        <div className="border-b-4 border-medical-blue pb-8 mb-10 flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-4xl font-black text-medical-darkBlue mb-2">مستشفى الرازي</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AL RAZI HOSPITAL - INVENTORY REPORT</p>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{getReportTitle()}</h2>
            <p className="text-slate-400 text-sm font-medium">تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')}</p>
          </div>
        </div>

        {reportType === 'DAILY' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                <p className="text-sm text-green-700 font-bold mb-1">عمليات الوارد اليوم</p>
                <p className="text-3xl font-black text-green-600">{stats.todayTxs.filter(t => t.type === TransactionType.INBOUND).length}</p>
              </div>
              <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                <p className="text-sm text-orange-700 font-bold mb-1">عمليات المنصرف اليوم</p>
                <p className="text-3xl font-black text-orange-600">{stats.todayTxs.filter(t => t.type === TransactionType.OUTBOUND).length}</p>
              </div>
            </div>
            
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-sm font-bold border-b-2 border-slate-200">
                  <th className="p-4">الوقت</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">اسم الصنف الطبي</th>
                  <th className="p-4 text-center">الكمية</th>
                  <th className="p-4">المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.todayTxs.map(tx => (
                  <tr key={tx.id} className="text-sm">
                    <td className="p-4 font-mono font-bold text-medical-blue">{new Date(tx.timestamp).toLocaleTimeString('ar-EG', { hour12: true })}</td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-black ${tx.type === TransactionType.INBOUND ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {tx.type === TransactionType.INBOUND ? 'وارد' : 'منصرف'}
                       </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{tx.itemName}</td>
                    <td className="p-4 text-center font-black">{tx.quantity}</td>
                    <td className="p-4 text-slate-500 font-semibold">{tx.username}</td>
                  </tr>
                ))}
                {stats.todayTxs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic font-bold">لا توجد حركات مسجلة لهذا اليوم حتى الآن</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'INVENTORY' && (
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm font-bold border-b-2 border-slate-200">
                <th className="p-4">الكود</th>
                <th className="p-4">اسم الصنف</th>
                <th className="p-4">الفئة</th>
                <th className="p-4 text-center">الرصيد المتبقي</th>
                <th className="p-4">الوحدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="text-sm">
                  <td className="p-4 font-mono font-bold text-slate-400">{item.code}</td>
                  <td className="p-4 font-bold text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.category}</td>
                  <td className="p-4 text-center font-black text-medical-darkBlue text-lg">{item.currentQuantity}</td>
                  <td className="p-4 text-xs text-slate-400">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {(reportType === 'INBOUND' || reportType === 'OUTBOUND') && (
           <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm font-bold border-b-2 border-slate-200">
                <th className="p-4">التاريخ والوقت</th>
                <th className="p-4">اسم الصنف الطبي</th>
                <th className="p-4 text-center">الكمية</th>
                <th className="p-4">المسؤول عن الحركة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentReportData.map(tx => (
                <tr key={tx.id} className="text-sm">
                  <td className="p-4 font-mono font-bold text-medical-blue">{new Date(tx.timestamp).toLocaleString('ar-EG', { hour12: true })}</td>
                  <td className="p-4 font-bold text-slate-800">{tx.itemName}</td>
                  <td className="p-4 text-center font-black text-lg">{tx.quantity}</td>
                  <td className="p-4 text-slate-500 font-semibold">{tx.username}</td>
                </tr>
              ))}
              {currentReportData.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic font-bold">لا توجد سجلات مطابقة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="mt-24 border-t-2 border-slate-100 pt-10 grid grid-cols-2 text-center text-sm font-bold text-slate-600">
          <div>
            توقيع أمين المخزن المسؤول
            <div className="mt-16 border-b border-dotted w-56 mx-auto border-slate-400"></div>
          </div>
          <div>
            اعتماد مدير مستشفى الرازي
            <div className="mt-16 border-b border-dotted w-56 mx-auto border-slate-400"></div>
            <p className="mt-3 text-[10px] text-slate-300 uppercase">Hospital Stamp / ختم المستشفى</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
