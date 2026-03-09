import React, { useState } from 'react';
import { Incident, Sources } from '../types';
import { User, Calendar, CheckCircle2, Edit2, Search } from 'lucide-react';

interface AddEventProps {
  sources: Sources;
  session: { employeeName: string; date: string } | null;
  setSession: (session: { employeeName: string; date: string } | null) => void;
  onSave: (incident: Incident) => void;
}

export default function AddEvent({ sources, session, setSession, onSave }: AddEventProps) {
  const [loginForm, setLoginForm] = useState({
    employeeName: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [timeType, setTimeType] = useState<'specific' | 'previous'>('specific');

  const [formData, setFormData] = useState<Partial<Incident>>({
    status: 'مفصول',
    disconnectTime: '',
    connectTime: '',
    notes: '',
    region: '',
    station: '',
    equipment: '',
    eqNumber: '',
    voltage: '',
    reason: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.employeeName && loginForm.date) {
      setSession(loginForm);
      setFormData(prev => ({ ...prev, date: loginForm.date, employeeName: loginForm.employeeName }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      disconnectTime: timeType === 'previous' ? 'فصل سابق' : formData.disconnectTime,
      id: Date.now().toString(),
      date: session!.date,
      employeeName: session!.employeeName
    } as Incident);
    
    setFormData({
      status: 'مفصول',
      disconnectTime: '',
      connectTime: '',
      notes: '',
      region: '',
      station: '',
      equipment: '',
      eqNumber: '',
      voltage: '',
      reason: ''
    });
    setTimeType('specific');
    alert('تم حفظ الحدث بنجاح!');
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-8 text-center text-white">
          <User className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-xl font-bold mb-2">تسجيل الدخول لجلسة الإدخال</h2>
          <p className="text-blue-100 text-sm">يرجى إدخال اسمك وتاريخ اليوم قبل البدء بإضافة الأحداث</p>
        </div>
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم الموظف / مناوب التشغيل</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                required
                className="w-full border border-slate-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 appearance-none"
                value={loginForm.employeeName}
                onChange={e => setLoginForm({...loginForm, employeeName: e.target.value})}
              >
                <option value="">ابحث عن اسمك أو قم بإضافته...</option>
                {sources.employees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> تاريخ إدخال الحدث
            </label>
            <input 
              type="date" 
              required
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              value={loginForm.date}
              onChange={e => setLoginForm({...loginForm, date: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-lg mt-4 hover:bg-blue-600 hover:text-white transition-colors"
          >
            الدخول لصفحة الإضافة
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
        <button 
          onClick={() => setSession(null)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-200"
        >
          <Edit2 className="w-4 h-4" /> تغيير بيانات المدخل
        </button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <Calendar className="w-5 h-5" /> التاريخ: {session.date}
          </div>
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <User className="w-5 h-5" /> المدخل: {session.employeeName}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
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
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            {timeType === 'specific' ? (
              <input type="time" required className="border border-slate-300 rounded-lg p-2 w-32 text-center bg-white"
                value={formData.disconnectTime} onChange={e => setFormData({...formData, disconnectTime: e.target.value})} />
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

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-center font-bold text-slate-700 mb-4">حالة المعدة الآن؟</h3>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.status === 'مُرجع' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-200'}`}>
              <span className="font-bold">تم إرجاعها للخدمة</span>
              <input type="radio" name="status" value="مُرجع" className="hidden"
                checked={formData.status === 'مُرجع'} onChange={() => setFormData({...formData, status: 'مُرجع'})} />
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.status === 'مفصول' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 hover:border-red-200'}`}>
              <span className="font-bold">باقي مفصول</span>
              <input type="radio" name="status" value="مفصول" className="hidden"
                checked={formData.status === 'مفصول'} onChange={() => setFormData({...formData, status: 'مفصول'})} />
            </label>
          </div>

          {formData.status === 'مُرجع' && (
            <div className="mt-6 flex items-center justify-end gap-4 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <input type="time" required className="border border-emerald-300 rounded-lg p-2 w-32 text-center"
                value={formData.connectTime} onChange={e => setFormData({...formData, connectTime: e.target.value})} />
              <span className="text-sm font-bold text-emerald-800">وقت الترجيع</span>
            </div>
          )}
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

        <button type="submit" className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> حفظ البيانات وتسجيل الحدث
        </button>
      </form>
    </div>
  );
}
