import { motion } from 'framer-motion';

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

const OptionCard = ({ option, onClick, index }: OptionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl 
                    border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300
                    transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
        <div className="flex items-start space-x-4">
          <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {option.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1 text-gray-100 group-hover:text-blue-400 transition-colors duration-300">
              {option.title}
            </h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
              {option.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface FollowUpOptionsProps {
  options: FollowUpOption[];
  onSelect: (option: FollowUpOption) => void;
}

export function FollowUpOptions({ options, onSelect }: FollowUpOptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
    >
      {options.map((option, index) => (
        <OptionCard
          key={option.id}
          option={option}
          onClick={() => onSelect(option)}
          index={index}
        />
      ))}
    </motion.div>
  );
}
