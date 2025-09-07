import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Doctor } from '../../types';
import Button from '../ui/Button';

interface UserManagementCardProps {
  doctors: Doctor[];
}

const UserManagementCard: React.FC<UserManagementCardProps> = ({ doctors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Mock users data (in real app, this would come from API)
  const allUsers = [
    ...doctors.map(doctor => ({
      id: doctor.id,
      name: `${doctor.user.firstName} ${doctor.user.lastName}`,
      email: doctor.user.email,
      role: doctor.user.role,
      status: doctor.user.isActive ? 'Active' : 'Inactive',
      lastLogin: '2024-01-15',
      type: 'doctor' as const,
    })),
    // Add some mock non-doctor users
    {
      id: 1001,
      name: 'Admin User',
      email: 'admin@hospital.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-01-15',
      type: 'admin' as const,
    },
    {
      id: 1002,
      name: 'Jane Assistant',
      email: 'jane.assistant@hospital.com',
      role: 'Assistant',
      status: 'Active',
      lastLogin: '2024-01-14',
      type: 'assistant' as const,
    },
  ];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'badge-error';
      case 'Doctor':
        return 'badge-primary';
      case 'Assistant':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <Button
          variant="primary"
          icon={<PlusIcon className="h-4 w-4" />}
        >
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field min-w-[140px]"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="assistant">Assistant</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-3">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      user.status === 'Active' ? 'badge-success' : 'badge-error'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<EyeIcon className="h-3 w-3" />}
                      >
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<PencilIcon className="h-3 w-3" />}
                      >
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<TrashIcon className="h-3 w-3" />}
                      >
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-success-600">
            {allUsers.filter(u => u.status === 'Active').length}
          </p>
          <p className="text-sm text-gray-600">Active Users</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-primary-600">
            {allUsers.filter(u => u.role === 'Doctor').length}
          </p>
          <p className="text-sm text-gray-600">Doctors</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-secondary-600">
            {allUsers.filter(u => u.role === 'Assistant').length}
          </p>
          <p className="text-sm text-gray-600">Assistants</p>
        </div>
      </div>
    </div>
  );
};

export default UserManagementCard;
