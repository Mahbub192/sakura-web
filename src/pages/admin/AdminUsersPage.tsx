import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  UserPlusIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchAllUsers,
  createUserAccount,
  activateUserAccount,
  deactivateUserAccount,
} from '../../store/slices/userSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const createUserSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().optional(),
  role: yup.string().oneOf(['Admin', 'Doctor', 'Assistant', 'User']).required('Role is required'),
});

interface CreateUserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'Admin' | 'Doctor' | 'Assistant' | 'User';
}

const AdminUsersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((state) => state.users);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: yupResolver(createUserSchema) as any,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, dispatch]);

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchAllUsers()).unwrap();
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setRefreshing(false);
    }
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      const result = await dispatch(createUserAccount({
        ...data,
        role: data.role,
      })).unwrap();
      
      if (result) {
        toast.success(`User account created successfully! Temporary password: ${(result as any).tempPassword || 'Check email'}`);
        setShowCreateModal(false);
        reset();
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error || 'Failed to create user account');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await dispatch(activateUserAccount(id)).unwrap();
      toast.success('User activated successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error || 'Failed to activate user');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await dispatch(deactivateUserAccount(id)).unwrap();
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error || 'Failed to deactivate user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <UserGroupIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">User Management</h1>
                  <p className="text-xl text-purple-100">
                    Create and manage user accounts
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={fetchUsers}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field w-full"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Assistant">Assistant</option>
                <option value="User">User</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Create Account
            </Button>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new user account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'Doctor' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'Assistant' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-error-100 text-error-800">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="text-error-600 hover:text-error-800 transition-colors"
                              title="Deactivate"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="text-success-600 hover:text-success-800 transition-colors"
                              title="Activate"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            reset();
          }}
          title="Create New User Account"
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="input-field w-full"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-error-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="input-field w-full"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-error-600">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="input-field w-full"
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input-field w-full"
                  placeholder="01712345678"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('role')}
                  className="input-field w-full"
                >
                  <option value="">Select role</option>
                  <option value="Admin">Admin</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Assistant">Assistant</option>
                  <option value="User">User</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-error-600">{errors.role.message}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A temporary password will be generated for this account. 
                The user should change it after first login.
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Create Account
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminUsersPage;

