import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, bgColor, change, changeType }) => {
  
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <motion.div
      className={`bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          {icon}
        </div>
        {change && (
          <div className={`text-sm font-medium ${getChangeColor()}`}>
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;