'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  validationTag?: string;
  validationTagType?: 'info' | 'success' | 'warning';
  error?: string;
  borderVariant?: 'default' | 'primary';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export default function Input({
  label,
  validationTag,
  validationTagType = 'info',
  error,
  borderVariant = 'primary',
  leftIcon,
  rightIcon,
  type = 'text',
  id,
  className = '',
  containerClassName = '',
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const tagColorClasses = {
    info: 'text-[#4941EC] bg-indigo-50 border-indigo-100',
    success: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-700 bg-amber-50 border-amber-100',
  };

  const borderClass = error
    ? 'border-[1.5px] border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
    : borderVariant === 'primary'
    ? 'border-[1.5px] border-[#4941EC]/35 hover:border-[#4941EC]/60 focus:border-[#4941EC] focus:ring-2 focus:ring-indigo-100/70'
    : 'border-[1.5px] border-gray-200 hover:border-gray-300 focus:border-[#4941EC] focus:ring-2 focus:ring-indigo-100';

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {(label || validationTag) && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          {label && (
            <label
              htmlFor={inputId}
              className="font-medium text-[#4941EC] select-none text-[15px]"
            >
              {label}
            </label>
          )}
          {validationTag && (
            <span
              className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${tagColorClasses[validationTagType]}`}
            >
              {validationTag}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          className={`w-full h-[50px] bg-white text-gray-900 text-sm sm:text-base rounded-xl transition-all duration-150 outline-none placeholder:text-gray-400/80 ${
            leftIcon ? 'pl-11' : 'pl-4'
          } ${isPassword || rightIcon ? 'pr-11' : 'pr-4'} ${borderClass} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            className="absolute right-3.5 p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3.5 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
