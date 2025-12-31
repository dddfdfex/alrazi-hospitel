
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Clock, User as UserIcon, LogOut, HeartPulse } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm no-print">
      <div className="flex items-center gap-3">
        <div className="bg-medical-blue p-2 rounded-lg text-white">
          <HeartPulse size={28} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-medical-darkBlue tracking-tight">مستشفى الرازي</h1>
          <p className="text-xs text-slate-500 font-medium">نظام إدارة المخزون الطبي الذكي</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex flex-col items-center border-x border-slate-100 px-8">
          <div className="flex items-center gap-2 text-medical-darkBlue font-bold text-lg tabular-nums">
            <Clock size={18} className="text-medical-blue" />
            {formatTime(time)}
          </div>
          <div className="text-xs text-slate-500 font-medium">{formatDate(time)}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left md:text-right">
            <p className="text-sm font-bold text-slate-700">{user.displayName}</p>
            <p className="text-[10px] bg-medical-blue/10 text-medical-darkBlue px-2 py-0.5 rounded-full inline-block">
              {user.role === 'ADMIN' ? 'مدير النظام' : 'مستخدم'}
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
