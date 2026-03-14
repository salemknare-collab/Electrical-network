import React from 'react';
import { Menu, Clock } from 'lucide-react';
import { Page } from '../App';

interface HeaderProps {
  activePage: Page;
  toggleSidebar: () => void;
}

export default function Header({ activePage, toggleSidebar }: HeaderProps) {
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'نظرة عامة على الشبكة';
      case 'daily-report': return 'سجل التقرير اليومي';
      case 'monthly-report': return 'سجل التقرير الشهري';
      case 'disconnected': return 'سجل الخطوط المفصولة حالياً';
      case 'add-event': return 'تسجيل انقطاع / عطل جديد';
      case 'manage-sources': return 'إدارة قواعد البيانات والمصادر';
      default: return '';
    }
  };

  const today = new Date().toLocaleDateString('en-CA');

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm print:hidden">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full text-sm font-medium border border-blue-100">
        <span dir="ltr">{today}</span>
        <Clock className="w-4 h-4" />
      </div>
    </header>
  );
}
