import React, { useState, useRef, useEffect } from 'react';
import { Sources } from '../types';
import { Database, Download, Upload, Plus, Trash2, Image as ImageIcon, X, Settings, Save } from 'lucide-react';

interface ManageSourcesProps {
  sources: Sources;
  setSources: (sources: Sources) => void;
}

export default function ManageSources({ sources, setSources }: ManageSourcesProps) {
  const headerInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(sources.timeFormat || '24h');

  const [localPrintSettings, setLocalPrintSettings] = useState({
    pdfMargin: sources.printSettings?.pdfMargin ?? 0.15,
    pdfScale: sources.printSettings?.pdfScale ?? 1.5,
    pdfFontSize: sources.printSettings?.pdfFontSize ?? 11,
    printFontSize: sources.printSettings?.printFontSize ?? 11,
    preparedBy: sources.printSettings?.preparedBy ?? '',
    approvedBy: sources.printSettings?.approvedBy ?? '',
  });

  useEffect(() => {
    setLocalPrintSettings({
      pdfMargin: sources.printSettings?.pdfMargin ?? 0.15,
      pdfScale: sources.printSettings?.pdfScale ?? 1.5,
      pdfFontSize: sources.printSettings?.pdfFontSize ?? 11,
      printFontSize: sources.printSettings?.printFontSize ?? 11,
      preparedBy: sources.printSettings?.preparedBy ?? '',
      approvedBy: sources.printSettings?.approvedBy ?? '',
    });
    setTimeFormat(sources.timeFormat || '24h');
  }, [sources.printSettings, sources.timeFormat]);

  const handleLocalSettingChange = (key: keyof typeof localPrintSettings, value: number | string) => {
    setLocalPrintSettings(prev => ({ ...prev, [key]: value }));
  };

  const savePrintSettings = () => {
    setSources({
      ...sources,
      timeFormat,
      printSettings: {
        ...sources.printSettings,
        ...localPrintSettings
      }
    });
  };

  const renderCard = (title: string, key: keyof Sources, colorClass: string) => {
    // Skip printSettings in this generic renderer
    if (key === 'printSettings') return null;
    
    const items = sources[key] as string[];
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
      if (newItem.trim() && !items.includes(newItem.trim())) {
        setSources({ ...sources, [key]: [...items, newItem.trim()] });
        setNewItem('');
      }
    };

    const handleDelete = (item: string) => {
      setSources({ ...sources, [key]: items.filter(i => i !== item) });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'headerImage' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      alert('حجم الصورة كبير جداً. يرجى اختيار صورة بحجم أقل من 1 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSources({
        ...sources,
        printSettings: {
          ...sources.printSettings,
          [type]: base64String
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'headerImage' | 'coverImage') => {
    setSources({
      ...sources,
      printSettings: {
        ...sources.printSettings,
        [type]: null
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
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

      {/* Print Settings Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-800">إعدادات النظام والطباعة</h3>
          </div>
          <button 
            onClick={savePrintSettings}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-slate-100">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">نظام الوقت</label>
            <select 
              className="border border-slate-300 rounded-lg p-2 text-right"
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value as '12h' | '24h')}
            >
              <option value="24h">نظام 24 ساعة</option>
              <option value="12h">نظام 12 ساعة (ص/م)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">هوامش ملف الـ PDF</label>
            <input 
              type="number" 
              step="0.05"
              className="border border-slate-300 rounded-lg p-2 text-left"
              value={localPrintSettings.pdfMargin}
              onChange={(e) => handleLocalSettingChange('pdfMargin', parseFloat(e.target.value))}
            />
            <span className="text-xs text-slate-500">القيمة الافتراضية: 0.15</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">دقة ملف الـ PDF (Scale)</label>
            <input 
              type="number" 
              step="0.5"
              className="border border-slate-300 rounded-lg p-2 text-left"
              value={localPrintSettings.pdfScale}
              onChange={(e) => handleLocalSettingChange('pdfScale', parseFloat(e.target.value))}
            />
            <span className="text-xs text-slate-500">القيمة الافتراضية: 1.5</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">حجم الخط في الـ PDF (px)</label>
            <input 
              type="number" 
              className="border border-slate-300 rounded-lg p-2 text-left"
              value={localPrintSettings.pdfFontSize}
              onChange={(e) => handleLocalSettingChange('pdfFontSize', parseInt(e.target.value))}
            />
            <span className="text-xs text-slate-500">القيمة الافتراضية: 11</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">حجم الخط للطباعة المباشرة (px)</label>
            <input 
              type="number" 
              className="border border-slate-300 rounded-lg p-2 text-left"
              value={localPrintSettings.printFontSize}
              onChange={(e) => handleLocalSettingChange('printFontSize', parseInt(e.target.value))}
            />
            <span className="text-xs text-slate-500">القيمة الافتراضية: 11</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">اسم المُعِد (إعداد)</label>
            <input 
              type="text" 
              className="border border-slate-300 rounded-lg p-2 text-right"
              value={localPrintSettings.preparedBy}
              onChange={(e) => handleLocalSettingChange('preparedBy', e.target.value)}
              placeholder="مثال: م. أحمد محمد"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">اسم المُعتمد (اعتماد)</label>
            <input 
              type="text" 
              className="border border-slate-300 rounded-lg p-2 text-right"
              value={localPrintSettings.approvedBy}
              onChange={(e) => handleLocalSettingChange('approvedBy', e.target.value)}
              placeholder="مثال: م. خالد عبدالله"
            />
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-slate-500" />
            الصور والشعارات
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Header Image */}
          <div className="flex flex-col gap-3">
            <label className="font-bold text-slate-700">شعار التقرير (الصورة 666)</label>
            <p className="text-xs text-slate-500">هذه الصورة ستظهر في أعلى كل صفحة عند طباعة التقرير.</p>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[150px] relative bg-slate-50">
              {sources.printSettings?.headerImage ? (
                <>
                  <img src={sources.printSettings.headerImage} alt="Header Logo" className="max-h-32 object-contain" />
                  <button 
                    onClick={() => removeImage('headerImage')}
                    className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <button 
                    onClick={() => headerInputRef.current?.click()}
                    className="text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    اختيار صورة
                  </button>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={headerInputRef}
                onChange={(e) => handleImageUpload(e, 'headerImage')}
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="flex flex-col gap-3">
            <label className="font-bold text-slate-700">شعار الغلاف (اختياري)</label>
            <p className="text-xs text-slate-500">هذه الصورة ستظهر كشعار في منتصف صفحة الغلاف. إذا لم تقم برفع صورة، سيتم استخدام الشعار الافتراضي.</p>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[150px] relative bg-slate-50">
              {sources.printSettings?.coverImage ? (
                <>
                  <img src={sources.printSettings.coverImage} alt="Cover Page" className="max-h-32 object-contain" />
                  <button 
                    onClick={() => removeImage('coverImage')}
                    className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <button 
                    onClick={() => coverInputRef.current?.click()}
                    className="text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    اختيار صورة
                  </button>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={coverInputRef}
                onChange={(e) => handleImageUpload(e, 'coverImage')}
              />
            </div>
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
