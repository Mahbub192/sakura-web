import {
    ArrowTrendingUpIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { format, subDays } from 'date-fns';
import React, { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const BillingSettings: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Mock billing data - replace with actual API call
  const billingStats = {
    totalIncome: 45250.00,
    thisMonth: 12500.00,
    lastMonth: 11000.00,
    totalAppointments: 285,
    averagePerAppointment: 158.42,
    growth: 13.6,
  };

  // Generate chart data based on period
  const chartData = useMemo(() => {
    const data = [];
    const days = billingPeriod === 'week' ? 7 : billingPeriod === 'month' ? 30 : 12;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const baseAmount = billingPeriod === 'week' ? 200 : billingPeriod === 'month' ? 400 : 3500;
      const randomVariation = Math.random() * 0.3 - 0.15; // ±15% variation
      const amount = baseAmount * (1 + randomVariation);
      
      if (billingPeriod === 'year') {
        data.push({
          period: format(date, 'MMM'),
          income: Math.round(amount),
        });
      } else {
        data.push({
          period: format(date, 'MMM dd'),
          income: Math.round(amount),
        });
      }
    }
    return data;
  }, [billingPeriod]);

  return (
    <div className="flex flex-col gap-8">
      {/* Billing Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</h3>
            <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ৳{billingStats.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">All time earnings</p>
        </div>

        {/* This Month */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</h3>
            <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ৳{billingStats.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-sm">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">+{billingStats.growth}%</span>
            <span className="text-gray-500 dark:text-gray-400">vs last month</span>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</h3>
            <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {billingStats.totalAppointments}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed appointments</p>
        </div>

        {/* Average per Appointment */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average per Visit</h3>
            <CurrencyDollarIcon className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ৳{billingStats.averagePerAppointment.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Per appointment</p>
        </div>
      </div>

      {/* Income Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Income Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track your earnings over time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBillingPeriod('week')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  billingPeriod === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('month')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  billingPeriod === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('year')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  billingPeriod === 'year'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b8cee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2b8cee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="period" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickFormatter={(value) => `৳${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => `৳${value.toLocaleString()}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#2b8cee" 
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="Income"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Comparison</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ৳{billingStats.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowTrendingUpIcon className="h-5 w-5" />
                <span className="font-semibold">+{billingStats.growth}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ৳{billingStats.lastMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Consultation Fees</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ৳{(billingStats.totalIncome * 0.85).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Additional Services</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ৳{(billingStats.totalIncome * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;

