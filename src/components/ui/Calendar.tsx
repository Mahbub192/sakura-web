import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  appointments?: Array<{
    date: string;
    count: number;
    status: 'available' | 'booked' | 'full';
  }>;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  appointments = [],
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const getAppointmentInfo = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.find(apt => apt.date === dateStr);
  };

  const renderCalendarGrid = () => {
    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;

    // Week header
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = (
      <div key="header" className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(dayName => (
          <div key={dayName} className="p-2 text-center text-sm font-medium text-gray-500">
            {dayName}
          </div>
        ))}
      </div>
    );
    rows.push(headerRow);

    // Calendar days
    for (let i = 0; i < 42; i++) {
      const formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const appointmentInfo = getAppointmentInfo(day);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isTodayDate = isToday(day);

      days.push(
        <motion.div
          key={day.toISOString()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative p-2 text-center cursor-pointer rounded-lg transition-all duration-200
            ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
            ${isSelected ? 'bg-primary-600 text-white' : ''}
            ${isTodayDate && !isSelected ? 'bg-primary-100 text-primary-600 font-semibold' : ''}
            ${!isSelected && !isTodayDate ? 'hover:bg-gray-100' : ''}
            ${appointmentInfo ? 'border-2' : ''}
            ${appointmentInfo?.status === 'available' ? 'border-success-300' : ''}
            ${appointmentInfo?.status === 'booked' ? 'border-warning-300' : ''}
            ${appointmentInfo?.status === 'full' ? 'border-error-300' : ''}
          `}
          onClick={() => onDateSelect && onDateSelect(cloneDay)}
        >
          <span className="text-sm">{formattedDate}</span>
          {appointmentInfo && (
            <div className={`
              absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full
              ${appointmentInfo.status === 'available' ? 'bg-success-500' : ''}
              ${appointmentInfo.status === 'booked' ? 'bg-warning-500' : ''}
              ${appointmentInfo.status === 'full' ? 'bg-error-500' : ''}
            `} />
          )}
        </motion.div>
      );

      if (days.length === 7) {
        rows.push(
          <div key={day.toISOString()} className="grid grid-cols-7 gap-1">
            {days}
          </div>
        );
        days = [];
      }
      day = addDays(day, 1);
    }

    return rows;
  };

  return (
    <div className={`bg-white rounded-xl shadow-soft border border-gray-200 p-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </motion.button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <div>{renderCalendarGrid()}</div>

      {/* Legend */}
      {appointments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-error-500 mr-2"></div>
              <span className="text-gray-600">Full</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
