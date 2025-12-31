
import React, { useState } from 'react';
import { dbService } from '../db';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon, ShieldAlert, HeartPulse, Code } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await dbService.getUser(username);
      if (user && user.password === password) {
        onLogin(user);
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* عناصر جمالية في الخلفية */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-medical-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-medical-green/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <div className="bg-medical-blue p-4 rounded-3xl text-white inline-block shadow-xl shadow-medical-blue/20 mb-4 ring-4 ring-white">
          <HeartPulse size={48} />
        </div>
        <h1 className="text-3xl font-black text-medical-darkBlue tracking-tight">نظام جرد مستشفى الرازي</h1>
        <p className="text-slate-500 font-bold mt-2 flex items-center justify-center gap-2">
          <span className="w-8 h-[2px] bg-slate-200"></span>
          الإصدار الاحترافي 2026
          <span className="w-8 h-[2px] bg-slate-200"></span>
        </p>
      </div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-500 z-10">
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-medical-darkBlue rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
          <Lock size={20} />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 border border-red-100 text-sm font-bold animate-pulse">
              <ShieldAlert size={20} />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-600 pr-1">اسم المستخدم</label>
            <div className="relative">
              <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 focus:border-medical-blue transition-all"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-600 pr-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 focus:border-medical-blue transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-medical-blue text-white py-4 rounded-2xl font-bold shadow-xl shadow-medical-blue/30 hover:bg-medical-darkBlue active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'دخول إلى لوحة التحكم'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <Code size={14} />
              نظام مطور بواسطة
            </div>
            <a 
              href="https://alzozos.youware.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-black text-medical-darkBlue hover:text-medical-blue transition-colors flex items-center gap-1 group"
            >
              Alzoz OS 
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full group-hover:bg-medical-blue group-hover:text-white transition-all">
                المطور الرسمي
              </span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-1">
        <p className="text-xs text-slate-400 font-bold">© مستشفى الرازي - جميع الحقوق محفوظة 2026</p>
        <p className="text-[10px] text-slate-300 font-medium">نظام مشفر وآمن بالكامل</p>
      </div>
    </div>
  );
};

export default Login;
