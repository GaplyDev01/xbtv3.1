import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface FollowUpOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface OptionCardProps {
  option: FollowUpOption;
  onClick: () => void;
  index: number;
}

const item = {
  hidden: { opacity: 0, x: -20, transition: { duration: 0.1 } },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.1 } }
};

const OptionCard = ({ option, onClick, index }: OptionCardProps) => {
  return (
    <motion.button
      variants={item}
      onClick={onClick}
      className="group w-full text-left"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-lg rounded-xl 
                    border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300
                    hover:shadow-lg hover:shadow-emerald-500/20 relative overflow-hidden
                    group-hover:bg-gradient-to-br group-hover:from-emerald-500/20 group-hover:to-emerald-600/20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0
                      group-hover:from-emerald-500/0 group-hover:via-emerald-500/5 group-hover:to-emerald-500/0
                      transition-all duration-1000 ease-out transform translate-x-[-100%] group-hover:translate-x-[100%]"/>
        <div className="flex items-center space-x-3 relative z-10">
          <div className="text-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            {option.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300 truncate">
              {option.title}
            </h3>
            <p className="text-sm text-emerald-300/70 group-hover:text-emerald-300/90 transition-colors duration-300 truncate">
              {option.description}
            </p>
          </div>
          <ArrowRight 
            className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" 
          />
        </div>
      </div>
    </motion.button>
  );
};

interface FollowUpOptionsProps {
  options: FollowUpOption[];
  onSelect: (option: FollowUpOption) => void;
}

const container = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: 'auto',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export function FollowUpOptions({ options, onSelect }: FollowUpOptionsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <AnimatePresence mode="sync">
          {options.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              onClick={() => onSelect(option)}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
