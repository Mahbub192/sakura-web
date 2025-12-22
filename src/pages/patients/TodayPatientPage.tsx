import { format } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchTokenAppointments, updateTokenAppointmentStatus } from '../../store/slices/appointmentSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { fetchCurrentDoctorProfile, fetchDoctors } from '../../store/slices/doctorSlice';
import { Doctor, TokenAppointment } from '../../types';

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

const TodayPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAssistant, isAuthenticated, user, isAdmin, isDoctor } = useAuth();
  const canAccessToday = isAuthenticated && (isAdmin || isDoctor);
  const { isLoading } = useAppSelector(state => state.appointments);
  const { clinics } = useAppSelector(state => state.clinics);
  const { doctors, currentDoctorProfile } = useAppSelector(state => state.doctors);
  
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<number | ''>('');
  const [filteredPatients, setFilteredPatients] = useState<TokenAppointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentServingIndex, setCurrentServingIndex] = useState<number>(-1); // Current serving patient index
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false); // Fullscreen state
  const [chamberRunning, setChamberRunning] = useState<boolean>(false);
  const socketRef = React.useRef<Socket | null>(null);

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

  // Setup socket connection for live updates
  useEffect(() => {
    // determine backend URL from api base
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://sakura-backend-t4mg.onrender.com' : 'http://localhost:3000');
    const namespaceUrl = `${apiUrl.replace(/\/$/, '')}/live-patients`;

    const token = localStorage.getItem('token');
    const socket = io(namespaceUrl, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to live-patients socket', socket.id);
      // join clinic/doctor rooms if available
      const clinicId = selectedLocation || undefined;
      const doctorId = selectedDoctor?.id || (currentDoctorProfile?.id || undefined);
      socket.emit('join', { clinicId, doctorId });
    });

    socket.on('token_updated', (payload: TokenAppointment) => {
      if (selectedLocation && selectedDate) {
        handleFilter();
      }
    });

    socket.on('control', (data: any) => {
      if (data?.clinicId && Number(data.clinicId) !== Number(selectedLocation)) return;
      if (data.action === 'start') {
        setChamberRunning(true);
        if (typeof data.currentIndex === 'number') setCurrentServingIndex(data.currentIndex);
      } else if (data.action === 'pause') {
        setChamberRunning(false);
      } else if (data.action === 'end') {
        setChamberRunning(false);
        setCurrentServingIndex(-1);
      } else if (data.action === 'next') {
        if (typeof data.currentIndex === 'number') setCurrentServingIndex(data.currentIndex);
      }
    });

    socket.on('error', (err: any) => {
      console.error('Live socket error', err);
    });

    socketRef.current = socket;

    return () => {
      try { socket.disconnect(); } catch (e) {}
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, selectedDoctor, currentDoctorProfile, selectedDate]);

  // When chamberRunning is enabled, ensure there's a serving patient
  useEffect(() => {
    if (chamberRunning && filteredPatients.length > 0) {
      if (currentServingIndex < 0) {
        setCurrentServingIndex(0);
      }
    }
  }, [chamberRunning, filteredPatients, currentServingIndex]);

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
        const sortedPatients = [...patients].sort((a, b) => {
          const timeA = a.time || '';
          const timeB = b.time || '';
          return timeA.localeCompare(timeB);
        });
        setFilteredPatients(sortedPatients);
        
        if (sortedPatients.length > 0) {
          const doctorId = sortedPatients[0].doctorId;
          const doctor = doctors.find(d => d.id === doctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
          } else if (sortedPatients[0].doctor) {
            setSelectedDoctor(sortedPatients[0].doctor);
          }
        }

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

  const handleStartChamber = () => {
    if (filteredPatients.length === 0) {
      toast.warning('No patients to serve.');
      return;
    }
    setChamberRunning(true);
    if (currentServingIndex < 0) setCurrentServingIndex(0);
    playBeep();
    try {
      socketRef.current?.emit('control', { action: 'start', clinicId: selectedLocation, doctorId: selectedDoctor?.id, currentIndex: currentServingIndex >= 0 ? currentServingIndex : 0 });
    } catch (e) {}
  };

  const handlePauseChamber = () => {
    setChamberRunning(false);
    try { socketRef.current?.emit('control', { action: 'pause', clinicId: selectedLocation, doctorId: selectedDoctor?.id }); } catch (e) {}
  };

  const handleEndChamber = async () => {
    setChamberRunning(false);
    if (currentServingIndex >= 0 && filteredPatients[currentServingIndex]) {
      const current = filteredPatients[currentServingIndex];
      try {
        await dispatch(updateTokenAppointmentStatus({ id: current.id, status: 'Completed' }));
      } catch (err) {
        console.error('Failed to end current patient:', err);
      }
    }
    setCurrentServingIndex(-1);
    try { socketRef.current?.emit('control', { action: 'end', clinicId: selectedLocation, doctorId: selectedDoctor?.id }); } catch (e) {}
  };

  const handleNextPatient = async () => {
    if (filteredPatients.length === 0) return;
    let nextIndex = currentServingIndex >= 0 ? currentServingIndex + 1 : 0;

    if (currentServingIndex >= 0 && filteredPatients[currentServingIndex]) {
      const current = filteredPatients[currentServingIndex];
      try {
        await dispatch(updateTokenAppointmentStatus({ id: current.id, status: 'Completed' }));
      } catch (err) {
        console.error('Failed to mark current completed:', err);
      }
    }

    while (nextIndex < filteredPatients.length && filteredPatients[nextIndex].status === 'Completed') {
      nextIndex += 1;
    }

    if (nextIndex >= filteredPatients.length) {
      setCurrentServingIndex(-1);
      setChamberRunning(false);
      toast.info('No more patients in the list');
      return;
    }

    setCurrentServingIndex(nextIndex);
    setChamberRunning(true);
    playBeep();
    try { socketRef.current?.emit('control', { action: 'next', clinicId: selectedLocation, doctorId: selectedDoctor?.id, currentIndex: nextIndex }); } catch (e) {}
  };

  const playBeep = (frequency = 880, duration = 150) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = frequency;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      o.start(now);
      setTimeout(() => {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
        o.stop(ctx.currentTime + 0.03);
        try {
          ctx.close();
        } catch (e) {
        }
      }, duration);
    } catch (err) {
      console.error('playBeep error', err);
    }
  };

  const stats = useMemo(() => {
    const total = filteredPatients.length;
    const completed = filteredPatients.filter(p => p.status === 'Completed').length;
    const serving = currentServingIndex >= 0 ? 1 : 0;
    const waiting = total - completed - serving;

    return { total, completed, serving, waiting };
  }, [filteredPatients, currentServingIndex]);


  

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      toast.error('Fullscreen mode is not supported or failed');
    }
  };

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

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark w-full min-h-screen">
      <div className="flex h-screen w-full flex-col">
        <main className="flex-grow overflow-y-auto">
          <div className="w-full px-4 md:px-8 py-6">
            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-12 flex flex-col gap-4">
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
                    <div className="mt-3 flex items-center gap-2 justify-end">
                      <button
                        onClick={handleStartChamber}
                        className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                      >
                        Start Chamber
                      </button>
                      <button
                        onClick={handlePauseChamber}
                        className="px-3 py-1 rounded bg-yellow-400 text-black text-xs font-semibold hover:bg-yellow-500"
                      >
                        Pause Chamber
                      </button>
                      <button
                        onClick={handleEndChamber}
                        className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                      >
                        End Chamber
                      </button>
                      <button
                        onClick={handleNextPatient}
                        className="px-3 py-1 rounded bg-primary text-white text-xs font-semibold hover:bg-primary/90"
                      >
                        Next
                      </button>
                    </div>
                    </div>
                  </div>
                )}

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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TodayPatientPage;
