import React, { useState } from 'react';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Incident, Sources } from '../types';
import { Filter, Printer, Download, MessageCircle, Edit, Trash2, AlertTriangle, FileText, Zap } from 'lucide-react';

interface MonthlyReportProps {
  incidents: Incident[];
  sources: Sources;
  onDelete: (id: string) => void;
  onEdit: (incident: Incident) => void;
}

export default function MonthlyReport({ incidents, sources, onDelete, onEdit }: MonthlyReportProps) {
  const [filters, setFilters] = useState({
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
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
      (!filters.dateFrom || inc.date >= filters.dateFrom) &&
      (!filters.dateTo || inc.date <= filters.dateTo) &&
      (!filters.region || inc.region === filters.region) &&
      (!filters.station || inc.station === filters.station) &&
      (!filters.equipment || inc.equipment === filters.equipment) &&
      (!filters.reason || inc.reason === filters.reason) &&
      (!filters.employee || inc.employeeName === filters.employee) &&
      (!filters.status || inc.status === filters.status)
    );
  });

  // Sort by date descending
  const sortedIncidents = [...filteredIncidents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const disconnectedIncidents = sortedIncidents.filter(inc => inc.status === 'مفصول');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; padding: 10px; background-color: white; width: 100%;">
        
        <!-- Cover Page -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 1050px; text-align: center; page-break-after: always; padding-top: 10px; box-sizing: border-box;">
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
            ${filters.dateFrom === filters.dateTo 
              ? `<div>التقرير اليومي ليوم : <span style="color: #dc2626; margin-right: 8px;">${getDayName(filters.dateFrom)}</span></div>
                 <div>الموافق <span style="color: #dc2626; margin-right: 8px;">${formatDate(filters.dateFrom)}</span></div>`
              : `<div>التقرير من : <span style="color: #dc2626; margin-right: 8px;">${formatDate(filters.dateFrom)}</span></div>
                 <div>إلى : <span style="color: #dc2626; margin-right: 8px;">${formatDate(filters.dateTo)}</span></div>`
            }
          </div>
          
          <h4 style="font-size: 22px; font-weight: bold; color: #1e3a8a; border-bottom: 4px solid #1e3a8a; padding-bottom: 10px; display: inline-block; margin-bottom: 20px;">التقرير الشهري للأعطال</h4>

          <div style="width: 100%; text-align: right; font-size: 16px; font-weight: bold; color: black; margin-top: auto; line-height: 1.6;">
            <p style="margin-bottom: 6px;">صورة الى /</p>
            <p style="margin-bottom: 6px;">السيد/مساعد مدير عام الادارة العامة لشبكات الجهد المتوسط</p>
            <p style="margin-bottom: 6px;">للملــــــــــــــــــــــــــــــــــــــــــــــــــــــــف</p>
            <p style="margin-top: 12px;">طباعة / <span style="display: inline-block; min-width: 200px; border-bottom: 2px dashed black; text-align: center;">${reportName || ''}</span></p>
          </div>

          <div style="display: flex; justify-content: space-between; width: 80%; margin-top: 60px;">
            <div style="text-align: center;">
              <h4 style="font-size: 20px; font-weight: bold; margin-bottom: 50px;">إعداد</h4>
              <p style="font-size: 18px; border-top: 1px solid #000; padding-top: 10px; width: 200px; margin: 0 auto;">${sources.printSettings?.preparedBy || ''}</p>
            </div>
            <div style="text-align: center;">
              <h4 style="font-size: 20px; font-weight: bold; margin-bottom: 50px;">اعتماد</h4>
              <p style="font-size: 18px; border-top: 1px solid #000; padding-top: 10px; width: 200px; margin: 0 auto;">${sources.printSettings?.approvedBy || ''}</p>
            </div>
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
        <h2 style="text-align: center; margin-bottom: 15px; color: #000; font-size: 20px; font-weight: bold;">التقرير الشهري للأعطال</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: ${sources.printSettings?.pdfFontSize ?? 11}px; text-align: center; border: 2px solid black; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;" dir="rtl">
          <thead>
            <tr>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">التاريخ</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">الإدارة</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">المحطة</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">المعدة</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">رقم المعدة</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">الجهد</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #ef4444; font-weight: bold;">الفصل</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #10b981; font-weight: bold;">التوصيل</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">السبب</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">ملاحظات</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">الموظف</th>
              <th style="padding: 6px 4px; border: 2px solid black; background-color: #f8fafc; color: #000; font-weight: bold;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${sortedIncidents.map(inc => `
              <tr>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.date}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.region}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold; color: #1e40af;">${inc.station}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.equipment}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.eqNumber}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.voltage}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold; color: #ef4444;">${inc.disconnectTime}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold; color: #10b981;">${inc.status === 'مفصول' ? '-' : (inc.connectTime || '-')}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.reason}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.notes || ''}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.employeeName}</td>
                <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold; color: ${inc.status === 'مفصول' ? '#ef4444' : '#10b981'};">${inc.status}</td>
              </tr>
            `).join('')}
            ${sortedIncidents.length === 0 ? `
              <tr>
                <td colspan="12" style="text-align: center; padding: 15px; border: 2px solid black; color: #64748b;">لا توجد بيانات</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px; font-weight: bold; text-align: center; font-size: 16px;">
          <div style="width: 40%;">
            <p style="margin-bottom: 30px;">${sources.printSettings?.preparedBy || 'رئيس قسم المعلومات والتقارير'}</p>
            <p>........................................</p>
          </div>
          <div style="width: 40%;">
            <p style="margin-bottom: 30px;">${sources.printSettings?.approvedBy || 'مدير دائرة متابعة التشغيل'}</p>
            <p>........................................</p>
          </div>
        </div>
        
        <!-- Disconnected Lines Page -->
        <div style="page-break-before: always; padding-top: 20px;">
          <h2 style="text-align: center; margin-bottom: 15px; color: #dc2626; font-size: 20px; font-weight: bold;">المعدات المفصولة</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: ${sources.printSettings?.pdfFontSize ?? 11}px; text-align: center; border: 2px solid black; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;" dir="rtl">
            <thead>
              <tr>
                <th style="padding: 6px 4px; border: 2px solid black; background-color: #fcebeb; font-weight: bold;">التاريخ</th>
                <th style="padding: 6px 4px; border: 2px solid black; background-color: #fcebeb; font-weight: bold;">الإدارة</th>
                <th style="padding: 6px 4px; border: 2px solid black; background-color: #fcebeb; font-weight: bold;">المحطة</th>
                <th style="padding: 6px 4px; border: 2px solid black; background-color: #fcebeb; font-weight: bold;">المعدة</th>
                <th style="padding: 6px 4px; border: 2px solid black; background-color: #fcebeb; font-weight: bold;">وقت الفصل</th>
                <th style="padding: 6px 4px; border: 2px solid black; background-color: #fcebeb; font-weight: bold;">السبب والملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${disconnectedIncidents.length > 0 ? disconnectedIncidents.map(inc => `
                <tr>
                  <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.date}</td>
                  <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.region}</td>
                  <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.station}</td>
                  <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.equipment} ${inc.eqNumber} (${inc.voltage} ك.ف)</td>
                  <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold; color: #dc2626;">${inc.disconnectTime}</td>
                  <td style="padding: 6px 4px; border: 2px solid black; font-weight: bold;">${inc.reason}<br/><span style="font-size: 10px; color: #64748b;">${inc.notes || ''}</span></td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" style="padding: 15px; border: 2px solid black; font-weight: bold; text-align: center; color: #10b981;">الحمد لله، لا توجد أي خطوط مفصولة</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const opt = {
      margin:       sources.printSettings?.pdfMargin ?? 0.15,
      filename:     `${reportName || 'التقرير_الشهري'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.95 },
      html2canvas:  { scale: sources.printSettings?.pdfScale ?? 1.5, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' as const }
    };
    
    html2pdf().set(opt).from(htmlContent).save();
  };

  const handleExportExcel = () => {
    const excelData: any[][] = [];
    
    // Title row
    excelData.push(['التقرير الشهري للأعطال', '', '', '', '', '', '', '', '', '', '', '']);
    
    // Headers
    excelData.push(['التاريخ', 'الإدارة', 'المحطة', 'المعدة', 'رقم المعدة', 'الجهد', 'الفصل', 'التوصيل', 'السبب', 'ملاحظات', 'الموظف', 'الحالة']);
    
    // Data rows
    sortedIncidents.forEach(inc => {
      excelData.push([
        inc.date,
        inc.region,
        inc.station,
        inc.equipment,
        inc.eqNumber,
        inc.voltage,
        inc.disconnectTime,
        inc.status === 'مفصول' ? '-' : (inc.connectTime || '-'),
        inc.reason,
        inc.notes || '',
        inc.employeeName,
        inc.status
      ]);
    });

    // Append Disconnected Lines to Excel
    const currentRow = excelData.length;
    excelData.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    
    const discTitleRowIndex = excelData.length;
    excelData.push(['المعدات المفصولة', '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['التاريخ', 'الإدارة', 'المحطة', 'المعدة', 'وقت الفصل', 'السبب والملاحظات', '', '', '', '', '', '']);
    
    if (disconnectedIncidents.length > 0) {
      disconnectedIncidents.forEach(inc => {
        excelData.push([
          inc.date,
          inc.region,
          inc.station,
          `${inc.equipment} ${inc.eqNumber} (${inc.voltage} ك.ف)`,
          inc.disconnectTime,
          `${inc.reason} - ${inc.notes || ''}`,
          '', '', '', '', '', ''
        ]);
      });
    } else {
      excelData.push(['لا توجد خطوط مفصولة', '', '', '', '', '', '', '', '', '', '', '']);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    worksheet['!dir'] = 'rtl';
    
    // Merges
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Title
    ];
    
    worksheet['!merges'].push({ s: { r: discTitleRowIndex, c: 0 }, e: { r: discTitleRowIndex, c: 11 } });
    if (disconnectedIncidents.length === 0) {
      worksheet['!merges'].push({ s: { r: discTitleRowIndex + 2, c: 0 }, e: { r: discTitleRowIndex + 2, c: 11 } });
    }

    // Column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Region
      { wch: 20 }, // Station
      { wch: 15 }, // Eq Name
      { wch: 10 }, // Eq Number
      { wch: 10 }, // Voltage
      { wch: 10 }, // Disconnect
      { wch: 10 }, // Connect
      { wch: 25 }, // Reason
      { wch: 30 }, // Notes
      { wch: 20 }, // Employee
      { wch: 10 }  // Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "التقرير الشهري");
    
    XLSX.writeFile(workbook, `${reportName || 'التقرير_الشهري'}.xlsx`);
  };

  const handleWhatsApp = () => {
    const text = `*${reportName || 'التقرير الشهري للأعطال'} - ${new Date().toLocaleDateString('ar-LY')}*\n\n` + 
      sortedIncidents.map(inc => 
        `📅 ${inc.date}\n` +
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
    <div className="flex flex-col gap-6 relative print:block print:bg-white print:m-0 print:p-0" style={{ '--print-font-size': `${sources.printSettings?.printFontSize ?? 11}px` } as React.CSSProperties}>
      <style type="text/css" media="print">
        {`@page { size: landscape; margin: 10mm; }
          @media print {
            table { font-size: var(--print-font-size) !important; }
          }
        `}
      </style>
      
      {/* Cover Page (Print Only) */}
      <div className="hidden print:flex flex-col items-center justify-center h-[200mm] w-full bg-white text-center break-after-page pt-2 pb-4">
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
            {filters.dateFrom === filters.dateTo ? (
              <>
                <div>التقرير ليوم : <span className="text-red-600 mr-2">{getDayName(filters.dateFrom)}</span></div>
                <div>الموافق <span className="text-red-600 mr-2">{formatDate(filters.dateFrom)}</span></div>
              </>
            ) : (
              <>
                <div>التقرير من : <span className="text-red-600 mr-2">{formatDate(filters.dateFrom)}</span></div>
                <div>إلى : <span className="text-red-600 mr-2">{formatDate(filters.dateTo)}</span></div>
              </>
            )}
          </div>
          
          <h4 className="text-xl font-bold text-blue-900 mb-8 border-b-4 border-blue-900 pb-2 inline-block">التقرير الشهري للأعطال</h4>

          {/* Footer Signatures */}
          <div className="w-full text-right text-base font-bold text-black mt-auto leading-relaxed">
            <p className="mb-1">صورة الى /</p>
            <p className="mb-1">السيد/مساعد مدير عام الادارة العامة لشبكات الجهد المتوسط</p>
            <p className="mb-1">للملــــــــــــــــــــــــــــــــــــــــــــــــــــــــف</p>
            <p className="mt-4">طباعة / <span className="inline-block min-w-[200px] border-b-2 border-dashed border-black text-center">{reportName || ''}</span></p>
          </div>

          <div className="flex justify-between w-4/5 mt-16 mx-auto">
            <div className="text-center">
              <h4 className="text-xl font-bold mb-16">إعداد</h4>
              <p className="text-lg border-t border-black pt-2 w-48 mx-auto">{sources.printSettings?.preparedBy || ''}</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold mb-16">اعتماد</h4>
              <p className="text-lg border-t border-black pt-2 w-48 mx-auto">{sources.printSettings?.approvedBy || ''}</p>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">من تاريخ</label>
            <input type="date" className="w-full text-sm border border-slate-200 rounded p-2" 
              value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">إلى تاريخ</label>
            <input type="date" className="w-full text-sm border border-slate-200 rounded p-2" 
              value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
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
          <table className="w-full text-center text-sm border-collapse border-2 border-slate-300" style={{ fontSize: `var(--print-font-size, 11px)` }}>
            <thead className="bg-[#f8fafc] text-black">
              <tr>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">التاريخ</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">الإدارة</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">المحطة</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">المعدة</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">رقم المعدة</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">الجهد</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold text-red-600">الفصل</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold text-emerald-600">التوصيل</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">السبب</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">ملاحظات</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">الموظف</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold">الحالة</th>
                <th className="px-2 py-2 border-2 border-slate-300 font-bold print:hidden">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 print:break-inside-avoid bg-white">
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium">{inc.date}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium">{inc.region}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium text-blue-800">{inc.station}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium">{inc.equipment}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium">{inc.eqNumber}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium">{inc.voltage}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-bold text-red-600">{inc.disconnectTime}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-bold text-emerald-600">{inc.status === 'مفصول' ? '-' : (inc.connectTime || '-')}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium">{inc.reason}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium">{inc.notes || ''}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-medium">{inc.employeeName}</td>
                  <td className="px-2 py-2 border-2 border-slate-300 font-bold">
                    <span className={inc.status === 'مُرجع' ? 'text-emerald-600' : 'text-red-600'}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-2 py-2 border-2 border-slate-300 print:hidden">
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
              {sortedIncidents.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-slate-500 border-2 border-slate-300">
                    لا توجد أحداث مطابقة للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="hidden print:flex justify-between mt-12 text-center font-bold text-lg px-8">
          <div className="w-2/5">
            <p className="mb-8">${sources.printSettings?.preparedBy || 'رئيس قسم المعلومات والتقارير'}</p>
            <p>........................................</p>
          </div>
          <div className="w-2/5">
            <p className="mb-8">${sources.printSettings?.approvedBy || 'مدير دائرة متابعة التشغيل'}</p>
            <p>........................................</p>
          </div>
        </div>

        {/* Disconnected Lines Print Page */}
        <div className="hidden print:block break-before-page pt-8">
          <h2 className="text-center mb-6 text-red-600 text-xl font-bold">المعدات المفصولة</h2>
          <table className="w-full text-center text-sm border-collapse border-2 border-black" style={{ fontSize: `var(--print-font-size, 11px)` }}>
            <thead className="bg-[#fcebeb] text-black">
              <tr>
                <th className="px-2 py-2 border-2 border-black font-bold">التاريخ</th>
                <th className="px-2 py-2 border-2 border-black font-bold">الإدارة</th>
                <th className="px-2 py-2 border-2 border-black font-bold">المحطة</th>
                <th className="px-2 py-2 border-2 border-black font-bold">المعدة</th>
                <th className="px-2 py-2 border-2 border-black font-bold">وقت الفصل</th>
                <th className="px-2 py-2 border-2 border-black font-bold">السبب والملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {disconnectedIncidents.length > 0 ? disconnectedIncidents.map(inc => (
                <tr key={`disc-${inc.id}`} className="bg-white print:break-inside-avoid">
                  <td className="px-1 py-1 border-2 border-black font-bold">{inc.date}</td>
                  <td className="px-1 py-1 border-2 border-black font-bold">{inc.region}</td>
                  <td className="px-1 py-1 border-2 border-black font-bold">{inc.station}</td>
                  <td className="px-1 py-1 border-2 border-black font-bold">{inc.equipment} {inc.eqNumber} ({inc.voltage} ك.ف)</td>
                  <td className="px-1 py-1 border-2 border-black font-bold text-red-600">{inc.disconnectTime}</td>
                  <td className="px-1 py-1 border-2 border-black font-bold">
                    <div>{inc.reason}</div>
                    <div className="text-[10px] text-slate-600">{inc.notes}</div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-emerald-600 font-bold border-2 border-black">
                    الحمد لله، لا توجد أي خطوط مفصولة
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
