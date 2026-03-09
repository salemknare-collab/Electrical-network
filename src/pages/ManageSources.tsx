import React, { useState } from 'react';
import { Sources } from '../types';
import { Database, Download, Upload, Plus, Trash2 } from 'lucide-react';

interface ManageSourcesProps {
  sources: Sources;
  setSources: React.Dispatch<React.SetStateAction<Sources>>;
}

export default function ManageSources({ sources, setSources }: ManageSourcesProps) {
  const renderCard = (title: string, key: keyof Sources, colorClass: string) => {
    const items = sources[key];
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
      if (newItem.trim() && !items.includes(newItem.trim())) {
        setSources(prev => ({ ...prev, [key]: [...prev[key], newItem.trim()] }));
        setNewItem('');
      }
    };

    const handleDelete = (item: string) => {
      setSources(prev => ({ ...prev, [key]: prev[key].filter(i => i !== item) }));
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-96">
        <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${colorClass}`}>
          <span className="bg-white/50 text-slate-800 text-xs font-bold px-2 py-1 rounded-full">{items.length}</span>
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <div className="p-4 border-b border-slate-100 flex gap-2">
          <input 
            type="text" 
            placeholder={`إضافة ${title}...`} 
            className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm text-right"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="bg-slate-800 text-white p-2 rounded hover:bg-slate-700">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded group">
                <button onClick={() => handleDelete(item)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
            <Upload className="w-4 h-4" /> استعادة نسخة
          </button>
          <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
            <Download className="w-4 h-4" /> تحميل نسخة احتياطية
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className="font-bold text-slate-800">إدارة البيانات الأساسية للنظام</h2>
            <p className="text-sm text-slate-500">يمكنك من هنا إدارة القيم التي تتكرر بشكل دائم لتظهر لك كخيارات ذكية عند إدخال البيانات.</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderCard('المحطات', 'stations', 'bg-emerald-50')}
        {renderCard('الإدارات', 'regions', 'bg-blue-50')}
        {renderCard('الموظفين / المدخلين', 'employees', 'bg-slate-800 text-white')}
        {renderCard('أسباب الخروج', 'reasons', 'bg-rose-50')}
        {renderCard('الجهد ك.ف', 'voltages', 'bg-amber-50')}
        {renderCard('المعدات', 'equipments', 'bg-purple-50')}
      </div>
    </div>
  );
}
