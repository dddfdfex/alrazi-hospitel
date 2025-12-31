
import React, { useState } from 'react';
import { MedicalItem } from '../types';
import { dbService } from '../db';
import { Plus, Search, Filter, Trash2, Edit3, X, Check } from 'lucide-react';

interface InventoryProps {
  items: MedicalItem[];
  onUpdate: () => void;
  isAdmin: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ items, onUpdate, isAdmin }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState<Partial<MedicalItem>>({
    name: '',
    code: '',
    category: '',
    unit: '',
    currentQuantity: 0
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.code) return;

    const item: MedicalItem = {
      id: crypto.randomUUID(),
      name: newItem.name!,
      code: newItem.code!,
      category: newItem.category || 'عام',
      unit: newItem.unit || 'وحدة',
      currentQuantity: newItem.currentQuantity || 0,
      addedAt: new Date().toISOString()
    };

    await dbService.saveItem(item);
    onUpdate();
    setShowAddModal(false);
    setNewItem({ name: '', code: '', category: '', unit: '', currentQuantity: 0 });
  };

  const filteredItems = items.filter(i => 
    i.name.includes(searchTerm) || i.code.includes(searchTerm) || i.category.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">مخزون الأصناف الطبية</h2>
          <p className="text-slate-500 text-sm">إدارة وتتبع جميع المستلزمات والأدوات الطبية</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="بحث عن صنف..."
              className="bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 focus:border-medical-blue transition-all w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-medical-blue text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-medical-blue/10 hover:bg-medical-darkBlue transition-colors"
          >
            <Plus size={18} />
            إضافة صنف جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">الكود</th>
                <th className="px-6 py-4">اسم الصنف</th>
                <th className="px-6 py-4">الفئة</th>
                <th className="px-6 py-4 text-center">الكمية المتوفرة</th>
                <th className="px-6 py-4">الوحدة</th>
                <th className="px-6 py-4">تاريخ الإضافة</th>
                <th className="px-6 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">{item.code}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${item.currentQuantity < 10 ? 'text-red-500' : 'text-medical-darkBlue'}`}>
                      {item.currentQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{item.unit}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(item.addedAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-medical-blue hover:bg-medical-blue/5 rounded-lg transition-colors">
                        <Edit3 size={16} />
                      </button>
                      {isAdmin && (
                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">لا توجد أصناف تطابق بحثك</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-medical-blue text-white">
              <h3 className="text-xl font-bold">إضافة صنف طبي جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-500 mr-1">اسم الصنف الطبي *</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20"
                    placeholder="مثل: شاش معقم، بنادول 500 ملجم..."
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 mr-1">كود الصنف *</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20"
                    placeholder="M-001"
                    value={newItem.code}
                    onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 mr-1">الفئة</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  >
                    <option value="أدوية">أدوية</option>
                    <option value="مستلزمات جراحية">مستلزمات جراحية</option>
                    <option value="معدات طبية">معدات طبية</option>
                    <option value="مختبرات">مختبرات</option>
                    <option value="عام">عام</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 mr-1">الوحدة</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20"
                    placeholder="كرتون، شريط، علبة..."
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 mr-1">الكمية الافتتاحية</label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20"
                    value={newItem.currentQuantity}
                    onChange={(e) => setNewItem({...newItem, currentQuantity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-medical-blue text-white py-3 rounded-xl font-bold hover:bg-medical-darkBlue transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  حفظ الصنف
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
