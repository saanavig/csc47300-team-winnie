//Part of Admin Interface
import React from 'react';
import { ReactNode, ButtonHTMLAttributes } from 'react';
import '../styles/Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const sizeClass = size !== 'md' ? `btn--${size}` : '';
  
  return (
    <button 
      className={`btn btn--${variant} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}