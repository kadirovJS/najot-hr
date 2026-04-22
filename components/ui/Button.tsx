'use client';

import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  isLoading, 
  icon, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-opacity-90',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600',
    outline: 'border border-gray-200 text-gray-600 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 bg-transparent shadow-none text-gray-600'
  };

  return (
    <button
      className={cn(
        'h-12 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden',
        variants[variant],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      {children}
    </button>
  );
};
