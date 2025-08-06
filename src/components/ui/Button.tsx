import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive' | 'outline' | 'link'
  size?: 'default' | 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  asChild?: boolean
  children: React.ReactNode
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    default: 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 focus:ring-yellow-500 shadow-lg hover:shadow-xl',
    primary: 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 focus:ring-yellow-500 shadow-lg hover:shadow-xl',
    secondary: 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus:ring-blue-500',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-600',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
    destructive: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    link: 'text-blue-500 hover:text-blue-400 underline-offset-4 hover:underline focus:ring-blue-500'
  }
  
  const sizes = {
    default: 'px-6 py-3 text-base',
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    icon: 'h-10 w-10 p-0'
  }

  if (asChild) {
    // For asChild, we return the children with the classes applied
    return React.cloneElement(children as React.ReactElement, {
      className: cn(
        baseClasses,
        variants[variant],
        sizes[size],
        (children as any)?.props?.className,
        className
      ),
      ...props
    })
  }

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}