import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SelectOption } from '../../types/Common';
import clsx from 'clsx';

interface SelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled,
  required,
  className
}) => {
  const selectClasses = clsx(
    'block w-full px-3 py-2 border rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none',
    {
      'border-gray-300': !error,
      'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500': error,
      'bg-gray-50 cursor-not-allowed': disabled
    },
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {(() => {
          // Ensure current value is visible even if it's not in options
          const val = value ?? '';
          const hasCurrent = val !== '' && options.some(o => o.value === val);
          const effectiveOptions: SelectOption[] = hasCurrent
            ? options
            : (val !== '' ? [{ value: val, label: String(val) }, ...options] : options);
          return (
            <>
              <select
                value={val}
                onChange={(e) => onChange(e.target.value)}
                className={selectClasses}
                disabled={disabled}
              >
                <option value="">{placeholder}</option>
                {effectiveOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </>
          );
        })()}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
