import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    // Base classes that won't be overridden
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
    
    // Default variant classes that can be overridden
    const variantClasses = {
      default: 'bg-slate-900 text-white hover:bg-slate-700',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border border-slate-200 hover:bg-slate-100',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      ghost: 'bg-transparent hover:bg-slate-100',
      link: 'text-slate-900 underline-offset-4 hover:underline'
    }
    
    const sizeClasses = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10'
    }
    
    // If className contains any of our variant classes, don't apply the default variant
    const hasCustomVariant = Object.values(variantClasses).some(cls => 
      className.includes(cls.split(' ')[0])
    )
    
    const finalClasses = [
      baseClasses,
      !hasCustomVariant && variantClasses[variant],
      sizeClasses[size],
      className
    ].filter(Boolean).join(' ')
    
    return (
      <button
        className={finalClasses}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
