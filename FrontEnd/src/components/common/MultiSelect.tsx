import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { SelectOption } from '../../types/Common';
import clsx from 'clsx';

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  values = [],
  onChange,
  options,
  placeholder = 'Select options',
  label,
  error,
  disabled,
  required,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (value: string) => {
    let newValues: string[];
    if (values.includes(value)) {
      newValues = values.filter(v => v !== value);
    } else {
      newValues = [...values, value];
    }
    onChange(newValues);
  };

  const removeValue = (value: string) => {
    const newValues = values.filter(v => v !== value);
    onChange(newValues);
  };

  const clearAll = () => {
    onChange([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectClasses = clsx(
    'block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer',
    {
      'border-gray-300 dark:border-gray-600': !error,
      'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 focus:ring-red-500 focus:border-red-500': error,
      'bg-gray-50 dark:bg-gray-900 cursor-not-allowed': disabled
    },
    className
  );

  const getSelectedLabels = () => {
    return values.map(value => {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    });
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <div
          className={selectClasses}
          onClick={toggleDropdown}
        >
          <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
            {values.length === 0 ? (
              <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
            ) : (
              getSelectedLabels().map((label, index) => (
                <div 
                  key={index} 
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-md text-xs flex items-center"
                >
                  <span>{label}</span>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeValue(values[index]);
                    }}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            {values.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="mr-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={clsx(
                  'px-3 py-2 cursor-pointer flex items-center justify-between',
                  values.includes(option.value) 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200'
                )}
                onClick={() => handleOptionClick(option.value)}
              >
                <span>{option.label}</span>
                {values.includes(option.value) && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">No options available</div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;
