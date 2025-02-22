'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = '#00ff99' 
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="relative">
      <motion.div
        className={`${sizeMap[size]} rounded-full border-2 border-t-transparent`}
        style={{ borderColor: `${color}40`, borderTopColor: color }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 ${sizeMap[size]} rounded-full`}
        style={{ 
          boxShadow: `0 0 15px ${color}`,
          opacity: 0.5 
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
