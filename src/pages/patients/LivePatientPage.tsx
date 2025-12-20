import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchTokenAppointments } from '../../store/slices/appointmentSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { fetchDoctors, fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { TokenAppointment, Doctor } from '../../types';

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour24 = parseInt(hours, 10);
  const mins = minutes || '00';
  
  if (hour24 === 0) {
    return `12:${mins} AM`;
  } else if (hour24 < 12) {
    return `${hour24}:${mins} AM`;
  } else if (hour24 === 12) {
    return `12:${mins} PM`;
  } else {
    return `${hour24 - 12}:${mins} PM`;
  }
};

const LivePatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAssistant, isAuthenticated, user } = useAuth();
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name || '';
  const canAccessLivePatient = isAuthenticated && user && ['Admin', 'Doctor', 'Assistant'].includes(userRole);
  const { isLoading } = useAppSelector(state => state.appointments);
  const { clinics } = useAppSelector(state => state.clinics);
  const { doctors, currentDoctorProfile } = useAppSelector(state => state.doctors);
  
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<number | ''>('');
  const [filteredPatients, setFilteredPatients] = useState<TokenAppointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentServingIndex, setCurrentServingIndex] = useState<number>(-1); // Current serving patient index
  const [playingVideoIds, setPlayingVideoIds] = useState<Set<number>>(new Set()); // Currently playing video IDs (multiple)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false); // Fullscreen state

  // Get initial filters from URL params
  useEffect(() => {
    const locationParam = searchParams.get('location');
    const dateParam = searchParams.get('date');
    const doctorParam = searchParams.get('doctor');

    if (locationParam) setSelectedLocation(Number(locationParam));
    if (dateParam) setSelectedDate(dateParam);
    if (doctorParam) setSelectedDoctorFilter(Number(doctorParam));
  }, [searchParams]);

  useEffect(() => {
    if (isAssistant) {
      dispatch(fetchCurrentDoctorProfile());
    }
    dispatch(fetchClinics());
    dispatch(fetchDoctors());
  }, [dispatch, isAssistant]);
  
  useEffect(() => {
    if (isAssistant && currentDoctorProfile) {
      setSelectedDoctorFilter(currentDoctorProfile.id);
      setSelectedDoctor(currentDoctorProfile);
    }
  }, [isAssistant, currentDoctorProfile]);

  useEffect(() => {
    if (selectedLocation && selectedDate) {
      handleFilter();
    } else {
      setFilteredPatients([]);
      setSelectedDoctor(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, selectedDate, selectedDoctorFilter]);

  const handleFilter = async () => {
    if (!selectedLocation || !selectedDate) {
      toast.warning('Please select both location and date');
      return;
    }

    try {
      const doctorIdToUse = isAssistant && currentDoctorProfile 
        ? currentDoctorProfile.id 
        : (selectedDoctorFilter ? Number(selectedDoctorFilter) : undefined);
      
      const result = await dispatch(fetchTokenAppointments({ 
        clinicId: Number(selectedLocation), 
        date: selectedDate,
        doctorId: doctorIdToUse,
      }));

      if (fetchTokenAppointments.fulfilled.match(result)) {
        const patients = result.payload as TokenAppointment[];
        // Sort by time
        const sortedPatients = [...patients].sort((a, b) => {
          const timeA = a.time || '';
          const timeB = b.time || '';
          return timeA.localeCompare(timeB);
        });
        setFilteredPatients(sortedPatients);
        
        // Find and set the doctor
        if (sortedPatients.length > 0) {
          const doctorId = sortedPatients[0].doctorId;
          const doctor = doctors.find(d => d.id === doctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
          } else if (sortedPatients[0].doctor) {
            setSelectedDoctor(sortedPatients[0].doctor);
          }
        }

        // Set current serving index to first "Pending" or "Confirmed" patient, or first patient
        const servingIndex = sortedPatients.findIndex(p => 
          p.status === 'Pending' || p.status === 'Confirmed'
        );
        setCurrentServingIndex(servingIndex >= 0 ? servingIndex : 0);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    }
  };


  const handleViewPatient = (patient: TokenAppointment) => {
    navigate(`/patients/view?token=${patient.tokenNumber}`);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredPatients.length;
    const completed = filteredPatients.filter(p => p.status === 'Completed').length;
    const serving = currentServingIndex >= 0 ? 1 : 0;
    const waiting = total - completed - serving;

    return { total, completed, serving, waiting };
  }, [filteredPatients, currentServingIndex]);


  // YouTube videos data
  const youtubeVideos = [
    {
      id: 1,
      title: 'Understanding Sinusitis: Causes and Treatments',
      author: 'Dr. Ashraful Islam Razib',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_sL-wQNM7I7xO2V6HCqa6aQG47Y_n9nlu5XM2_dXmPpdIoAcj6yI1Rf0wkq4g-5m703yBdih-EpKA5WRRkA6v5jVoe4Z3DlGyW7d54MlSWqVzrgKek2T8UTJ4AIIuswvJvCghaJx1Oa2kBLjgFmjdMCzG4CZnJEu72bAMQO9dOKDQXhYg0eX-OLvQJ0pEx9CMn648suZBbPkWn0XX3UN57Big0_MIXA4Mow3Ex7o-oTnDdQmWkhAAKJAnGfV5sxz8-FKdLgOH5m7e',
      url: 'https://www.youtube.com/watch?v=Z5zqFhC-0dI', // Replace with actual YouTube URL
    },
    {
      id: 2,
      title: 'ENT Operation: Surgical Procedure',
      author: 'Dr. Ashraful Islam Razib',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVEBhZy7mlvrl3JMDKp2anlKyPDdZfuh9J_rBJTYEAQ2UqNt97b4tCm-5hMPKdHErmdaxEEvvoJDGdRfQ9yGf_APwOdkQNjHNl2gs3ZfMEFCXJhrG4ln1XN_SFrZ8Z7iBEMYR8Ziq-N-OMWPcRlbM_Bhtn8A0m3WkKuVzTpRtpbb4WZHERaaEM0oV13Y5COEK6s4Pq9VUE4ENdPmweqTGySwpwtYPQfUbXP3E1uUtvlKvHQ_TUYFmQDBQg1oezLhZV1veTpKT-A5O0',
      url: 'https://www.youtube.com/watch?v=R3i1P6_ARvI', // Replace with actual ENT operation YouTube URL
    },
  ];

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1].split('?')[0]
      : url.includes('watch?v=')
      ? url.split('watch?v=')[1].split('&')[0]
      : '';
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const handleVideoClick = (videoId: number) => {
    setPlayingVideoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        // If clicking the same video, close it
        newSet.delete(videoId);
      } else {
        // Open the clicked video (can have multiple videos playing)
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      toast.error('Fullscreen mode is not supported or failed');
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  if (!canAccessLivePatient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark w-full min-h-screen">
      <div className="flex h-screen w-full flex-col">
        {/* Header/Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-center border-b border-slate-200/80 dark:border-slate-800/80 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
          <nav className="flex w-full items-center justify-between px-4 py-2 md:px-8">
            <div className="flex items-center gap-4">
              <div className="text-primary">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3.25c2.622 0 4.75 2.128 4.75 4.75 0 2.622-2.128 4.75-4.75 4.75S7.25 10.622 7.25 8 9.378 3.25 12 3.25zM5.5 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <Link to="/" className="text-xl font-bold tracking-[-0.015em] text-text-light dark:text-text-dark">
                Sakura
              </Link>
            </div>
            <div className="hidden items-center gap-8 md:flex">
              <Link to="/" className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary">
                Home
              </Link>
              <Link to="/book-appointment" className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary">
                Appointment
              </Link>
              <Link to="/patients" className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary">
                Patients
              </Link>
              <Link to="/patients/live" className="text-sm font-bold text-primary dark:text-secondary">
                Live Patient
              </Link>
              <a href="#services" className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary">
                Services
              </a>
              <a href="#faq" className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="flex items-center justify-center rounded-full h-10 w-10 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                <span className="material-symbols-outlined !text-xl">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
              <button 
                onClick={() => navigate('/book-appointment')}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary text-white text-sm font-bold tracking-wide transition-colors hover:bg-primary/90"
              >
                <span className="truncate">Book Now</span>
              </button>
            </div>
          </nav>
        </header>

        <main className="flex-grow overflow-y-auto">
          <div className="w-full px-4 md:px-8 py-6">
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Left Column - Main Content */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                {/* Filters */}
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end">
                    <div>
                      <label className="block text-xs font-medium text-text-light dark:text-text-dark" htmlFor="location">Location</label>
                      <select 
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-1.5 px-3"
                        id="location"
                        name="location"
                        value={selectedLocation || ''}
                        onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                      >
                        <option value="">Select Location</option>
                        {clinics.map(clinic => (
                          <option key={clinic.id} value={clinic.id}>{clinic.locationName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-light dark:text-text-dark" htmlFor="date">Date</label>
                      <input 
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-1.5 px-3"
                        id="date"
                        name="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-light dark:text-text-dark" htmlFor="doctor">Doctor</label>
                      <select 
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-1.5 px-3"
                        id="doctor"
                        name="doctor"
                        value={selectedDoctorFilter || ''}
                        onChange={(e) => setSelectedDoctorFilter(e.target.value ? Number(e.target.value) : '')}
                        disabled={isAssistant}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor.id} value={doctor.id}>Dr. {doctor.name}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={handleFilter}
                      disabled={!selectedLocation || !selectedDate || isLoading}
                      className="w-full flex items-center justify-center rounded-lg h-9 px-4 bg-primary text-white font-bold tracking-wide transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined mr-2 !text-lg">search</span>
                          <span className="text-sm">Filter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Doctor Info Card */}
                {selectedDoctor && (
                  <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-lg flex items-center gap-4">
                    <img 
                      className="h-24 w-24 rounded-full object-cover border-4 border-secondary"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=2D6A9D&color=fff&size=128`}
                      alt={`Portrait of ${selectedDoctor.name}`}
                    />
                    <div className="flex-grow">
                      <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Dr. {selectedDoctor.name}</h2>
                      <p className="text-primary text-base font-semibold">{selectedDoctor.qualification || selectedDoctor.specialization}</p>
                      <div className="mt-1 flex items-center gap-4 text-sm text-text-muted-light dark:text-text-muted-dark">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined !text-base text-primary">location_on</span>
                          <span>{clinics.find(c => c.id === selectedLocation)?.locationName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined !text-base text-primary">today</span>
                          <span>{selectedDate ? format(new Date(selectedDate), 'MMMM d, yyyy') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-text-light dark:text-text-dark">
                        Serving: <span className="text-secondary font-bold text-lg">SI. {currentServingIndex >= 0 ? String(currentServingIndex + 1).padStart(2, '0') : '00'}</span>
                      </p>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Total Patients: {stats.total}</p>
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200 mt-1">
                        <span className="w-2 h-2 mr-1.5 rounded-full bg-green-500 animate-pulse"></span>Live
                      </span>
                    </div>
                  </div>
                )}

                {/* Patient Table */}
                <div className="flex-grow overflow-x-auto overflow-y-auto bg-white dark:bg-slate-800/50 rounded-xl shadow-md">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500 mb-3 block">person_off</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">No patients found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Please select filters to view patients</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left text-text-muted-light dark:text-text-muted-dark">
                      <thead className="text-xs text-text-light dark:text-text-dark uppercase bg-slate-100 dark:bg-slate-700 sticky top-0">
                        <tr>
                          <th className="px-4 py-2" scope="col">SI</th>
                          <th className="px-4 py-2" scope="col">Name</th>
                          <th className="px-4 py-2" scope="col">Age</th>
                          <th className="px-4 py-2" scope="col">Gender</th>
                          <th className="px-4 py-2" scope="col">Phone</th>
                          <th className="px-4 py-2" scope="col">Time</th>
                          <th className="px-4 py-2" scope="col">Status</th>
                          <th className="px-4 py-2" scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {filteredPatients.map((patient, index) => {
                          const isServing = index === currentServingIndex;
                          const isDone = patient.status === 'Completed';

                          return (
                            <tr 
                              key={patient.id}
                              className={`border-b dark:border-slate-700 ${
                                isServing 
                                  ? 'bg-blue-100 dark:bg-blue-900/50' 
                                  : index % 2 === 1 
                                    ? 'bg-slate-50 dark:bg-slate-800' 
                                    : ''
                              }`}
                            >
                              <th className="px-4 py-2 font-medium text-text-light dark:text-white whitespace-nowrap" scope="row">
                                {String(index + 1).padStart(2, '0')}
                              </th>
                              <td className={`px-4 py-2 ${isServing ? 'font-semibold text-text-light dark:text-white' : ''}`}>
                                {patient.patientName}
                              </td>
                              <td className={`px-4 py-2 ${isServing ? 'font-semibold text-text-light dark:text-white' : ''}`}>
                                {patient.patientAge || 'N/A'}
                              </td>
                              <td className={`px-4 py-2 ${isServing ? 'font-semibold text-text-light dark:text-white' : ''}`}>
                                {patient.patientGender || 'N/A'}
                              </td>
                              <td className={`px-4 py-2 ${isServing ? 'font-semibold text-text-light dark:text-white' : ''}`}>
                                {patient.patientPhone ? `...${patient.patientPhone.slice(-4)}` : 'N/A'}
                              </td>
                              <td className={`px-4 py-2 ${isServing ? 'font-semibold text-text-light dark:text-white' : ''}`}>
                                {formatTimeTo12Hour(patient.time || '')}
                              </td>
                              <td className="px-4 py-2">
                                {isDone ? (
                                  <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Done</span>
                                ) : isServing ? (
                                  <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Serving</span>
                                ) : (
                                  <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Waiting</span>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => handleViewPatient(patient)}
                                  className="font-medium text-primary hover:underline"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Right Column - YouTube Videos */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                <div className="text-left">
                  <h2 className="text-xl font-bold tracking-tight text-text-light dark:text-text-dark">From My YouTube Channel</h2>
                  <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
                    Educational videos and insights.
                  </p>
                </div>
                <div className="flex-grow flex flex-col gap-3 overflow-y-auto">
                  {youtubeVideos.map((video) => (
                    <div
                      key={video.id}
                      className="group overflow-hidden rounded-xl shadow-lg bg-white dark:bg-slate-800/50 flex-shrink-0"
                    >
                      <div className="relative aspect-video">
                        {playingVideoIds.has(video.id) ? (
                          <>
                            <iframe
                              className="w-full h-full"
                              src={getYouTubeEmbedUrl(video.url)}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingVideoIds(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(video.id);
                                  return newSet;
                                });
                              }}
                              className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-colors z-10"
                              title="Close video"
                            >
                              <span className="material-symbols-outlined !text-lg">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <img 
                              alt={video.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                              src={video.thumbnail}
                              onClick={() => handleVideoClick(video.id)}
                            />
                            <div 
                              className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors cursor-pointer"
                              onClick={() => handleVideoClick(video.id)}
                            >
                              <span className="material-symbols-outlined !text-4xl text-white/80 drop-shadow-lg group-hover:scale-110 transition-transform">play_circle</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-text-light dark:text-text-dark leading-tight">{video.title}</h3>
                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">{video.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LivePatientPage;
