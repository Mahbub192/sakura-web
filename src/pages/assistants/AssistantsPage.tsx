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
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  fetchAssistants,
  createAssistant,
  updateAssistant,
  deleteAssistant,
  toggleAssistantStatus,
  changeAssistantPassword,
} from '../../store/slices/assistantSlice';
import { Assistant, CreateAssistantRequest, UpdateAssistantRequest } from '../../services/assistantService';
import { fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const AssistantsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDoctor } = useAuth();
  const { assistants, isLoading } = useAppSelector(state => state.assistants);
  const { currentDoctorProfile } = useAppSelector(state => state.doctors);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newAssistantCredentials, setNewAssistantCredentials] = useState<{ email: string; password: string } | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [formData, setFormData] = useState<CreateAssistantRequest & { password?: string; doctorId?: number }>({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: undefined,
    doctorId: 0,
    password: '',
  });
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });

  useEffect(() => {
    if (isDoctor && !currentDoctorProfile) {
      dispatch(fetchCurrentDoctorProfile());
    }
    dispatch(fetchAssistants());
  }, [dispatch, isDoctor, currentDoctorProfile]);

  useEffect(() => {
    if (currentDoctorProfile) {
      setFormData(prev => ({ ...prev, doctorId: currentDoctorProfile.id }));
    }
  }, [currentDoctorProfile]);

  const handleCreateAssistant = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Remove password and doctorId before sending - backend handles these automatically
      const { password, doctorId, ...requestData } = formData;
      await dispatch(createAssistant(requestData)).unwrap();
      setShowCreateModal(false);
      
      // Show credentials modal with default password
      setNewAssistantCredentials({
        email: formData.email,
        password: 'password123', // Default password set by backend
      });
      setShowCredentialsModal(true);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        qualification: '',
        experience: undefined,
        doctorId: currentDoctorProfile?.id || 0,
        password: '', // Not sent to backend, kept for form state
      });
    } catch (error: any) {
      // Redux thunk rejects with the error message from backend
      const errorMessage = error || 'Failed to create assistant';
      toast.error(errorMessage);
      console.error('Create assistant error:', error);
    }
  };

  const handleUpdateAssistant = async () => {
    if (!selectedAssistant || !formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updateData: UpdateAssistantRequest = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        qualification: formData.qualification,
        experience: formData.experience,
      };
      await dispatch(updateAssistant({ id: selectedAssistant.id, data: updateData })).unwrap();
      setShowEditModal(false);
      setSelectedAssistant(null);
      toast.success('Assistant updated successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to update assistant');
    }
  };

  const handleDeleteAssistant = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this assistant?')) {
      try {
        await dispatch(deleteAssistant(id)).unwrap();
        toast.success('Assistant deleted successfully');
      } catch (error: any) {
        toast.error(error || 'Failed to delete assistant');
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await dispatch(toggleAssistantStatus(id)).unwrap();
      toast.success('Assistant status updated');
    } catch (error: any) {
      toast.error(error || 'Failed to update status');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.password || !passwordData.confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!selectedAssistant) return;

    try {
      await dispatch(changeAssistantPassword({ id: selectedAssistant.id, password: passwordData.password })).unwrap();
      setShowPasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setSelectedAssistant(null);
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to change password');
    }
  };

  const openEditModal = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setFormData({
      name: assistant.name,
      email: assistant.email,
      phone: assistant.phone,
      qualification: assistant.qualification || '',
      experience: assistant.experience,
      doctorId: assistant.doctorId,
      password: '',
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setPasswordData({ password: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const filteredAssistants = assistants.filter(assistant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      assistant.name.toLowerCase().includes(searchLower) ||
      assistant.email.toLowerCase().includes(searchLower) ||
      assistant.phone.includes(searchTerm) ||
      (assistant.qualification && assistant.qualification.toLowerCase().includes(searchLower))
    );
  });

  // Calculate status distribution for charts
  const statusData = useMemo(() => {
    const active = assistants.filter(a => a.isActive).length;
    const inactive = assistants.filter(a => !a.isActive).length;
    
    return [
      { name: 'Active', value: active, color: '#10B981' },
      { name: 'Inactive', value: inactive, color: '#EF4444' },
    ];
  }, [assistants]);

  // Calculate experience distribution
  const experienceData = useMemo(() => {
    const ranges = [
      { name: '0-2 years', min: 0, max: 2 },
      { name: '3-5 years', min: 3, max: 5 },
      { name: '6-10 years', min: 6, max: 10 },
      { name: '10+ years', min: 11, max: 100 },
    ];
    
    return ranges.map(range => ({
      name: range.name,
      count: assistants.filter(a => {
        const exp = a.experience || 0;
        return exp >= range.min && exp <= range.max;
      }).length,
    }));
  }, [assistants]);

  const stats = [
    {
      title: 'Total Assistants',
      value: assistants.length,
      icon: UserIcon,
      color: 'from-primary-600 to-primary-700',
      bg: 'bg-primary-50',
      textColor: 'text-primary-600',
      subtitle: 'All assistants',
    },
    {
      title: 'Active Assistants',
      value: assistants.filter(a => a.isActive).length,
      icon: CheckCircleIcon,
      color: 'from-success-600 to-success-700',
      bg: 'bg-success-50',
      textColor: 'text-success-600',
      subtitle: 'Currently active',
    },
    {
      title: 'Inactive Assistants',
      value: assistants.filter(a => !a.isActive).length,
      icon: XCircleIcon,
      color: 'from-red-600 to-red-700',
      bg: 'bg-red-50',
      textColor: 'text-red-600',
      subtitle: 'Deactivated',
    },
    {
      title: 'Avg Experience',
      value: `${Math.round(assistants.reduce((acc, a) => acc + (a.experience || 0), 0) / assistants.length || 0)} years`,
      icon: ClockIcon,
      color: 'from-secondary-600 to-secondary-700',
      bg: 'bg-secondary-50',
      textColor: 'text-secondary-600',
      subtitle: 'Average',
    },
  ];

  if (!isDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only doctors can manage assistants.</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg font-bold">Assistants Management</h1>
            </div>
            <p className="text-xs text-primary-100">Manage your assistants</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <Button
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  qualification: '',
                  experience: undefined,
                  doctorId: currentDoctorProfile?.id || 0,
                  password: '',
                });
                setShowCreateModal(true);
              }}
              className="bg-white text-primary-600 hover:bg-gray-50 text-xs px-2 py-1"
              icon={<PlusIcon className="h-3 w-3" />}
            >
              Add Assistant
            </Button>
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

      {/* Charts Section */}
      {assistants.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ChartBarIcon className="h-4 w-4 text-primary-600" />
                Status Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={true}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
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
        </div>
      )}

      {/* Enhanced Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm p-3 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <MagnifyingGlassIcon className="h-4 w-4 text-primary-600" />
            <h3 className="text-sm font-bold text-gray-900">Search Assistants</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUpIcon className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {filteredAssistants.length} found
            </span>
          </div>
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or qualification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </motion.div>

      {/* Assistants List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : filteredAssistants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200"
        >
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">No Assistants Found</h3>
          <p className="text-sm text-gray-600 mb-3">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first assistant'}
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="text-xs px-3 py-1.5"
              icon={<PlusIcon className="h-3.5 w-3.5" />}
            >
              Add Assistant
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-primary-600" />
                <h2 className="text-sm font-bold text-gray-900">
                  Assistants
                  <span className="ml-1.5 text-xs font-semibold text-primary-600">
                    ({filteredAssistants.length})
                  </span>
                </h2>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAssistants.map((assistant, index) => (
                <motion.div
                  key={assistant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-md flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {assistant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{assistant.name}</h3>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
                          assistant.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {assistant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <EnvelopeIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                      <span className="truncate">{assistant.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <PhoneIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                      <span>{assistant.phone}</span>
                    </div>
                    {assistant.qualification && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <AcademicCapIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                        <span className="truncate">{assistant.qualification}</span>
                      </div>
                    )}
                    {assistant.experience && (
                      <div className="text-xs text-gray-500">
                        {assistant.experience} years experience
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => openEditModal(assistant)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                      title="Edit"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => openPasswordModal(assistant)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors text-xs font-medium"
                      title="Change Password"
                    >
                      <LockClosedIcon className="h-3.5 w-3.5" />
                      Password
                    </button>
                    <button
                      onClick={() => handleToggleStatus(assistant.id)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors text-xs font-medium ${
                        assistant.isActive
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      title={assistant.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {assistant.isActive ? (
                        <XCircleIcon className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteAssistant(assistant.id)}
                      className="px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Assistant"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A default password will be automatically set for the assistant. They can change it after logging in.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input
                type="number"
                value={formData.experience || ''}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssistant}>
                Create Assistant
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAssistant(null);
          }}
          title="Edit Assistant"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input
                type="number"
                value={formData.experience || ''}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => {
                setShowEditModal(false);
                setSelectedAssistant(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAssistant}>
                Update Assistant
              </Button>
            </div>
          </div>
        </Modal>

        {/* Credentials Modal - Show after creating assistant */}
        <Modal
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false);
            setNewAssistantCredentials(null);
          }}
          title="Assistant Created Successfully!"
        >
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <p className="text-sm text-green-800 mb-3">
                <strong>✅ Assistant account created successfully!</strong>
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Please share these login credentials with the assistant:
              </p>
              
              <div className="bg-white p-4 rounded-md border border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={newAssistantCredentials?.email || ''}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newAssistantCredentials?.email || '');
                        toast.success('Email copied to clipboard!');
                      }}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Default Password:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={newAssistantCredentials?.password || ''}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newAssistantCredentials?.password || '');
                        toast.success('Password copied to clipboard!');
                      }}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Important:</strong> The assistant should change this password after first login for security.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCredentialsModal(false);
                  setNewAssistantCredentials(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedAssistant(null);
            setPasswordData({ password: '', confirmPassword: '' });
          }}
          title={`Change Password - ${selectedAssistant?.name}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Re-enter password"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => {
                setShowPasswordModal(false);
                setSelectedAssistant(null);
                setPasswordData({ password: '', confirmPassword: '' });
              }}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </div>
        </Modal>
    </motion.div>
  );
};

export default AssistantsPage;

