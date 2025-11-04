import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  fetchDoctors, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor,
  fetchCurrentDoctorProfile,
} from '../../store/slices/doctorSlice';
import { Doctor, CreateDoctorRequest } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DoctorCard from '../../components/doctors/DoctorCard';
import CreateDoctorForm from '../../components/forms/CreateDoctorForm';
import EditDoctorForm from '../../components/forms/EditDoctorForm';
import DoctorProfileCard from '../../components/doctors/DoctorProfileCard';
import { toast } from 'react-toastify';

const DoctorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAdmin, isDoctor } = useAuth();
  const { doctors, currentDoctorProfile, isLoading } = useAppSelector(state => state.doctors);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctors());
    if (isDoctor) {
      dispatch(fetchCurrentDoctorProfile());
    }
  }, [dispatch, isDoctor]);

  const handleCreateDoctor = async (data: CreateDoctorRequest) => {
    try {
      await dispatch(createDoctor(data));
      setShowCreateModal(false);
      toast.success('Doctor created successfully');
    } catch (error) {
      toast.error('Failed to create doctor');
    }
  };

  const handleUpdateDoctor = async (data: Partial<CreateDoctorRequest>) => {
    if (!selectedDoctor) return;
    
    try {
      await dispatch(updateDoctor({ id: selectedDoctor.id, data }));
      setShowEditModal(false);
      setSelectedDoctor(null);
      toast.success('Doctor updated successfully');
    } catch (error) {
      toast.error('Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId: number) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await dispatch(deleteDoctor(doctorId));
        toast.success('Doctor deleted successfully');
      } catch (error) {
        toast.error('Failed to delete doctor');
      }
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = 
      !specializationFilter || 
      doctor.specialization.toLowerCase().includes(specializationFilter.toLowerCase());
    
    return matchesSearch && matchesSpecialization;
  });

  const specializations = Array.from(new Set(doctors.map(d => d.specialization)));

  // Calculate specialization distribution
  const specializationData = useMemo(() => {
    const specCounts: Record<string, number> = {};
    doctors.forEach(doctor => {
      specCounts[doctor.specialization] = (specCounts[doctor.specialization] || 0) + 1;
    });
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
    
    return Object.entries(specCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [doctors]);

  // Calculate experience distribution
  const experienceData = useMemo(() => {
    const ranges = [
      { name: '0-5 years', min: 0, max: 5 },
      { name: '6-10 years', min: 6, max: 10 },
      { name: '11-15 years', min: 11, max: 15 },
      { name: '16-20 years', min: 16, max: 20 },
      { name: '20+ years', min: 21, max: 100 },
    ];
    
    return ranges.map(range => ({
      name: range.name,
      count: doctors.filter(d => {
        const exp = d.experience || 0;
        return exp >= range.min && exp <= range.max;
      }).length,
    }));
  }, [doctors]);

  // Calculate fee distribution
  const feeData = useMemo(() => {
    const ranges = [
      { name: '$0-100', min: 0, max: 100 },
      { name: '$101-300', min: 101, max: 300 },
      { name: '$301-500', min: 301, max: 500 },
      { name: '$501-1000', min: 501, max: 1000 },
      { name: '$1000+', min: 1001, max: 10000 },
    ];
    
    return ranges.map(range => ({
      name: range.name,
      count: doctors.filter(d => {
        const fee = d.consultationFee || 0;
        return fee >= range.min && fee <= range.max;
      }).length,
    }));
  }, [doctors]);

  const stats = [
    {
      title: 'Total Doctors',
      value: doctors.length,
      icon: UserIcon,
      color: 'from-primary-600 to-primary-700',
      bg: 'bg-primary-50',
      textColor: 'text-primary-600',
      subtitle: `${doctors.filter(d => d.user?.isActive).length} active`,
    },
    {
      title: 'Specializations',
      value: specializations.length,
      icon: AcademicCapIcon,
      color: 'from-success-600 to-success-700',
      bg: 'bg-success-50',
      textColor: 'text-success-600',
      subtitle: 'Unique fields',
    },
    {
      title: 'Avg Experience',
      value: `${Math.round(doctors.reduce((acc, d) => acc + (d.experience || 0), 0) / doctors.length || 0)} years`,
      icon: ClockIcon,
      color: 'from-secondary-600 to-secondary-700',
      bg: 'bg-secondary-50',
      textColor: 'text-secondary-600',
      subtitle: 'Average',
    },
    {
      title: 'Avg Consultation Fee',
      value: `$${Math.round(doctors.reduce((acc, d) => acc + d.consultationFee, 0) / doctors.length || 0)}`,
      icon: CurrencyDollarIcon,
      color: 'from-warning-600 to-warning-700',
      bg: 'bg-warning-50',
      textColor: 'text-warning-600',
      subtitle: 'Per consultation',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 rounded-lg p-3 text-white shadow-md">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <SparklesIcon className="h-4 w-4" />
              <h1 className="text-lg font-bold">Doctors Management</h1>
            </div>
            <p className="text-xs text-primary-100">Manage doctor profiles and information</p>
          </div>
          <div className="mt-2 sm:mt-0 flex gap-1.5">
            {isDoctor && (
              <Button
                variant="outline"
                onClick={() => setShowProfileModal(true)}
                icon={<UserIcon className="h-3 w-3" />}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30 text-white text-xs px-2 py-1"
              >
                My Profile
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                icon={<PlusIcon className="h-3 w-3" />}
                className="bg-white text-primary-600 hover:bg-gray-50 text-xs px-2 py-1"
              >
                Add Doctor
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
          >
            {/* Gradient Background */}
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-8 -mt-8`}></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-1.5">
                <div className={`p-2 rounded-md bg-gradient-to-br ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div className={`${stat.bg} px-1.5 py-0.5 rounded-full`}>
                  <span className={`text-xs font-medium ${stat.textColor}`}>
                    {stat.subtitle}
                  </span>
                </div>
              </div>
              <h3 className="text-xs font-medium text-gray-600 mb-0.5">{stat.title}</h3>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section - All in one row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Specialization Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <ChartBarIcon className="h-4 w-4 text-primary-600" />
              Specialization Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={specializationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={true}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {specializationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Experience Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <ChartBarIcon className="h-4 w-4 text-primary-600" />
              Experience Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={experienceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={10} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#6B7280" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Fee Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <ChartBarIcon className="h-4 w-4 text-primary-600" />
              Consultation Fee Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={10} />
              <YAxis stroke="#6B7280" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Enhanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm p-3 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <MagnifyingGlassIcon className="h-4 w-4 text-primary-600" />
            <h3 className="text-sm font-bold text-gray-900">Search & Filter</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUpIcon className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {filteredDoctors.length} doctors found
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Specialization Filter */}
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[160px]"
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Doctors Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <HeartIcon className="h-4 w-4 text-primary-600" />
              <h2 className="text-sm font-bold text-gray-900">
                Doctors
                <span className="ml-1.5 text-xs font-semibold text-primary-600">
                  ({filteredDoctors.length})
                </span>
              </h2>
            </div>
          </div>
        </div>
        <div className="p-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No doctors found</p>
              {isAdmin && (
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 text-sm px-3 py-1.5"
                  icon={<PlusIcon className="h-4 w-4" />}
                >
                  Add First Doctor
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDoctors.map(doctor => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onEdit={isAdmin ? (doctor) => {
                    setSelectedDoctor(doctor);
                    setShowEditModal(true);
                  } : undefined}
                  onDelete={isAdmin ? handleDeleteDoctor : undefined}
                  userRole={user?.role || 'User'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Doctor Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Doctor"
        size="lg"
      >
        <CreateDoctorForm
          onSubmit={handleCreateDoctor}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDoctor(null);
        }}
        title="Edit Doctor"
        size="lg"
      >
        {selectedDoctor && (
          <EditDoctorForm
            doctor={selectedDoctor}
            onSubmit={handleUpdateDoctor}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedDoctor(null);
            }}
          />
        )}
      </Modal>

      {/* Doctor Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="My Profile"
        size="lg"
      >
        {currentDoctorProfile && (
          <DoctorProfileCard
            doctor={currentDoctorProfile}
            onEdit={() => {
              setSelectedDoctor(currentDoctorProfile);
              setShowProfileModal(false);
              setShowEditModal(true);
            }}
          />
        )}
      </Modal>
    </motion.div>
  );
};

export default DoctorsPage;