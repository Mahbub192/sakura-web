import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface SystemStatsCardProps {
  stat: {
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    color: string;
    change?: string;
    changeType?: 'increase' | 'decrease' | 'neutral';
  };
  index: number;
}

const SystemStatsCard: React.FC<SystemStatsCardProps> = ({ stat, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-medium transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
        
        {stat.change && (
          <div className={`flex items-center space-x-1 text-sm ${
            stat.changeType === 'increase' ? 'text-success-600' :
            stat.changeType === 'decrease' ? 'text-error-600' :
            'text-gray-600'
          }`}>
            {stat.changeType === 'increase' && <ArrowTrendingUpIcon className="h-4 w-4" />}
            {stat.changeType === 'decrease' && <ArrowTrendingDownIcon className="h-4 w-4" />}
            <span className="font-medium">{stat.change}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SystemStatsCard;
