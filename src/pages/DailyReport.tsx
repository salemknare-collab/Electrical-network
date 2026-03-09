import React, { useState } from 'react';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Incident, Sources } from '../types';
import { Filter, Printer, Download, MessageCircle, Edit, Trash2, AlertTriangle, X, FileText } from 'lucide-react';

interface DailyReportProps {
  incidents: Incident[];
  sources: Sources;
  onDelete: (id: string) => void;
  onEdit: (incident: Incident) => void;
}

export default function DailyReport({ incidents, sources, onDelete, onEdit }: DailyReportProps) {
  const [filters, setFilters] = useState({
    date: '',
    region: '',
    station: '',
    equipment: '',
    reason: '',
    employee: '',
    status: ''
  });
  
  const [reportName, setReportName] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const filteredIncidents = incidents.filter(inc => {
    return (
      (!filters.date || inc.date === filters.date) &&
      (!filters.region || inc.region === filters.region) &&
      (!filters.station || inc.station === filters.station) &&
      (!filters.equipment || inc.equipment === filters.equipment) &&
      (!filters.reason || inc.reason === filters.reason) &&
      (!filters.employee || inc.employeeName === filters.employee) &&
      (!filters.status || inc.status === filters.status)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; padding: 20px; background-color: white; width: 1100px;">
        ${reportName ? `<h2 style="text-align: center; margin-bottom: 20px; color: #0f172a;">${reportName}</h2>` : ''}
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: right; table-layout: fixed;">
          <thead>
            <tr>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 8%;">التاريخ</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 8%;">الإدارة</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 10%;">المحطة</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 8%;">المعدة</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 8%;">رقم المعدة</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 6%;">الجهد</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #dc2626; width: 6%;">الفصل</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #059669; width: 6%;">التوصيل</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 12%;">السبب</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 14%;">ملاحظات</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 8%;">الموظف</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 6%;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${filteredIncidents.map((inc, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; word-wrap: break-word;">${inc.date}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; word-wrap: break-word;">${inc.region}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #1d4ed8; font-weight: bold; word-wrap: break-word;">${inc.station}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; word-wrap: break-word;">${inc.equipment}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; word-wrap: break-word;">${inc.eqNumber}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; word-wrap: break-word;">${inc.voltage} ك.ف</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #dc2626; font-weight: bold; word-wrap: break-word;">${inc.disconnectTime}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #059669; font-weight: bold; word-wrap: break-word;">${inc.connectTime || '-'}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; word-wrap: break-word;">${inc.reason}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #64748b; word-wrap: break-word;">${inc.notes || '-'}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; word-wrap: break-word;">${inc.employeeName}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: ${inc.status === 'مُرجع' ? '#059669' : '#dc2626'}; word-wrap: break-word;">${inc.status}</td>
              </tr>
            `).join('')}
            ${filteredIncidents.length === 0 ? `
              <tr>
                <td colspan="12" style="text-align: center; padding: 20px; border: 1px solid #cbd5e1; color: #64748b;">لا توجد بيانات</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;

    const opt = {
      margin:       0.3,
      filename:     `${reportName || 'تقرير_الأعطال'}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(htmlContent).save();
  };

  const handleExportExcel = () => {
    const headers = ['التاريخ', 'الإدارة', 'المحطة', 'المعدة', 'رقم المعدة', 'الجهد', 'الفصل', 'التوصيل', 'السبب', 'ملاحظات', 'الموظف', 'الحالة'];
    const excelData = filteredIncidents.map(inc => [
      inc.date, 
      inc.region, 
      inc.station, 
      inc.equipment,
      inc.eqNumber,
      `${inc.voltage} ك.ف`,
      inc.disconnectTime, 
      inc.connectTime || '-', 
      inc.reason, 
      inc.notes || '-', 
      inc.employeeName, 
      inc.status
    ]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
    
    worksheet['!cols'] = [
      { wch: 12 }, // التاريخ
      { wch: 15 }, // الإدارة
      { wch: 20 }, // المحطة
      { wch: 15 }, // المعدة
      { wch: 15 }, // رقم المعدة
      { wch: 10 }, // الجهد
      { wch: 10 }, // الفصل
      { wch: 10 }, // التوصيل
      { wch: 20 }, // السبب
      { wch: 30 }, // ملاحظات
      { wch: 15 }, // الموظف
      { wch: 10 }  // الحالة
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "التقرير اليومي");
    
    XLSX.writeFile(workbook, `${reportName || 'تقرير_الأعطال'}.xlsx`);
  };

  const handleWhatsApp = () => {
    const text = `*${reportName || 'تقرير الأعطال'} - ${new Date().toLocaleDateString('ar-LY')}*\n\n` + 
      filteredIncidents.map(inc => 
        `📍 *${inc.station}* (${inc.region})\n` +
        `⚡ ${inc.equipment} ${inc.eqNumber} (${inc.voltage} ك.ف)\n` +
        `🕒 فصل: ${inc.disconnectTime} | حالة: ${inc.status}\n` +
        `-------------------`
      ).join('\n');
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      onDelete(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative print:block">
      {deleteConfirmationId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">تأكيد الحذف</h3>
              <p className="text-red-600/80 text-sm">هل أنت متأكد من رغبتك في حذف هذا الحدث؟ لا يمكن التراجع عن هذه العملية.</p>
            </div>
            <div className="p-6 flex items-center gap-3 bg-slate-50">
              <button 
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
              >
                نعم، احذف الحدث
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2 mb-4 text-slate-700">
          <Filter className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold">تصفية بـ:</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">التاريخ</label>
            <input type="date" className="w-full text-sm border border-slate-200 rounded p-2" 
              value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">الإدارة</label>
            <select className="w-full text-sm border border-slate-200 rounded p-2"
              value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})}>
              <option value="">الكل</option>
              {sources.regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">المحطة</label>
            <select className="w-full text-sm border border-slate-200 rounded p-2"
              value={filters.station} onChange={e => setFilters({...filters, station: e.target.value})}>
              <option value="">الكل</option>
              {sources.stations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">المعدة</label>
            <select className="w-full text-sm border border-slate-200 rounded p-2"
              value={filters.equipment} onChange={e => setFilters({...filters, equipment: e.target.value})}>
              <option value="">الكل</option>
              {sources.equipments.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">السبب</label>
            <select className="w-full text-sm border border-slate-200 rounded p-2"
              value={filters.reason} onChange={e => setFilters({...filters, reason: e.target.value})}>
              <option value="">الكل</option>
              {sources.reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">المدخل</label>
            <select className="w-full text-sm border border-slate-200 rounded p-2"
              value={filters.employee} onChange={e => setFilters({...filters, employee: e.target.value})}>
              <option value="">الكل</option>
              {sources.employees.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">الحالة</label>
            <select className="w-full text-sm border border-slate-200 rounded p-2"
              value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">الكل</option>
              <option value="مُرجع">مُرجع</option>
              <option value="مفصول">مفصول</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
              <FileText className="w-4 h-4" /> تصدير PDF
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
              <Download className="w-4 h-4" /> تصدير Excel
            </button>
            <button onClick={handleWhatsApp} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">
              <MessageCircle className="w-4 h-4" /> واتساب
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="اسم معد التقرير (للطباعة والإكسل)" 
              className="text-sm border border-slate-200 rounded-lg p-2 w-64"
              value={reportName}
              onChange={e => setReportName(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div id="print-area" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:block print:overflow-visible">
        {reportName && <div className="hidden print:block text-center text-xl font-bold py-4 border-b">{reportName}</div>}
        <div className="overflow-x-auto print:overflow-visible print:block">
          <table className="w-full text-right text-sm print:text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
                <th className="px-4 py-3 font-semibold">الإدارة</th>
                <th className="px-4 py-3 font-semibold">المحطة</th>
                <th className="px-4 py-3 font-semibold">المعدة</th>
                <th className="px-4 py-3 font-semibold">رقم المعدة</th>
                <th className="px-4 py-3 font-semibold">الجهد</th>
                <th className="px-4 py-3 font-semibold text-red-600">الفصل</th>
                <th className="px-4 py-3 font-semibold text-emerald-600">التوصيل</th>
                <th className="px-4 py-3 font-semibold">السبب</th>
                <th className="px-4 py-3 font-semibold">ملاحظات</th>
                <th className="px-4 py-3 font-semibold">الموظف</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold text-center print:hidden">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{inc.date}</td>
                  <td className="px-4 py-3">{inc.region}</td>
                  <td className="px-4 py-3 font-medium text-blue-700">{inc.station}</td>
                  <td className="px-4 py-3">{inc.equipment}</td>
                  <td className="px-4 py-3">{inc.eqNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{inc.voltage} ك.ف</td>
                  <td className="px-4 py-3 font-bold text-red-600">{inc.disconnectTime}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{inc.connectTime || '-'}</td>
                  <td className="px-4 py-3">{inc.reason}</td>
                  <td className="px-4 py-3 text-slate-500">{inc.notes || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{inc.employeeName}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${inc.status === 'مُرجع' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onEdit(inc)} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirmationId(inc.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredIncidents.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
