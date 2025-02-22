import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow';
  animate?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', animate = true, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl backdrop-blur-sm border border-white/10';
    
    const variants = {
      default: 'bg-white/5',
      glow: 'bg-white/5 shadow-[0_0_15px_rgba(57,255,20,0.2)]',
    };

    const content = (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);

Card.displayName = 'Card';

export { Card };
