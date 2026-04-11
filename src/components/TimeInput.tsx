import React from 'react';

interface TimeInputProps {
  value: string; // "HH:mm" or ""
  onChange: (value: string) => void;
  format: '12h' | '24h';
  className?: string;
  required?: boolean;
}

export default function TimeInput({ value, onChange, format, className = '', required = false }: TimeInputProps) {
  const hasValue = value !== '';
  const [hours, minutes] = hasValue ? value.split(':').map(Number) : [0, 0];

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '') {
      onChange('');
      return;
    }
    let newHour = parseInt(e.target.value);
    const currentMin = hasValue ? minutes : 0;
    
    if (format === '12h') {
      const isPM = hasValue ? hours >= 12 : false; // default AM
      if (isPM && newHour !== 12) newHour += 12;
      if (!isPM && newHour === 12) newHour = 0;
    }
    onChange(`${newHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '') {
      onChange('');
      return;
    }
    const newMin = parseInt(e.target.value);
    const currentHour = hasValue ? hours : 0;
    onChange(`${currentHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`);
  };

  const handleAmPmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!hasValue) {
      onChange(e.target.value === 'PM' ? '12:00' : '00:00');
      return;
    }
    const isPM = e.target.value === 'PM';
    let newHour = hours;
    if (isPM && hours < 12) newHour += 12;
    if (!isPM && hours >= 12) newHour -= 12;
    onChange(`${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  };

  const displayHour = hasValue 
    ? (format === '12h' ? (hours % 12 === 0 ? 12 : hours % 12) : hours)
    : '';

  const displayMinute = hasValue ? minutes : '';
  const ampm = hasValue ? (hours >= 12 ? 'PM' : 'AM') : 'AM';

  return (
    <div className={`flex items-center gap-1 justify-center ${className}`} dir="ltr">
      <select 
        value={displayHour} 
        onChange={handleHourChange}
        className="border border-slate-300 rounded p-2 bg-white text-center cursor-pointer outline-none focus:border-blue-500 appearance-none"
        required={required}
      >
        <option value="" disabled>--</option>
        {Array.from({ length: format === '12h' ? 12 : 24 }, (_, i) => {
          const val = format === '12h' ? i + 1 : i;
          return <option key={val} value={val}>{val.toString().padStart(2, '0')}</option>;
        })}
      </select>
      <span className="font-bold text-slate-500">:</span>
      <select 
        value={displayMinute} 
        onChange={handleMinuteChange}
        className="border border-slate-300 rounded p-2 bg-white text-center cursor-pointer outline-none focus:border-blue-500 appearance-none"
        required={required}
      >
        <option value="" disabled>--</option>
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
        ))}
      </select>
      {format === '12h' && (
        <select 
          value={ampm} 
          onChange={handleAmPmChange}
          className="border border-slate-300 rounded p-2 bg-white text-center ml-1 cursor-pointer outline-none focus:border-blue-500 appearance-none"
        >
          <option value="AM">ص</option>
          <option value="PM">م</option>
        </select>
      )}
    </div>
  );
}
