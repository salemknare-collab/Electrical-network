import React, { useState } from 'react';
import { Incident, Sources } from '../types';
import { XCircle, CheckCircle2 } from 'lucide-react';
import TimeInput from './TimeInput';

interface EditModalProps {
  incident: Incident;
  sources: Sources;
  onClose: () => void;
  onSave: (incident: Incident) => void;
}

export default function EditIncidentModal({ incident, sources, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<Incident>(incident);
  const [timeType, setTimeType] = useState<'specific' | 'previous'>(
    incident.disconnectTime === 'فصل سابق' ? 'previous' : 'specific'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      disconnectTime: timeType === 'previous' ? 'فصل سابق' : formData.disconnectTime,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">تعديل بيانات الحدث</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">الإدارة / المنطقة</label>
              <select required className="w-full border border-slate-300 rounded-lg p-3 text-right"
                value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                <option value="">اكتب أو اختر إدارة...</option>
                {sources.regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">اسم المحطة</label>
              <select required className="w-full border border-slate-300 rounded-lg p-3 text-right"
                value={formData.station} onChange={e => setFormData({...formData, station: e.target.value})}>
                <option value="">اكتب أو اختر محطة...</option>
                {sources.stations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">المعدة (النوع والاسم)</label>
              <select required className="w-full border border-slate-300 rounded-lg p-3 text-right"
                value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})}>
                <option value="">مثال: الربط، المحول...</option>
                {sources.equipments.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">رقم المعدة</label>
              <input type="text" required className="w-full border border-slate-300 rounded-lg p-3 text-right" placeholder="مثال: 1"
                value={formData.eqNumber} onChange={e => setFormData({...formData, eqNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">الجهد (ك.ف)</label>
              <select required className="w-full border border-slate-300 rounded-lg p-3 text-right"
                value={formData.voltage} onChange={e => setFormData({...formData, voltage: e.target.value})}>
                <option value="">مثال: 30</option>
                {sources.voltages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">التاريخ</label>
              <input type="date" required className="w-full border border-slate-300 rounded-lg p-3 text-right"
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">اسم الموظف</label>
              <select required className="w-full border border-slate-300 rounded-lg p-3 text-right"
                value={formData.employeeName} onChange={e => setFormData({...formData, employeeName: e.target.value})}>
                <option value="">اختر الموظف...</option>
                {sources.employees.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              {timeType === 'specific' ? (
                <TimeInput 
                  value={formData.disconnectTime || ''} 
                  onChange={val => setFormData({...formData, disconnectTime: val})} 
                  format={sources.timeFormat || '24h'} 
                  required 
                />
              ) : (
                <div className="border border-slate-300 bg-slate-100 text-slate-500 rounded-lg p-2 w-32 text-center font-medium">
                  فصل سابق
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium">تحديد وقت</span>
                <input type="radio" name="timeType" checked={timeType === 'specific'} onChange={() => setTimeType('specific')} className="w-4 h-4 text-blue-600 cursor-pointer" />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium">فصل سابق</span>
                <input type="radio" name="timeType" checked={timeType === 'previous'} onChange={() => { setTimeType('previous'); setFormData({...formData, disconnectTime: ''}); }} className="w-4 h-4 text-blue-600 cursor-pointer" />
              </label>
              <span className="text-sm font-bold text-slate-700 ml-4">وقت الفصل</span>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              {formData.status === 'مُرجع' ? (
                <TimeInput 
                  value={formData.connectTime || ''} 
                  onChange={val => setFormData({...formData, connectTime: val})} 
                  format={sources.timeFormat || '24h'} 
                  required 
                />
              ) : (
                <div className="border border-slate-300 bg-slate-100 text-slate-500 rounded-lg p-2 w-32 text-center font-medium">
                  باقي مفصول
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium">تحديد وقت</span>
                <input type="radio" name="status" checked={formData.status === 'مُرجع'} onChange={() => setFormData({...formData, status: 'مُرجع'})} className="w-4 h-4 text-emerald-600 cursor-pointer" />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium">باقي مفصول</span>
                <input type="radio" name="status" checked={formData.status === 'مفصول'} onChange={() => setFormData({...formData, status: 'مفصول', connectTime: ''})} className="w-4 h-4 text-emerald-600 cursor-pointer" />
              </label>
              <span className="text-sm font-bold text-slate-700 ml-4">وقت الترجيع</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">سبب الخروج</label>
              <select required className="w-full border border-slate-300 rounded-lg p-3 text-right"
                value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}>
                <option value="">اكتب أو اختر السبب الأساسي...</option>
                {sources.reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">الملاحظات والإجراءات المتخذة (اختياري)</label>
              <textarea rows={3} className="w-full border border-slate-300 rounded-lg p-3 resize-none text-right" placeholder="أضف أي تفاصيل أخرى أو ملاحظات إضافية حول هذا العطل..."
                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 bg-slate-100 font-medium rounded-xl hover:bg-slate-200 transition-colors">
              إلغاء
            </button>
            <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
