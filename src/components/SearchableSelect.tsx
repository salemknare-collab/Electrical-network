import React from 'react';
import CreatableSelect from 'react-select/creatable';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
    borderRadius: '0.5rem',
    padding: '0.15rem',
    textAlign: 'right',
    direction: 'rtl',
    backgroundColor: 'white',
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#94a3b8'
    }
  }),
  menu: (base: any) => ({
    ...base,
    textAlign: 'right',
    direction: 'rtl',
    zIndex: 50
  }),
  option: (base: any, state: any) => ({
    ...base,
    textAlign: 'right',
    direction: 'rtl',
    backgroundColor: state.isFocused ? '#eff6ff' : 'white',
    color: '#1e293b',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#dbeafe'
    }
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#94a3b8'
  }),
  input: (base: any) => ({
    ...base,
    color: '#1e293b',
    margin: 0,
    padding: 0
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#1e293b'
  })
};

export default function SearchableSelect({ options, value, onChange, placeholder = '', required = false }: SearchableSelectProps) {
  const selectOptions = options.map(opt => ({ value: opt, label: opt }));
  const selectedOption = value ? { value, label: value } : null;

  return (
    <div className="relative w-full">
      <CreatableSelect
        isClearable
        options={selectOptions}
        value={selectedOption}
        onChange={(newValue: any) => onChange(newValue ? newValue.value : '')}
        placeholder={placeholder}
        styles={customStyles}
        formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}
        noOptionsMessage={() => "لا توجد خيارات"}
        required={required}
      />
      {/* Hidden input to handle HTML required validation */}
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, height: 0, position: 'absolute', bottom: 0, left: '50%' }}
          value={value}
          onChange={() => {}}
          required
        />
      )}
    </div>
  );
}
