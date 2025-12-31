
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { dbService } from '../db';
import { ArrowDownLeft, ArrowUpRight, Search, Edit2, X, Check } from 'lucide-react';

interface TransactionsHistoryProps {
  transactions: Transaction[];
  onUpdate: () => void;
  isAdmin: boolean;
}

const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({ transactions, onUpdate, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);

  const filteredTransactions = transactions.filter(t => 
    t.itemName.includes(searchTerm) || t.username.includes(searchTerm)
  );

  const handleEditClick = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditQty(tx.quantity);
  };

  const handleSaveEdit = async (tx: Transaction) => {
    if (editQty === tx.quantity) {
      setEditingId(null);
      return;
    }
    
    await dbService.updateTransaction({ ...tx, quantity: editQty }, tx.quantity, tx.type);
    onUpdate();
    setEditingId(null);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">سجل حركات المخزن</h2>
          <p className="text-slate-500 text-sm">تتبع دقيق لجميع عمليات الوارد والمنصرف بالثانية</p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث في السجل..."
            className="bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">الصنف الطبي</th>
                <th className="px-6 py-4">الكمية</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الوقت</th>
                <th className="px-6 py-4">المسؤول</th>
                {isAdmin && <th className="px-6 py-4 text-left">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                      tx.type === TransactionType.INBOUND 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-orange-50 text-orange-600'
                    }`}>
                      {tx.type === TransactionType.INBOUND ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      {tx.type === TransactionType.INBOUND ? 'وارد' : 'منصرف'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{tx.itemName}</td>
                  <td className="px-6 py-4">
                    {editingId === tx.id ? (
                      <input 
                        type="number" 
                        className="w-20 px-2 py-1 border border-medical-blue rounded focus:outline-none"
                        value={editQty}
                        onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{tx.quantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{formatDate(tx.timestamp)}</td>
                  <td className="px-6 py-4 text-xs font-mono text-medical-darkBlue font-bold">{formatTime(tx.timestamp)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {tx.username.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{tx.username}</span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === tx.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(tx)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <Check size={16} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleEditClick(tx)} className="p-1 text-slate-400 hover:text-medical-blue hover:bg-slate-100 rounded">
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-slate-400">لا توجد عمليات مسجلة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsHistory;
