import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ShieldCheckIcon,
  PhoneIcon,
  MapPinIcon,
  SparklesIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { publicService } from '../../services/publicService';
import { Doctor, Appointment } from '../../types';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const canAccessLivePatient = isAuthenticated && user && ['Admin', 'Doctor', 'Assistant'].includes(user.role);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableAppointments, setAvailableAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorsData, appointmentsData] = await Promise.all([
        publicService.getDoctors(),
        publicService.getAvailableAppointments(),
      ]);
      setDoctors(doctorsData);
      setAvailableAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const specializations = Array.from(new Set(doctors.map(d => d.specialization)));

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = 
      !selectedSpecialization || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const featuredDoctors = doctors.slice(0, 6);
  const stats = [
    { label: 'Expert Doctors', value: doctors.length, icon: HeartIcon, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Available Appointments', value: availableAppointments.length, icon: CalendarIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Happy Patients', value: '5000+', icon: UserGroupIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Years Experience', value: '15+', icon: CheckCircleIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      rating: 5,
      text: 'The online booking system is incredibly convenient. I was able to schedule my appointment in minutes and the doctor was excellent!',
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Patient',
      rating: 5,
      text: 'Professional service and easy to use platform. My appointment was on time and the staff was very helpful.',
      avatar: 'MC',
    },
    {
      name: 'Emma Williams',
      role: 'Patient',
      rating: 5,
      text: 'Best healthcare experience I\'ve had. The doctors are knowledgeable and the booking process is seamless.',
      avatar: 'EW',
    },
  ];

  const services = [
    {
      icon: HeartIcon,
      title: 'General Consultation',
      description: 'Comprehensive health checkups and consultations',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: AcademicCapIcon,
      title: 'Specialist Care',
      description: 'Expert treatment from specialized doctors',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: ChartBarIcon,
      title: 'Health Checkups',
      description: 'Regular health monitoring and preventive care',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Emergency Care',
      description: '24/7 emergency medical assistance',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'Simply click the "Book Appointment" button, select your preferred doctor and time slot, fill in your details, and confirm your booking.',
    },
    {
      question: 'Can I cancel or reschedule my appointment?',
      answer: 'Yes, you can cancel or reschedule your appointment through your account dashboard up to 24 hours before your scheduled time.',
    },
    {
      question: 'Do I need to register to book an appointment?',
      answer: 'No, you can browse doctors and view available slots without registration. However, creating an account allows you to manage your appointments more easily.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash payments at the clinic. Online payment options will be available soon.',
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-2 rounded-lg">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthCare</h1>
                <p className="text-xs text-gray-600">Management System</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/book-appointment"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Book Appointment
              </Link>
              {isAuthenticated && (
                <Link
                  to="/doctors"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Doctors
                </Link>
              )}
              <Link
                to="/patients/view"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Patients
              </Link>
              {canAccessLivePatient && (
                <Link
                  to="/patients/live"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Live Patient
                </Link>
              )}
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors cursor-pointer"
              >
                Services
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors cursor-pointer"
              >
                FAQ
              </a>
            </div>

            {/* Action Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/patients/book')}
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Book Now
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/book-appointment')}
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 py-4 space-y-4"
            >
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/book-appointment"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Appointment
              </Link>
              {isAuthenticated && (
                <Link
                  to="/doctors"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Doctors
                </Link>
              )}
              <Link
                to="/patients/view"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Patients
              </Link>
              {canAccessLivePatient && (
                <Link
                  to="/patients/live"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Live Patient
                </Link>
              )}
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
              >
                Services
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
              >
                FAQ
              </a>
              <div className="px-4 pt-4 space-y-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigate('/dashboard');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        navigate('/patients/book');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Book Now
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        navigate('/book-appointment');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Book Appointment
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 pt-32 pb-24 sm:pt-40 sm:pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
            >
              <SparklesIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Trusted by 5000+ Patients</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Your Health,{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Our Priority
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Book appointments with expert doctors online. Fast, easy, and convenient healthcare at your fingertips.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/book-appointment')}
                  className="bg-gray text-primary-600 hover:bg-gray-50 shadow-xl px-8 py-4 text-lg font-semibold"
                >
                  <CalendarIcon className="h-6 w-6 mr-2" />
                  Book Appointment Now
                </Button>
              </motion.div>
              {!isAuthenticated && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-transparent border-2 border-white text-white hover:bg-white/10 shadow-lg px-8 py-4 text-lg font-semibold"
                  >
                    Create Free Account
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Secure Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>Verified Doctors</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bg} rounded-2xl mb-4`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="text-4xl font-bold text-gray-900 mb-2"
                >
                  {stat.value}
                </motion.h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare services tailored to your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} p-4 mb-6 transform group-hover:scale-110 transition-transform`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Doctor Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Find Your Doctor
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our expert team of healthcare professionals
            </p>
          </motion.div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by doctor name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-field"
                  />
                </div>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="input-field md:w-64"
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
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-6 text-lg">Loading our expert doctors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Doctor Card Header */}
                  <div className="relative h-32 bg-gradient-to-br from-primary-500 to-secondary-500 p-6">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative flex items-center space-x-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <HeartIcon className="h-10 w-10 text-primary-600" />
                      </div>
                      <div className="text-white">
                        <h3 className="text-xl font-bold">Dr. {doctor.name}</h3>
                        <p className="text-primary-100 text-sm">{doctor.specialization}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">(4.9)</span>
                    </div>

                    {doctor.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{doctor.bio}</p>
                    )}

                    <div className="space-y-3 mb-6">
                      {doctor.experience && (
                        <div className="flex items-center text-sm text-gray-700">
                          <AcademicCapIcon className="h-5 w-5 mr-2 text-primary-600" />
                          <span>{doctor.experience} years experience</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Consultation Fee</span>
                        <span className="text-lg font-bold text-primary-600">${doctor.consultationFee}</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full group-hover:scale-105 transition-transform"
                      onClick={() => navigate(`/book-appointment?doctorId=${doctor.id}`)}
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Book Appointment
                      <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredDoctors.length === 0 && !loading && (
            <div className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No doctors found matching your criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from patients who trust us with their health
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for seamless healthcare management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: CalendarIcon,
                title: 'Easy Booking',
                description: 'Book appointments online in just a few clicks, 24/7 availability. No phone calls needed.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: ClockIcon,
                title: 'Flexible Timing',
                description: 'Choose from multiple time slots that fit your schedule. We work around your time.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: CheckCircleIcon,
                title: 'Expert Care',
                description: 'Get treated by experienced and certified healthcare professionals. Quality assured.',
                color: 'from-green-500 to-emerald-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -8 }}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 transform group-hover:rotate-6 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about booking appointments
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                  <ArrowRightIcon
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl sm:text-2xl text-primary-100 mb-10 leading-relaxed">
                Book your appointment today and take the first step towards better health. 
                Our expert doctors are ready to help you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/book-appointment')}
                    className="bg-gray text-primary-600 hover:bg-gray-50 shadow-2xl px-10 py-5 text-lg font-bold"
                  >
                    <CalendarIcon className="h-6 w-6 mr-2" />
                    Book Appointment Now
                  </Button>
                </motion.div>
                {!isAuthenticated && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="bg-transparent border-2 border-white text-white hover:bg-white/10 shadow-xl px-10 py-5 text-lg font-bold"
                    >
                      Sign Up Free
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-primary-100"
            >
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-6 w-6" />
                <span className="font-medium">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-6 w-6" />
                <span className="font-medium">123 Health Street, Medical City</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <HeartIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">HealthCare</h3>
                  <p className="text-sm text-gray-400">Management System</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your trusted partner in healthcare. We provide easy, convenient, and professional medical appointment booking services.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="LinkedIn">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    Home
                  </a>
                </li>
                <li>
                  <a href="/book-appointment" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    Book Appointment
                  </a>
                </li>
                <li>
                  <a href="/doctors" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    Find Doctors
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    Contact Us
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-lg font-bold mb-6">Our Services</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    General Consultation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    Specialist Care
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    Health Checkups
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    Emergency Care
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4" />
                    Online Consultation
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-lg font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-primary-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">123 Health Street</p>
                    <p className="text-gray-300">Medical City, MC 12345</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
                  <a href="tel:+15551234567" className="text-gray-400 hover:text-white transition-colors">
                    +1 (555) 123-4567
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
                  <a href="mailto:info@healthcare.com" className="text-gray-400 hover:text-white transition-colors">
                    info@healthcare.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">Mon - Sat: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-300">Sunday: 10:00 AM - 4:00 PM</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} HealthCare Management System. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

