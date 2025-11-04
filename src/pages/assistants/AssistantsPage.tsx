import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const stats = [
    {
      title: 'Total Assistants',
      value: assistants.length,
      icon: UserIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Assistants',
      value: assistants.filter(a => a.isActive).length,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Inactive Assistants',
      value: assistants.filter(a => !a.isActive).length,
      icon: XCircleIcon,
      color: 'bg-red-500',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary-600" />
                  Assistants Management
                </h1>
                <p className="text-sm text-gray-600">Manage your assistants</p>
              </div>
              <Button
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    qualification: '',
                    experience: undefined,
                    doctorId: currentDoctorProfile?.id || 0,
                    password: '', // Not sent to backend
                  });
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Assistant
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assistants by name, email, phone, or qualification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Assistants List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredAssistants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200"
          >
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Assistants Found</h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first assistant'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Assistant
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssistants.map((assistant, index) => (
              <motion.div
                key={assistant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {assistant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{assistant.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          assistant.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {assistant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 text-primary-600" />
                    <span className="truncate">{assistant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 text-primary-600" />
                    <span>{assistant.phone}</span>
                  </div>
                  {assistant.qualification && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AcademicCapIcon className="h-4 w-4 text-primary-600" />
                      <span className="truncate">{assistant.qualification}</span>
                    </div>
                  )}
                  {assistant.experience && (
                    <div className="text-xs text-gray-500">
                      {assistant.experience} years experience
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => openEditModal(assistant)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => openPasswordModal(assistant)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors text-sm font-medium"
                  >
                    <LockClosedIcon className="h-4 w-4" />
                    Password
                  </button>
                  <button
                    onClick={() => handleToggleStatus(assistant.id)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                      assistant.isActive
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {assistant.isActive ? (
                      <>
                        <XCircleIcon className="h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAssistant(assistant.id)}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
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
      </div>
    </div>
  );
};

export default AssistantsPage;

