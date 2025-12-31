
import React, { useState } from 'react';
import { User } from '../types';
import { dbService } from '../db';
import { Key, User as UserIcon, Save, ShieldCheck, UserCircle } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!username.trim()) {
      setMsg({ type: 'error', text: 'اسم المستخدم لا يمكن أن يكون فارغاً' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'كلمات المرور غير متطابقة' });
      return;
    }

    // التحقق من توفر اسم المستخدم الجديد إذا تم تغييره
    if (username !== user.username) {
      const existingUser = await dbService.getUser(username);
      if (existingUser) {
        setMsg({ type: 'error', text: 'اسم المستخدم هذا مستخدم بالفعل' });
        return;
      }
    }

    const updatedUser: User = {
      ...user,
      id: username, // المعرف الأساسي يعتمد على اسم المستخدم في هذا النظام
      username: username,
      displayName: displayName,
      password: newPassword || user.password
    };

    try {
      // إذا تغير اسم المستخدم، يجب حذف السجل القديم وإضافة سجل جديد
      if (username !== user.username) {
        await dbService.deleteUser(user.id);
      }
      
      await dbService.saveUser(updatedUser);
      onUpdateUser(updatedUser);
      setNewPassword('');
      setConfirmPassword('');
      setMsg({ type: 'success', text: 'تم تحديث البيانات بنجاح. استخدم اسم المستخدم الجديد في المرة القادمة.' });
    } catch (error) {
      setMsg({ type: 'error', text: 'حدث خطأ أثناء حفظ التغييرات' });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">إعدادات الحساب</h2>
        <p className="text-slate-500 text-sm">تغيير بيانات الدخول الشخصية</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 border shadow-sm animate-in slide-in-from-top-2 duration-300 ${
          msg.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'
        }`}>
          <ShieldCheck size={20} />
          {msg.text}
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <UserCircle size={16} className="text-medical-blue" /> اسم العرض
          </label>
          <input 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
            placeholder="الاسم الذي يظهر في التقارير"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <UserIcon size={16} className="text-medical-blue" /> اسم المستخدم
          </label>
          <input 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
            placeholder="اسم تسجيل الدخول"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mr-1 font-medium italic">* تغيير اسم المستخدم سيتطلب استخدامه في عملية تسجيل الدخول القادمة.</p>
        </div>

        <div className="pt-4 border-t border-slate-50">
          <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
            <Key size={16} className="text-medical-blue" /> تغيير كلمة المرور
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">كلمة المرور الجديدة</label>
              <input 
                type="password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
                placeholder="اتركها فارغة لعدم التغيير"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">تأكيد كلمة المرور</label>
              <input 
                type="password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
                placeholder="أعد كتابة كلمة المرور الجديدة"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-medical-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-medical-blue/20 hover:bg-medical-darkBlue active:scale-[0.98] transition-all"
        >
          <Save size={20} />
          حفظ التغييرات
        </button>
      </form>
    </div>
  );
};

export default Settings;
