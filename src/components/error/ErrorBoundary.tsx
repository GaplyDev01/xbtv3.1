'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6" glowColor="rgba(255, 0, 102, 0.3)">
            <h2 className="text-xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-[#ff0066] text-white rounded-lg hover:bg-[#ff0066]/80 transition-colors"
            >
              Try again
            </button>
          </GlassCard>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
