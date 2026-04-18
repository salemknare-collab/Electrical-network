import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Calendar, FileText, BarChart2, Printer, Grid } from 'lucide-react';
import { Incident } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import MatrixTable from '../components/MatrixTable';

interface DashboardProps {
  incidents: Incident[];
}

export default function Dashboard({ incidents }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [selectedReason, setSelectedReason] = useState<string>('');

  const allAvailableReasons = Array.from(new Set(incidents.map(i => i.reason))).sort();

  const filteredIncidents = incidents.filter(i => {
    const matchDate = (!dateFrom || i.date >= dateFrom) && (!dateTo || i.date <= dateTo);
    const matchReason = !selectedReason || i.reason === selectedReason;
    return matchDate && matchReason;
  });

  const disconnected = filteredIncidents.filter(i => i.status === 'مفصول');
  const restored = filteredIncidents.filter(i => i.status === 'مُرجع');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

  // تقرير تراكمي
  // إذا تم تحديد سبب: نجعل التجميع حسب (الإدارة + الجهد)
  // إذا لم يتم التحديد: التجميع الافتراضي
  const cumulativeData = selectedReason 
    ? Object.values(
        filteredIncidents.reduce((acc, inc) => {
          const key = `${inc.region}_${inc.voltage}`;
          if (!acc[key]) {
            acc[key] = { date: '-', region: inc.region, reason: selectedReason, voltage: inc.voltage, count: 0 };
          }
          acc[key].count += 1;
          return acc;
        }, {} as Record<string, { date: string, region: string, reason: string, voltage: string, count: number }>)
      ).sort((a, b) => a.region.localeCompare(b.region) || b.count - a.count)
    : Object.values(
        filteredIncidents.reduce((acc, inc) => {
          const key = `${inc.date}_${inc.region}_${inc.reason}_${inc.voltage}`;
          if (!acc[key]) {
            acc[key] = { date: inc.date, region: inc.region, reason: inc.reason, voltage: inc.voltage, count: 0 };
          }
          acc[key].count += 1;
          return acc;
        }, {} as Record<string, { date: string, region: string, reason: string, voltage: string, count: number }>)
      ).sort((a, b) => b.date.localeCompare(a.date) || a.region.localeCompare(b.region) || b.count - a.count);

  // إعداد بيانات المخطط البياني (الأعمدة) لدمج الإدارة مع الأسباب
  // X: الإدارة, Bars: الأسباب
  const currentReasonsForChart = selectedReason 
    ? [selectedReason] 
    : Array.from(new Set(filteredIncidents.map(i => i.reason)));

  const barChartMap: Record<string, any> = {};
  filteredIncidents.forEach(inc => {
    if (!barChartMap[inc.region]) {
      barChartMap[inc.region] = { name: inc.region };
      currentReasonsForChart.forEach(r => barChartMap[inc.region][r] = 0);
    }
    barChartMap[inc.region][inc.reason] += 1;
  });
  const barChartData = Object.values(barChartMap);

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-right" dir="rtl">
          <p className="font-bold text-slate-800 mb-2 border-b pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            entry.value > 0 && (
              <p key={index} className="text-sm flex items-center justify-between gap-4 py-1">
                <span style={{ color: entry.color }} className="font-medium">{entry.name}</span>
                <span className="font-bold bg-slate-100 px-2 py-0.5 rounded">{entry.value}</span>
              </p>
            )
          ))}
          <p className="text-sm font-bold text-slate-800 mt-2 pt-2 border-t flex justify-between">
            <span>الإجمالي:</span>
            <span>{payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>التصفية:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">من</label>
            <input type="date" className="border border-slate-200 rounded p-2 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">إلى</label>
            <input type="date" className="border border-slate-200 rounded p-2 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="mx-2 w-px h-8 bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">السبب:</label>
            <select 
              className="border border-slate-200 rounded p-2 text-sm appearance-none pr-8 pl-4 outline-none focus:border-blue-500"
              value={selectedReason} 
              onChange={e => setSelectedReason(e.target.value)}
            >
              <option value="">-- جميع الأسباب --</option>
              {allAvailableReasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Printer className="w-4 h-4" />
          طباعة الإحصائيات
        </button>
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

      <div className="mt-6">
        {/* المخطط الإحصائي المدمج كأعمدة */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col mb-6">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <BarChart2 className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-lg">
              إحصائية الخطوط المفصولة حسب الإدارة {selectedReason ? `(لسبب: ${selectedReason})` : 'والأسباب'}
            </h3>
          </div>
          <div className="flex-1 w-full flex items-center justify-center min-h-[400px]">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {currentReasonsForChart.map((reason, index) => (
                    <Bar key={reason} dataKey={reason} name={reason} stackId="a" fill={COLORS[index % COLORS.length]} radius={currentReasonsForChart.length === 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 font-medium">لا توجد بيانات لهذه التصفية</div>
            )}
          </div>
        </div>

        {/* التقرير الشامل (جدول المصفوفة) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col mb-6 print:break-inside-avoid print:shadow-none print:border-none print:p-0">
          <div className="flex items-center gap-2 mb-4 text-slate-800 shrink-0">
            <Grid className="w-5 h-5 text-blue-500 print:hidden" />
            <h3 className="font-bold text-lg">جدول يبين إجمالي حالات الفصل (الوقات) للمحولات والخطوط حسب الجهد ونوع الوقاية خلال هذه الفترة</h3>
          </div>
          <MatrixTable incidents={filteredIncidents} />
        </div>

        {/* التقرير التراكمي */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[500px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2 text-slate-800">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-lg">
                {selectedReason ? `تقرير إجمالي الأعطال لكل جهد وحده (بسبب: ${selectedReason})` : 'تقرير تراكمي مفصل'}
              </h3>
            </div>
          </div>
          <div className="overflow-auto border border-slate-200 rounded-xl flex-1">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  {!selectedReason && <th className="p-3 font-bold text-slate-700 whitespace-nowrap">التاريخ</th>}
                  <th className="p-3 font-bold text-slate-700">الإدارة</th>
                  {!selectedReason && <th className="p-3 font-bold text-slate-700">سبب الفصل</th>}
                  <th className="p-3 font-bold text-slate-700 whitespace-nowrap">الجهد (ك.ف)</th>
                  <th className="p-3 font-bold text-slate-700 text-center whitespace-nowrap">إجمالي العدد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cumulativeData.length > 0 ? (
                  cumulativeData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      {!selectedReason && <td className="p-3 text-slate-600 whitespace-nowrap" dir="ltr">{row.date}</td>}
                      <td className="p-3 font-medium text-slate-800">{row.region}</td>
                      {!selectedReason && <td className="p-3 font-medium text-slate-800">{row.reason}</td>}
                      <td className="p-3 font-bold text-blue-600" dir="ltr"><span className="bg-blue-50 px-2 py-1 rounded">{row.voltage}</span></td>
                      <td className="p-3 text-center">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">
                          {row.count}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedReason ? 2 : 5} className="p-8 text-center text-slate-500 font-medium">
                      لا توجد أحداث מסجلة تطابق هذه التصفية
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
