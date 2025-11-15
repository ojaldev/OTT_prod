import React from 'react';
import { InputProps } from '../../types/Common';
import clsx from 'clsx';

interface ExtendedInputProps extends InputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {}

const Input = React.forwardRef<HTMLInputElement, ExtendedInputProps>(({
  label,
  error,
  className,
  disabled,
  required,
  ...props
}, ref) => {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
    {
      'border-gray-300': !error,
      'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': error,
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
      <input
        ref={ref}
        className={inputClasses}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

export default Input;
