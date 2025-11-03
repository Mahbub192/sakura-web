import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
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

  const stats = [
    {
      title: 'Total Doctors',
      value: doctors.length,
      icon: UserIcon,
      color: 'bg-primary-600',
    },
    {
      title: 'Specializations',
      value: specializations.length,
      icon: AcademicCapIcon,
      color: 'bg-success-600',
    },
    {
      title: 'Avg Experience',
      value: `${Math.round(doctors.reduce((acc, d) => acc + (d.experience || 0), 0) / doctors.length || 0)} years`,
      icon: ClockIcon,
      color: 'bg-secondary-600',
    },
    {
      title: 'Avg Consultation Fee',
      value: `$${Math.round(doctors.reduce((acc, d) => acc + d.consultationFee, 0) / doctors.length || 0)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-warning-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Doctors Management</h1>
          <p className="text-sm text-gray-600 mt-0.5">Manage doctor profiles and information</p>
        </div>
        <div className="mt-3 sm:mt-0 flex space-x-2">
          {isDoctor && (
            <Button
              variant="outline"
              onClick={() => setShowProfileModal(true)}
              icon={<UserIcon className="h-4 w-4" />}
              className="text-sm px-3 py-1.5"
            >
              My Profile
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<PlusIcon className="h-4 w-4" />}
              className="text-sm px-3 py-1.5"
            >
              Add New Doctor
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 input-field text-sm"
            />
          </div>

          {/* Specialization Filter */}
          <div className="flex space-x-3">
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="input-field min-w-[160px] text-sm"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Doctors ({filteredDoctors.length})
          </h2>
        </div>
        <div className="p-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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