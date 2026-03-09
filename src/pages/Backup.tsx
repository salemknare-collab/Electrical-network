import React, { useRef } from 'react';
import { Download, Upload, AlertCircle, Save } from 'lucide-react';
import { Incident, Sources } from '../types';

interface BackupProps {
  incidents: Incident[];
  sources: Sources;
  onRestore: (incidents: Incident[], sources: Sources) => void;
}

export default function Backup({ incidents, sources, onRestore }: BackupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      incidents,
      sources,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_الكهرباء_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.incidents && Array.isArray(data.incidents) && data.sources) {
          if (window.confirm('تحذير: استعادة النسخة الاحتياطية ستقوم بمسح جميع البيانات الحالية. هل أنت متأكد من المتابعة؟')) {
            onRestore(data.incidents, data.sources);
            alert('تم استعادة النسخة الاحتياطية بنجاح!');
          }
        } else {
          alert('ملف النسخة الاحتياطية غير صالح أو تالف.');
        }
      } catch (error) {
        console.error('Error parsing backup file:', error);
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Save className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">النسخ الاحتياطي والاستعادة</h2>
            <p className="text-sm text-slate-500 mt-1">حفظ نسخة من جميع البيانات أو استعادتها من ملف سابق</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Download className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">تصدير نسخة احتياطية</h3>
            <p className="text-sm text-slate-600 mb-6">
              قم بتحميل ملف يحتوي على جميع الأحداث والمصادر الحالية للاحتفاظ بها كنسخة احتياطية.
            </p>
            <button
              onClick={handleExport}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              تنزيل ملف النسخة الاحتياطية
            </button>
          </div>

          {/* Import Section */}
          <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">استعادة نسخة احتياطية</h3>
            <p className="text-sm text-slate-600 mb-6">
              قم برفع ملف نسخة احتياطية سابق لاستعادة البيانات. <span className="text-red-600 font-bold">هذا الإجراء سيمسح البيانات الحالية.</span>
            </p>
            
            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              رفع ملف النسخة الاحتياطية
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 mb-1">ملاحظة هامة</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              يرجى الاحتفاظ بملفات النسخ الاحتياطي في مكان آمن. لا تقم بتعديل محتوى ملف JSON يدوياً لتجنب تلف البيانات عند الاستعادة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
