import React, { useState, useEffect, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, parse } from 'date-fns';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  fetchAppointments, 
  fetchTokenAppointments,
} from '../../store/slices/appointmentSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';
import { fetchAssistants } from '../../store/slices/assistantSlice';
import { fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDoctor, isAdmin } = useAuth();
  const { appointments, tokenAppointments, isLoading } = useAppSelector(state => state.appointments);
  const { doctors, currentDoctorProfile } = useAppSelector(state => state.doctors);
  const { assistants } = useAppSelector(state => state.assistants);

  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedAssistant, setSelectedAssistant] = useState<string>('all');
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    if (isDoctor && !currentDoctorProfile) {
      dispatch(fetchCurrentDoctorProfile());
    }
    dispatch(fetchAppointments({}));
    dispatch(fetchTokenAppointments({}));
    dispatch(fetchDoctors());
    if (isDoctor) {
      dispatch(fetchAssistants());
    }
  }, [dispatch, isDoctor, currentDoctorProfile]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    let filtered = tokenAppointments;

    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59);
        return aptDate >= start && aptDate <= end;
      });
    }

    // Filter by doctor
    if (selectedDoctor !== 'all' && isAdmin) {
      const doctorId = parseInt(selectedDoctor);
      filtered = filtered.filter(apt => apt.doctorId === doctorId);
    } else if (isDoctor && currentDoctorProfile) {
      filtered = filtered.filter(apt => apt.doctorId === currentDoctorProfile.id);
    }

    // Filter by assistant (if assistant filter is implemented in backend)
    // For now, we'll just return filtered data

    return filtered;
  }, [tokenAppointments, dateRange, selectedDoctor, selectedAssistant, isDoctor, isAdmin, currentDoctorProfile]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(apt => apt.status === 'Completed').length;
    const missedOrCanceled = filteredData.filter(apt => 
      apt.status === 'Cancelled' || apt.status === 'Missed'
    ).length;
    
    // Calculate revenue (estimate based on completed appointments)
    const avgFee = currentDoctorProfile?.consultationFee || 150;
    const revenue = completed * avgFee;

    // Calculate percentage changes (mock data for now)
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
    const changePercent = 10; // Mock: +10% vs last month
    const missedChangePercent = -5; // Mock: -5% vs last month

    return {
      total,
      completed,
      missedOrCanceled,
      revenue,
      completionRate,
      changePercent,
      missedChangePercent,
      avgFee,
    };
  }, [filteredData, currentDoctorProfile]);

  // Calculate chart data based on period
  const chartData = useMemo(() => {
    if (chartPeriod === 'day') {
      // Daily data for last 30 days
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayAppointments = filteredData.filter(apt => apt.date === dateStr);
        days.push({
          date: format(date, 'MMM dd'),
          appointments: dayAppointments.length,
          completed: dayAppointments.filter(apt => apt.status === 'Completed').length,
        });
      }
      return days;
    } else if (chartPeriod === 'week') {
      // Weekly data for last 12 weeks
      const weeks = [];
      for (let i = 11; i >= 0; i--) {
        const weekStart = subDays(new Date(), i * 7);
        const weekEnd = subDays(new Date(), (i - 1) * 7);
        const weekAppointments = filteredData.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= weekStart && aptDate < weekEnd;
        });
        weeks.push({
          week: `Week ${12 - i}`,
          appointments: weekAppointments.length,
          completed: weekAppointments.filter(apt => apt.status === 'Completed').length,
        });
      }
      return weeks;
    } else {
      // Monthly data for last 12 months
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthAppointments = filteredData.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= monthStart && aptDate <= monthEnd;
        });
        months.push({
          month: format(monthDate, 'MMM yyyy'),
          appointments: monthAppointments.length,
          completed: monthAppointments.filter(apt => apt.status === 'Completed').length,
        });
      }
      return months;
    }
  }, [filteredData, chartPeriod]);

  // Calculate patient demographics
  const demographics = useMemo(() => {
    const ageGroups = {
      '0-18': 0,
      '19-45': 0,
      '46+': 0,
    };

    filteredData.forEach(apt => {
      if (apt.patientAge) {
        if (apt.patientAge <= 18) {
          ageGroups['0-18']++;
        } else if (apt.patientAge <= 45) {
          ageGroups['19-45']++;
        } else {
          ageGroups['46+']++;
        }
      }
    });

    const total = Object.values(ageGroups).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(ageGroups).map(([age, count]) => ({
      age,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [filteredData]);

  const handleApplyFilters = () => {
    // Fetch data with new filters
    const filters: any = {};
    
    if (dateRange.startDate && dateRange.endDate) {
      filters.startDate = dateRange.startDate;
      filters.endDate = dateRange.endDate;
    }
    
    if (selectedDoctor !== 'all' && isAdmin) {
      filters.doctorId = parseInt(selectedDoctor);
    } else if (isDoctor && currentDoctorProfile) {
      filters.doctorId = currentDoctorProfile.id;
    }

    dispatch(fetchAppointments(filters));
    dispatch(fetchTokenAppointments(filters));
    toast.success('Filters applied successfully');
  };

  const handleExportReports = () => {
    // Create CSV data
    const csvData = [
      ['Report Type', 'Value'],
      ['Total Appointments', stats.total],
      ['Completed', stats.completed],
      ['Missed/Canceled', stats.missedOrCanceled],
      ['Revenue (est.)', `$${stats.revenue.toLocaleString()}`],
      ['Completion Rate', `${stats.completionRate}%`],
      ['', ''],
      ['Date Range', `${format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Reports exported successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 w-full min-h-screen">
      <div className="p-8">
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">Analytics & Reports</h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">View key metrics and generate reports.</p>
            </div>
            <button 
              onClick={handleExportReports}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90"
            >
              <span className="material-symbols-outlined">download</span>
              <span className="truncate">Export All Reports</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="date-range">Date Range</label>
              <div className="flex items-center gap-2">
                <input 
                  className="flex-1 rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 px-3 py-2 text-gray-900 dark:text-white"
                  id="date-start"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input 
                  className="flex-1 rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 px-3 py-2 text-gray-900 dark:text-white"
                  id="date-end"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>
            {isAdmin && (
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="doctor">Doctor</label>
                <select 
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 px-3 py-2 text-gray-900 dark:text-white"
                  id="doctor"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="all">All Doctors</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {isDoctor && (
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="assistant">Assistant</label>
                <select 
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 px-3 py-2 text-gray-900 dark:text-white"
                  id="assistant"
                  value={selectedAssistant}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                >
                  <option value="all">All Assistants</option>
                  {assistants.map(assistant => (
                    <option key={assistant.id} value={assistant.id.toString()}>
                      {assistant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="self-end">
              <button 
                onClick={handleApplyFilters}
                className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm font-medium text-green-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">arrow_upward</span>
                <span>{stats.changePercent}% vs last month</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              <p className="text-sm font-medium text-green-500">{stats.completionRate}% Completion Rate</p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Missed / Canceled</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.missedOrCanceled}</p>
              <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">arrow_downward</span>
                <span>{stats.missedChangePercent}% vs last month</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue (est.)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">${stats.revenue.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. ${stats.avgFee} / appointment</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Appointment Volume Chart */}
            <div className="lg:col-span-3 flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appointment Volume</h3>
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-sm">
                  <button 
                    onClick={() => setChartPeriod('day')}
                    className={`px-3 py-1 rounded-md ${chartPeriod === 'day' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Day
                  </button>
                  <button 
                    onClick={() => setChartPeriod('week')}
                    className={`px-3 py-1 rounded-md ${chartPeriod === 'week' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setChartPeriod('month')}
                    className={`px-3 py-1 rounded-md ${chartPeriod === 'month' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Month
                  </button>
                </div>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2b8cee" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2b8cee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey={chartPeriod === 'day' ? 'date' : chartPeriod === 'week' ? 'week' : 'month'} 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#2b8cee" 
                      fillOpacity={1}
                      fill="url(#colorAppointments)"
                      name="Total Appointments"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10B981" 
                      fillOpacity={0.6}
                      fill="#10B981"
                      name="Completed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Patient Demographics */}
            <div className="lg:col-span-2 flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Patient Demographics</h3>
              <div className="w-full h-80 flex flex-col items-center justify-center gap-4">
                {demographics.length > 0 ? (
                  <div className="flex flex-col items-center gap-2 w-full mt-4">
                    {demographics.map((demo, index) => (
                      <div key={demo.age} className="w-full">
                        <div className="flex items-center justify-between w-full text-sm mb-1">
                          <span className="text-gray-500 dark:text-gray-400">Age {demo.age}</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{demo.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-blue-400' : 
                              index === 1 ? 'bg-primary' : 
                              'bg-teal-400'
                            }`}
                            style={{ width: `${demo.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500">No demographic data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

