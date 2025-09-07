import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface FilterOptions {
  search: string;
  status: string;
  doctor: string;
  date: string;
}

interface AppointmentFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  doctors: Array<{ id: number; name: string }>;
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filters,
  onFilterChange,
  doctors,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FunnelIcon className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by doctor or clinic..."
            className="input-field"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Doctor Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor
          </label>
          <select
            value={filters.doctor}
            onChange={(e) => onFilterChange({ doctor: e.target.value })}
            className="input-field"
          >
            <option value="">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onFilterChange({ date: e.target.value })}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters;
