'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FiHome, FiPieChart, FiMessageSquare, FiSettings, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
}

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  label: string;
}

const NavLink = ({ href, icon, label, className = '', children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <motion.div 
        className={`
          flex items-center p-3 rounded-lg 
          ${isActive ? 'bg-[#00ff99]/10 text-[#00ff99]' : 'text-gray-300'}
          hover:bg-[#00ff99]/20 hover:text-[#00ff99] transition-colors
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {icon}
        <span className="ml-3">{label}</span>
        {isActive && (
          <motion.div
            className="absolute left-0 w-1 h-8 bg-[#00ff99] rounded-r-full"
            layoutId="activeNav"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

const navItems = [
  { href: '/', icon: <FiHome size={20} />, label: 'Home' },
  { href: '/tokens', icon: <FiTrendingUp size={20} />, label: 'Token Analysis' },
  { href: '/chat', icon: <FiMessageSquare size={20} />, label: 'Chat with AI' },
  { href: '/portfolio', icon: <FiPieChart size={20} />, label: 'Portfolio' },
  { href: '/investment', icon: <FiDollarSign size={20} />, label: 'Investment' },
  { href: '/settings', icon: <FiSettings size={20} />, label: 'Settings' },
];

export default function Layout({ children }: LayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-text">
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex flex-col w-64 bg-gray-900/50 backdrop-blur-xl p-6 border-r border-gray-800/50"
      >
        <motion.div 
          className="mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00ff99] to-[#00ccff] bg-clip-text text-transparent">
            Blockswarms
          </h1>
        </motion.div>
        <nav className="space-y-1 relative">
          <AnimatePresence>
            {mounted && navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                children={item.label}
              />
            ))}
          </AnimatePresence>
        </nav>
      </motion.aside>

      {/* Mobile Header */}
      <motion.header 
        className="md:hidden p-4 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#00ff99] to-[#00ccff] bg-clip-text text-transparent">
          X Platform
        </h1>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className="flex-1 p-4 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {children}
      </motion.main>

      {/* Mobile Navigation */}
      <motion.nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/50 backdrop-blur-xl border-t border-gray-800/50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="grid grid-cols-6 gap-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label=""
              className="justify-center"
              children={item.icon}
            />
          ))}
        </div>
      </motion.nav>
    </div>
  );
}
