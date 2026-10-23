'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'social' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm rounded-xl',
    md: 'h-[52px] px-5 text-[15px] sm:text-base rounded-2xl min-h-[48px]',
    lg: 'h-14 px-6 text-base rounded-2xl min-h-[48px]',
  };

  const variantClasses = {
    // Primary: #4941EC brand blue
    primary:
      'bg-[#4941EC] hover:bg-[#3C35C7] text-white focus:ring-[#4941EC] shadow-sm',
    // Outline / Secondary White with subtle border and brand teal text
    outline:
      'bg-white hover:bg-gray-50/80 text-[#60CE9F] border border-gray-200 focus:ring-[#60CE9F] shadow-xs',
    // Social: White with #60CE9F border and #60CE9F text
    social:
      'bg-white hover:bg-emerald-50/30 text-[#4CAF50] sm:text-[#45B282] border-1.5 border-[#60CE9F] focus:ring-[#60CE9F] shadow-xs',
    // Ghost: Subtle link-like
    ghost:
      'bg-transparent hover:bg-gray-100/60 text-[#4941EC] focus:ring-[#4941EC]',
  };

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Memuat...</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2.5 w-full">
          {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
          <span className="truncate">{children}</span>
          {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
        </span>
      )}
    </button>
  );
}
