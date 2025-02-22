'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement>, MotionProps {
  glowColor?: string;
  neonBorder?: boolean;
  animate?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    glowColor = 'rgba(57,255,20,0.3)', 
    neonBorder = false,
    animate = true,
    children,
    ...props 
  }, ref) => {
    const baseStyles = cn(
      'relative overflow-hidden rounded-xl backdrop-blur-md',
      'bg-white/5 border border-white/10',
      neonBorder && 'border-neon-green',
      className
    );

    const content = (
      <div
        ref={ref}
        className={baseStyles}
        style={{
          boxShadow: `0 0 20px ${glowColor}`,
        }}
        {...props}
      >
        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );

    if (!animate) return content;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {content}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
