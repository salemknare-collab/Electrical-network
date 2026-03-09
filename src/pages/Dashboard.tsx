import React from 'react';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Incident } from '../types';

interface DashboardProps {
  incidents: Incident[];
}

export default function Dashboard({ incidents }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayIncidents = incidents.filter(i => i.date === today);
  const disconnected = incidents.filter(i => i.status === 'مفصول');
  const restored = incidents.filter(i => i.status === 'مُرجع');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border-r-4 border-r-blue-500 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">إجمالي أحداث اليوم</p>
            <p className="text-4xl font-bold text-slate-800">{todayIncidents.length}</p>
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
