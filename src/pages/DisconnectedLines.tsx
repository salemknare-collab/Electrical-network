import React from 'react';
import { Incident } from '../types';
import { Printer, AlertTriangle } from 'lucide-react';

interface DisconnectedLinesProps {
  incidents: Incident[];
  onEdit: (incident: Incident) => void;
}

export default function DisconnectedLines({ incidents, onEdit }: DisconnectedLinesProps) {
  const disconnected = incidents.filter(i => i.status === 'مفصول');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 print:block">
      <style type="text/css" media="print">
        {`@page { size: portrait; margin: 10mm; }`}
      </style>
      <div className="flex justify-between items-center print:hidden">
        <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50">
          <Printer className="w-4 h-4" /> طباعة
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:block print:overflow-visible">
        <div className="bg-red-50 p-4 border-b border-red-100 flex flex-col items-center justify-center text-red-600 print:bg-transparent print:border-none print:text-black">
          <AlertTriangle className="w-6 h-6 mb-2 print:hidden" />
          <h3 className="font-bold text-lg">المعدات المفصولة حالياً</h3>
          <p className="text-sm print:hidden">القائمة التالية تتطلب متابعة لإرجاعها للخدمة.</p>
        </div>
        <div className="overflow-x-auto print:overflow-visible print:block">
          <table className="w-full text-right text-sm print:text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-4 py-3 print:px-2 print:py-2 font-semibold">التاريخ</th>
                <th className="px-4 py-3 print:px-2 print:py-2 font-semibold">الإدارة</th>
                <th className="px-4 py-3 print:px-2 print:py-2 font-semibold">المحطة</th>
                <th className="px-4 py-3 print:px-2 print:py-2 font-semibold">المعدة</th>
                <th className="px-4 py-3 print:px-2 print:py-2 font-semibold">وقت الفصل</th>
                <th className="px-4 py-3 print:px-2 print:py-2 font-semibold">السبب والملاحظات</th>
                <th className="px-4 py-3 print:px-2 print:py-2 font-semibold text-center print:hidden">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disconnected.length > 0 ? disconnected.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 print:px-2 print:py-2">{inc.date}</td>
                  <td className="px-4 py-3 print:px-2 print:py-2">{inc.region}</td>
                  <td className="px-4 py-3 print:px-2 print:py-2 font-medium text-blue-700">{inc.station}</td>
                  <td className="px-4 py-3 print:px-2 print:py-2">
                    {inc.equipment} {inc.eqNumber} ({inc.voltage} ك.ف)
                  </td>
                  <td className="px-4 py-3 print:px-2 print:py-2 font-bold text-red-600">{inc.disconnectTime}</td>
                  <td className="px-4 py-3 print:px-2 print:py-2">
                    <div className="font-medium">{inc.reason}</div>
                    <div className="text-xs print:text-[10px] text-slate-500">{inc.notes}</div>
                  </td>
                  <td className="px-4 py-3 print:px-2 print:py-2 text-center print:hidden">
                    <button onClick={() => onEdit(inc)} className="text-blue-600 hover:underline text-xs font-medium">
                      تحديث الحالة
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-emerald-600 bg-emerald-50 font-medium">
                    الحمد لله، لا توجد أي خطوط مفصولة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
