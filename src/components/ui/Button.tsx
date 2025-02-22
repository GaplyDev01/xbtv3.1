import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glowColor?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, glowColor, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-neon-green/10 text-neon-green hover:bg-neon-green/20',
      outline: 'border border-neon-green/50 hover:bg-neon-green/10',
      ghost: 'hover:bg-neon-green/10 hover:text-neon-green',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-11 px-8',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glowColor && `shadow-[0_0_15px_rgba(57,255,20,0.5)]`,
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neon-green border-t-transparent" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
