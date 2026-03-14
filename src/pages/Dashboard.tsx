import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { Incident } from '../types';

interface DashboardProps {
  incidents: Incident[];
}

export default function Dashboard({ incidents }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const filteredIncidents = incidents.filter(i => {
    return (!dateFrom || i.date >= dateFrom) && (!dateTo || i.date <= dateTo);
  });

  const disconnected = filteredIncidents.filter(i => i.status === 'مفصول');
  const restored = filteredIncidents.filter(i => i.status === 'مُرجع');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>فترة الإحصائيات:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">من</label>
          <input type="date" className="border border-slate-200 rounded p-2 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">إلى</label>
          <input type="date" className="border border-slate-200 rounded p-2 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border-r-4 border-r-blue-500 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">إجمالي الأحداث</p>
            <p className="text-4xl font-bold text-slate-800">{filteredIncidents.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl text-blue-500">
            <Activity className="w-8 h-8" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border-r-4 border-r-red-500 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">خطوط باقي مفصولة</p>
            <p className="text-4xl font-bold text-red-600">{disconnected.length}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border-r-4 border-r-emerald-500 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">خطوط تم إرجاعها</p>
            <p className="text-4xl font-bold text-emerald-600">{restored.length}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
