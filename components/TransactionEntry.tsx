
import React, { useState } from 'react';
import { MedicalItem, Transaction, TransactionType, User } from '../types';
import { dbService } from '../db';
import { Save, Plus, Minus, Search, AlertCircle } from 'lucide-react';

interface TransactionEntryProps {
  items: MedicalItem[];
  type: 'INBOUND' | 'OUTBOUND';
  user: User;
  onComplete: () => void;
}

const TransactionEntry: React.FC<TransactionEntryProps> = ({ items, type, user, onComplete }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedItemId) {
      setError('الرجاء اختيار صنف طبي');
      return;
    }

    if (quantity <= 0) {
      setError('الكمية يجب أن تكون أكبر من صفر');
      return;
    }

    if (type === 'OUTBOUND' && selectedItem && selectedItem.currentQuantity < quantity) {
      setError(`الكمية المطلوبة أكبر من المتوفر في المخزن (${selectedItem.currentQuantity})`);
      return;
    }

    const tx: Transaction = {
      id: crypto.randomUUID(),
      itemId: selectedItemId,
      itemName: selectedItem!.name,
      type: type === 'INBOUND' ? TransactionType.INBOUND : TransactionType.OUTBOUND,
      quantity: quantity,
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.displayName
    };

    await dbService.saveTransaction(tx);
    setSuccess(true);
    setQuantity(1);
    setSelectedItemId('');
    setNote('');
    onComplete();

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${type === 'INBOUND' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          {type === 'INBOUND' ? <Plus size={32} /> : <Minus size={32} />}
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          تسجيل حركة {type === 'INBOUND' ? 'وارد للمخزن' : 'منصرف من المخزن'}
        </h2>
        <p className="text-slate-500">سيتم تسجيل هذه العملية بدقة زمنية عالية (بالثانية) باسم {user.displayName}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 border border-green-100 animate-in slide-in-from-top-2 duration-300">
          <Save size={20} />
          <p className="text-sm font-bold">تم تسجيل العملية بنجاح وتحديث المخزون</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600 flex items-center justify-between">
            اختر الصنف الطبي
            {selectedItem && (
              <span className="text-xs bg-medical-blue/10 text-medical-darkBlue px-2 py-0.5 rounded-full">
                الرصيد الحالي: {selectedItem.currentQuantity} {selectedItem.unit}
              </span>
            )}
          </label>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all appearance-none"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="">اختر من القائمة...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">الكمية</label>
            <input 
              type="number"
              min="1"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-sm font-bold text-slate-600 opacity-0">الحجم</label>
            <div className="h-[46px] flex items-center pl-2 text-slate-400 font-medium text-sm">
              {selectedItem?.unit || 'وحدة'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600">ملاحظات إضافية (اختياري)</label>
          <textarea 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 h-24 resize-none"
            placeholder="مثلاً: سبب الصرف أو رقم أمر التوريد..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>

        <button 
          type="submit"
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
            type === 'INBOUND' 
              ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700' 
              : 'bg-orange-600 text-white shadow-orange-200 hover:bg-orange-700'
          }`}
        >
          {type === 'INBOUND' ? <Plus size={20} /> : <Minus size={20} />}
          تأكيد تسجيل العملية
        </button>
      </form>

      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
        <div className="bg-medical-blue text-white p-2 rounded-lg shrink-0">
          <AlertCircle size={18} />
        </div>
        <div>
          <h4 className="font-bold text-medical-darkBlue text-sm mb-1">تنبيه تقني</h4>
          <p className="text-xs text-medical-darkBlue/70 leading-relaxed">
            بمجرد الضغط على تأكيد، سيتم تسجيل العملية في قاعدة البيانات المركزية للمستشفى مع ختم زمني بالثواني يتضمن (اليوم، الشهر، السنة، الساعة، الدقيقة، الثانية). لا يمكن حذف هذه العمليات لاحقاً إلا من خلال مدير النظام لضمان النزاهة والشفافية.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionEntry;
