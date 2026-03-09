import React from 'react';
import { LayoutDashboard, FileText, AlertTriangle, PlusCircle, Database, Zap, Save } from 'lucide-react';
import { Page } from '../App';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
}

export default function Sidebar({ activePage, setActivePage, isOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard },
    { id: 'daily-report', label: 'التقرير اليومي', icon: FileText },
    { id: 'disconnected', label: 'الخطوط المفصولة', icon: AlertTriangle },
    { id: 'add-event', label: 'إضافة حدث', icon: PlusCircle },
    { id: 'manage-sources', label: 'إدارة المصادر', icon: Database },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: Save },
  ];

  if (!isOpen) return null;

  return (
    <div className="w-64 bg-[#0B1120] text-white flex flex-col h-full shrink-0 transition-all duration-300 shadow-xl z-20 print:hidden">
      <div className="p-6 flex flex-col items-center border-b border-slate-800">
        <Zap className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-lg font-bold text-white mb-1">الشركة العامة للكهرباء</h2>
        <p className="text-xs text-slate-400">إدارة تخطيط التشغيل</p>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id as Page)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
