'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search for tokens..." 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <motion.div
        animate={{
          boxShadow: isFocused
            ? [
                '0 0 0 #00ff99',
                '0 0 20px #00ff99',
                '0 0 40px #00ff99',
                '0 0 20px #00ff99',
                '0 0 0 #00ff99',
              ]
            : '0 0 0 #00ff99',
        }}
        transition={{
          duration: 2,
          repeat: isFocused ? Infinity : 0,
          repeatType: "reverse",
        }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm 
                   text-white rounded-lg border-2 border-[#00ff99]/50
                   focus:outline-none focus:border-[#00ff99]
                   placeholder-gray-400 transition-colors duration-200"
        />
        
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-lg opacity-20"
          animate={{
            background: [
              'linear-gradient(45deg, #00ff99, #00ccff)',
              'linear-gradient(45deg, #00ccff, #ff0066)',
              'linear-gradient(45deg, #ff0066, #00ff99)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </motion.div>

      {/* Search icon */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-[#00ff99]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{
            scale: isFocused ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isFocused ? Infinity : 0,
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </motion.svg>
      </div>
    </form>
  );
}
