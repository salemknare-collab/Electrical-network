import React, { useState } from 'react';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Incident, Sources } from '../types';
import { Filter, Printer, Download, MessageCircle, Edit, Trash2, AlertTriangle, X, FileText, Zap } from 'lucide-react';

interface DailyReportProps {
  incidents: Incident[];
  sources: Sources;
  onDelete: (id: string) => void;
  onEdit: (incident: Incident) => void;
}

export default function DailyReport({ incidents, sources, onDelete, onEdit }: DailyReportProps) {
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; padding: 20px; background-color: white; width: 794px;">
        
        <!-- Cover Page -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 950px; text-align: center; page-break-after: always; padding-top: 10px; box-sizing: border-box;">
          <h1 style="font-size: 38px; font-weight: bold; color: #1e40af; margin-bottom: 15px;">الشركة العامة للكهرباء</h1>
          <h2 style="font-size: 28px; font-weight: bold; color: #dc2626; margin-bottom: 15px;">الإدارة العامة لشبكات الجهد المتوسط</h2>
          <h3 style="font-size: 22px; font-weight: bold; color: #dc2626; margin-bottom: 30px;">إدارة تخطيط التشغيل</h3>
          
          ${sources.printSettings?.coverImage ? `
            <div style="margin-bottom: 30px; display: flex; justify-content: center;">
              <img src="${sources.printSettings.coverImage}" alt="Cover Logo" style="max-width: 180px; max-height: 180px; object-fit: contain;" />
            </div>
          ` : `
            <div style="width: 180px; height: 180px; background-color: #1e293b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; border: 6px solid #cbd5e1; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; overflow: hidden; margin-left: auto; margin-right: auto;">
              <div style="font-size: 90px; color: #ef4444; transform: rotate(-12deg);">⚡</div>
            </div>
          `}

          <div style="width: 100%; background-color: #ffedd5; border-top: 4px solid #fed7aa; border-bottom: 4px solid #fed7aa; padding: 12px 24px; margin-bottom: 20px; display: flex; justify-content: center; gap: 60px; align-items: center; font-size: 18px; font-weight: bold; color: #1e3a8a; box-sizing: border-box;">
            <div>التقرير اليومي ليوم : <span style="color: #dc2626; margin-right: 8px;">${getDayName(filters.date)}</span></div>
            <div>الموافق <span style="color: #dc2626; margin-right: 8px;">${formatDate(filters.date)}</span></div>
          </div>
          
          <h4 style="font-size: 22px; font-weight: bold; color: #1e3a8a; border-bottom: 4px solid #1e3a8a; padding-bottom: 10px; display: inline-block; margin-bottom: 20px;">للخطوط و المحولات المفصولة بالوقاية وللصيانة</h4>

          <div style="width: 100%; text-align: right; font-size: 16px; font-weight: bold; color: black; margin-top: auto; line-height: 1.6;">
            <p style="margin-bottom: 6px;">صورة الى /</p>
            <p style="margin-bottom: 6px;">السيد/مساعد مدير عام الادارة العامة لشبكات الجهد المتوسط</p>
            <p style="margin-bottom: 6px;">للملــــــــــــــــــــــــــــــــــــــــــــــــــــــــف</p>
            <p style="margin-top: 12px;">طباعة / <span style="display: inline-block; min-width: 200px; border-bottom: 2px dashed black; text-align: center;">${reportName || ''}</span> / <span style="display: inline-block; min-width: 150px; border-bottom: 2px dashed black; text-align: center;">${formatDate(new Date().toISOString())}</span></p>
          </div>
        </div>

        <!-- Report Header -->
        ${sources.printSettings?.headerImage ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${sources.printSettings.headerImage}" alt="Header" style="max-height: 100px; object-fit: contain;" />
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; align-items: center; background-color: #0f172a; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="color: #facc15; font-size: 40px; margin-bottom: 10px;">⚡</div>
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 5px 0;">الشركة العامة للكهرباء</h1>
            <h2 style="font-size: 18px; color: #cbd5e1; margin: 0;">إدارة تخطيط التشغيل</h2>
          </div>
        `}
        ${reportName ? `<h2 style="text-align: center; margin-bottom: 20px; color: #0f172a;">${reportName}</h2>` : ''}
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: right;">
          <thead>
            <tr>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; white-space: nowrap;">الإدارة</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; white-space: nowrap;">المحطة</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; white-space: nowrap;">المعدة</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; white-space: nowrap;">رقم المعدة</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; white-space: nowrap;">الجهد</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #dc2626; white-space: nowrap;">الفصل</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #059669; white-space: nowrap;">التوصيل</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 30%;">السبب</th>
              <th style="padding: 10px 8px; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #0f172a; width: 30%;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${filteredIncidents.map((inc, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; white-space: nowrap;">${inc.region}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #1d4ed8; font-weight: bold; white-space: nowrap;">${inc.station}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; white-space: nowrap;">${inc.equipment}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; white-space: nowrap;">${inc.eqNumber}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; white-space: nowrap;">${inc.voltage} ك.ف</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #dc2626; font-weight: bold; white-space: nowrap;">${inc.disconnectTime}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #059669; font-weight: bold; white-space: nowrap;">${inc.connectTime || '-'}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; word-wrap: break-word;">${inc.reason}</td>
                <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #64748b; word-wrap: break-word;">${inc.notes || '-'}</td>
              </tr>
            `).join('')}
            ${filteredIncidents.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; padding: 20px; border: 1px solid #cbd5e1; color: #64748b;">لا توجد بيانات</td>
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
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
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

  const getDayName = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-LY', { weekday: 'long' });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  return (
    <div className="flex flex-col gap-6 relative print:block print:bg-white print:m-0 print:p-0">
      <style type="text/css" media="print">
        {`@page { size: portrait; }`}
      </style>
      {/* Cover Page (Print Only) */}
      <div className="hidden print:flex flex-col items-center justify-center h-[250mm] w-full bg-white text-center break-after-page pt-2 pb-4">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center h-full">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">الشركة العامة للكهرباء</h1>
          <h2 className="text-2xl font-bold text-red-600 mb-4">الإدارة العامة لشبكات الجهد المتوسط</h2>
          <h3 className="text-xl font-bold text-red-600 mb-6">إدارة تخطيط التشغيل</h3>
          
          {/* Logo Circle */}
          {sources.printSettings?.coverImage ? (
            <div className="w-40 h-40 mb-8 flex items-center justify-center">
              <img src={sources.printSettings.coverImage} alt="Cover Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-40 h-40 bg-[#1e293b] rounded-full flex items-center justify-center mb-8 border-[6px] border-slate-300 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-50"></div>
              <Zap className="w-20 h-20 text-red-500 fill-red-500 relative z-10 transform -rotate-12" />
            </div>
          )}

          {/* Date Banner */}
          <div className="w-full bg-orange-100 border-y-4 border-orange-200 py-3 px-6 mb-6 flex justify-between items-center text-lg font-bold text-blue-900">
            <div>التقرير اليومي ليوم : <span className="text-red-600 mr-2">{getDayName(filters.date)}</span></div>
            <div>الموافق <span className="text-red-600 mr-2">{formatDate(filters.date)}</span></div>
          </div>
          
          <h4 className="text-xl font-bold text-blue-900 mb-8 border-b-4 border-blue-900 pb-2 inline-block">للخطوط و المحولات المفصولة بالوقاية وللصيانة</h4>

          {/* Footer Signatures */}
          <div className="w-full text-right text-base font-bold text-black mt-auto leading-relaxed">
            <p className="mb-1">صورة الى /</p>
            <p className="mb-1">السيد/مساعد مدير عام الادارة العامة لشبكات الجهد المتوسط</p>
            <p className="mb-1">للملــــــــــــــــــــــــــــــــــــــــــــــــــــــــف</p>
            <p className="mt-4">طباعة / <span className="inline-block min-w-[200px] border-b-2 border-dashed border-black text-center">{reportName || ''}</span> / <span className="inline-block min-w-[150px] border-b-2 border-dashed border-black text-center">{formatDate(new Date().toISOString())}</span></p>
          </div>
        </div>
      </div>

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
        {/* Report Header (Print Only) */}
        {sources.printSettings?.headerImage ? (
          <div className="hidden print:flex flex-col items-center justify-center mb-8 w-full">
            <img src={sources.printSettings.headerImage} alt="Header" className="max-h-32 object-contain" />
          </div>
        ) : (
          <div className="hidden print:flex flex-col items-center justify-center bg-[#0f172a] text-white p-6 rounded-xl mb-8 w-full shadow-md">
            <Zap className="w-12 h-12 text-yellow-400 fill-yellow-400 mb-3" />
            <h1 className="text-3xl font-bold mb-2">الشركة العامة للكهرباء</h1>
            <h2 className="text-xl text-slate-300">إدارة تخطيط التشغيل</h2>
          </div>
        )}

        {reportName && <div className="hidden print:block text-center text-xl font-bold py-4 border-b mb-4">{reportName}</div>}
        
        <div className="overflow-x-auto print:overflow-visible print:block">
          <table className="w-full text-right text-sm print:text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 print:bg-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300">التاريخ</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300">الإدارة</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300">المحطة</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300">المعدة</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300">رقم المعدة</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300">الجهد</th>
                <th className="px-4 py-3 font-semibold text-red-600 print:border print:border-slate-300">الفصل</th>
                <th className="px-4 py-3 font-semibold text-emerald-600 print:border print:border-slate-300">التوصيل</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300">السبب</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300">ملاحظات</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300 print:hidden">الموظف</th>
                <th className="px-4 py-3 font-semibold print:border print:border-slate-300 print:hidden">الحالة</th>
                <th className="px-4 py-3 font-semibold text-center print:hidden">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((inc, index) => (
                <tr key={inc.id} className={`hover:bg-slate-50 print:break-inside-avoid ${index % 2 === 0 ? 'print:bg-white' : 'print:bg-slate-50'}`}>
                  <td className="px-4 py-3 print:border print:border-slate-300">{inc.date}</td>
                  <td className="px-4 py-3 print:border print:border-slate-300">{inc.region}</td>
                  <td className="px-4 py-3 font-medium text-blue-700 print:border print:border-slate-300">{inc.station}</td>
                  <td className="px-4 py-3 print:border print:border-slate-300">{inc.equipment}</td>
                  <td className="px-4 py-3 print:border print:border-slate-300">{inc.eqNumber}</td>
                  <td className="px-4 py-3 text-slate-500 print:border print:border-slate-300">{inc.voltage} ك.ف</td>
                  <td className="px-4 py-3 font-bold text-red-600 print:border print:border-slate-300">{inc.disconnectTime}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600 print:border print:border-slate-300">{inc.connectTime || '-'}</td>
                  <td className="px-4 py-3 print:border print:border-slate-300">{inc.reason}</td>
                  <td className="px-4 py-3 text-slate-500 print:border print:border-slate-300">{inc.notes || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 print:border print:border-slate-300 print:hidden">{inc.employeeName}</td>
                  <td className="px-4 py-3 print:border print:border-slate-300 print:hidden">
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
                  <td colSpan={13} className="px-4 py-8 text-center text-slate-500 print:border print:border-slate-300">لا توجد بيانات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
