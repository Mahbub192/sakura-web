import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  fetchAssistants,
  createAssistant,
  updateAssistant,
  deleteAssistant,
  changeAssistantPassword,
} from '../../store/slices/assistantSlice';
import { Assistant, CreateAssistantRequest, UpdateAssistantRequest } from '../../services/assistantService';
import { fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
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
      const { password, doctorId, ...requestData } = formData;
      await dispatch(createAssistant(requestData)).unwrap();
      setShowCreateModal(false);
      
      setNewAssistantCredentials({
        email: formData.email,
        password: 'password123',
      });
      setShowCredentialsModal(true);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        qualification: '',
        experience: undefined,
        doctorId: currentDoctorProfile?.id || 0,
        password: '',
      });
    } catch (error: any) {
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
    <div className="font-display bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 w-full min-h-screen">
      <div className="p-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">Assistants Management</h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">Manage your assistants and their access.</p>
            </div>
            <button 
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
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90"
            >
              <span className="material-symbols-outlined">person_add</span>
              <span className="truncate">Add Assistant</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark text-sm pl-9 pr-3 focus:border-primary focus:ring-primary/50 text-gray-900 dark:text-white"
              placeholder="Search assistants by name, email, phone..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Assistants Table */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-background-light dark:bg-background-dark dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3" scope="col">SI No.</th>
                    <th className="px-6 py-3" scope="col">Assistant</th>
                    <th className="px-6 py-3" scope="col">Email</th>
                    <th className="px-6 py-3" scope="col">Phone</th>
                    <th className="px-6 py-3" scope="col">Qualification</th>
                    <th className="px-6 py-3" scope="col">Experience</th>
                    <th className="px-6 py-3" scope="col">Status</th>
                    <th className="px-6 py-3" scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center">
                        <LoadingSpinner size="md" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading assistants...</p>
                      </td>
                    </tr>
                  ) : filteredAssistants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500 mb-3 block">person_off</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">No assistants found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first assistant'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold hover:bg-primary/90 mx-auto"
                          >
                            <span className="material-symbols-outlined">person_add</span>
                            Add Assistant
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredAssistants.map((assistant, index) => (
                      <tr 
                        key={assistant.id}
                        className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {index + 1}
                        </td>
                        <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" scope="row">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                              {assistant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{assistant.name}</p>
                            </div>
                          </div>
                        </th>
                        <td className="px-6 py-4">{assistant.email}</td>
                        <td className="px-6 py-4">{assistant.phone}</td>
                        <td className="px-6 py-4">{assistant.qualification || 'N/A'}</td>
                        <td className="px-6 py-4">{assistant.experience ? `${assistant.experience} years` : 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            assistant.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {assistant.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openEditModal(assistant)}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-medium"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button 
                              onClick={() => openPasswordModal(assistant)}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors text-xs font-medium"
                              title="Change Password"
                            >
                              <span className="material-symbols-outlined text-base">lock</span>
                              <span className="hidden sm:inline">Password</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteAssistant(assistant.id)}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-xs font-medium"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Assistant"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
              placeholder="Enter assistant name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
              placeholder="Enter phone number"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> A default password will be automatically set for the assistant. They can change it after logging in.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
              placeholder="Enter qualification (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (years)</label>
            <input
              type="number"
              value={formData.experience || ''}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
              placeholder="Enter years of experience (optional)"
              min="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAssistant}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Assistant
            </button>
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
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (years)</label>
            <input
              type="number"
              value={formData.experience || ''}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
              min="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedAssistant(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateAssistant}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Update Assistant
            </button>
          </div>
        </div>
      </Modal>

      {/* Credentials Modal */}
      <Modal
        isOpen={showCredentialsModal}
        onClose={() => {
          setShowCredentialsModal(false);
          setNewAssistantCredentials(null);
        }}
        title="Assistant Created Successfully!"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-300 mb-3">
              <strong>✅ Assistant account created successfully!</strong>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Please share these login credentials with the assistant:
            </p>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newAssistantCredentials?.email || ''}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-900 dark:text-white"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newAssistantCredentials?.email || '');
                      toast.success('Email copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Default Password:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newAssistantCredentials?.password || ''}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-900 dark:text-white"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newAssistantCredentials?.password || '');
                      toast.success('Password copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                <strong>⚠️ Important:</strong> The assistant should change this password after first login for security.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowCredentialsModal(false);
                setNewAssistantCredentials(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
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
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password *</label>
            <input
              type="password"
              value={passwordData.password}
              onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password *</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white"
              placeholder="Re-enter password"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setSelectedAssistant(null);
                setPasswordData({ password: '', confirmPassword: '' });
              }}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssistantsPage;
