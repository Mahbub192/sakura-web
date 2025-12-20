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
import { useAppDispatch } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;
  const canAccessLivePatient = isAuthenticated && user && ['Admin', 'Doctor', 'Assistant'].includes(userRole || '');

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };
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
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel slides data with doctor information
  const carouselSlides = [
    {
      id: 1,
      doctorName: 'Dr. Ashraful Islam Razib',
      specialization: 'ENT and Head-Neck Surgery Specialist',
      qualifications: 'MBBS (SOMC), CCD (BIRDEM), MCPS (ENT), FCPS (ENT and Head-Neck Surgery)',
      description: 'Dedicated ENT Specialist and Head-Neck Surgeon with strong academic background and compassionate approach to patient care.',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop',
      experience: '15+ Years',
      location: 'Dhaka-1217',
      phone: '09678191911',
    },
    {
      id: 2,
      doctorName: 'Dr. Ashraful Islam Razib',
      specialization: 'ENT and Head-Neck Surgery',
      qualifications: 'FCPS (ENT and Head-Neck Surgery)',
      description: 'Currently serving at National Institute of ENT, highly regarded for meticulous clinical practice and empathetic patient care.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop',
      experience: 'Expert in Head-Neck Surgery',
      location: 'Siddheswari, Dhaka',
      phone: '09678191911',
    },
    {
      id: 3,
      doctorName: 'Dr. Ashraful Islam Razib',
      specialization: 'Consultant ENT Specialist',
      qualifications: 'MCPS, FCPS in Otolaryngology',
      description: 'Expert in managing complex ENT conditions and performing advanced head-neck surgical procedures with state-of-the-art technology.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
      experience: 'Research & Clinical Excellence',
      location: 'Dhaka Medical College Hospital',
      phone: '09678191911',
    },
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-center border-b border-slate-200/80 dark:border-slate-800/80 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <nav className="flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8">
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
            <Link to="/patients/view" className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary">
              Patients
            </Link>
            {canAccessLivePatient && (
              <Link to="/patients/live" className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary">
                Live Patient
              </Link>
            )}
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary"
            >
              Services
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary"
            >
              FAQ
            </a>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated && user ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                    {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                      {typeof user.role === 'string' ? user.role : user.role?.name || 'User'}
                    </p>
                  </div>
                </div>
                {/* Dashboard Button */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary/10 text-primary text-sm font-bold tracking-wide transition-colors hover:bg-primary/20"
                >
                  <span className="truncate">Dashboard</span>
                </button>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-red-500 text-white text-sm font-bold tracking-wide transition-colors hover:bg-red-600"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  <span className="truncate">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={() => navigate('/login')}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-transparent border border-primary text-primary text-sm font-bold tracking-wide transition-colors hover:bg-primary/10"
                >
                  <span className="truncate">Login</span>
                </button>
                {/* Book Appointment Button */}
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary text-white text-sm font-bold tracking-wide transition-colors hover:bg-primary/90"
                >
                  <span className="truncate">Book Now</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl lg:text-6xl text-text-light dark:text-text-dark">
                  Expert ENT Care by Dr. Ashraful Islam Razib
                </h1>
                <p className="mt-4 max-w-xl text-lg text-text-muted-light dark:text-text-muted-dark">
                  Dedicated to providing specialized and compassionate care for all ear, nose, and throat conditions. Your health is my priority.
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <button
                    onClick={() => navigate('/book-appointment')}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary text-white text-base font-bold tracking-wide transition-colors hover:bg-primary/90"
                  >
                    <span className="truncate">Book an Appointment</span>
                  </button>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    View Services
                  </a>
                </div>
              </div>
              <div className="relative flex items-center justify-center w-full min-h-[400px] lg:min-h-[500px]">
                <div className="relative w-full max-w-lg h-[450px] rounded-xl overflow-hidden shadow-2xl">
                  <div className="w-full h-full">
                    <img
                      className="w-full h-full object-cover"
                      alt="Dr. Ashraful Islam Razib smiling professionally"
                      src="https://brachealthcare.com/wp-content/uploads/2025/03/Untitled-1-1.jpg"
                    />
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    <button className="w-3 h-3 rounded-full bg-white"></button>
                    <button className="w-3 h-3 rounded-full bg-white/50"></button>
                    <button className="w-3 h-3 rounded-full bg-white/50"></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-16 md:py-24 bg-white dark:bg-slate-800/50">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark sm:text-4xl">My Medical Services</h2>
              <p className="mt-4 text-lg text-text-muted-light dark:text-text-muted-dark">Comprehensive ENT services to address your health concerns.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center p-6 bg-background-light dark:bg-background-dark rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <span className="material-symbols-outlined !text-4xl">hearing</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Audiology & Hearing Aids</h3>
                <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">Complete hearing evaluations and fitting for advanced hearing aids.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background-light dark:bg-background-dark rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <span className="material-symbols-outlined !text-4xl">airwave</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Sinus & Nasal Disorders</h3>
                <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">Treatment for sinusitis, allergies, and nasal obstruction.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background-light dark:bg-background-dark rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <span className="material-symbols-outlined !text-4xl">record_voice_over</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Voice & Throat Problems</h3>
                <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">Care for hoarseness, swallowing issues, and throat infections.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background-light dark:bg-background-dark rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <span className="material-symbols-outlined !text-4xl">child_care</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">Pediatric ENT</h3>
                <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">Specialized care for children's ear, nose, and throat conditions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Dr. Section */}
        <section className="w-full py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark sm:text-4xl">Meet Dr. Ashraful Islam Razib</h2>
              <p className="mt-4 text-lg text-text-muted-light dark:text-text-muted-dark">Your dedicated partner in health.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
              <div className="overflow-hidden rounded-xl shadow-lg">
                <img
                  className="h-auto w-full object-cover"
                  alt="Portrait of Dr. Ashraful Islam Razib, a friendly male doctor in a white coat."
                  src="https://brachealthcare.com/wp-content/uploads/2025/03/Untitled-1-1.jpg"
                />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-text-light dark:text-text-dark">Dr. Ashraful Islam Razib</h3>
                <p className="mt-1 text-primary text-lg font-semibold">ENT Specialist</p>
                <p className="mt-4 text-text-muted-light dark:text-text-muted-dark">
                  With over 15 years of experience in Otolaryngology, I am committed to providing the highest standard of care. My approach is centered on building a trusting relationship with each patient, ensuring you feel heard, understood, and confident in your treatment plan. I believe in empowering my patients through education and collaborative decision-making.
                </p>
                <button
                  onClick={() => navigate('/about-me')}
                  className="mt-6 flex items-center justify-center rounded-lg h-11 px-6 bg-secondary text-white font-bold tracking-wide transition-colors hover:bg-secondary/90"
                >
                  <span>Learn More About Me</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-white">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined !text-5xl text-secondary">verified</span>
                <p className="mt-2 text-4xl font-bold">15+</p>
                <p className="text-lg text-slate-200">Years of Experience</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined !text-5xl text-secondary">sentiment_satisfied</span>
                <p className="mt-2 text-4xl font-bold">5,000+</p>
                <p className="text-lg text-slate-200">Happy Patients</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined !text-5xl text-secondary">medical_services</span>
                <p className="mt-2 text-4xl font-bold">10,000+</p>
                <p className="text-lg text-slate-200">Successful Procedures</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-slate-800/50">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark sm:text-4xl">What My Patients Say</h2>
              <p className="mt-4 text-lg text-text-muted-light dark:text-text-muted-dark">Real stories from my valued patients.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="rounded-xl bg-background-light dark:bg-background-dark p-8 shadow-md">
                <div className="flex items-center text-yellow-400">
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                </div>
                <blockquote className="mt-4 text-text-muted-light dark:text-text-muted-dark">
                  "The care I received was exceptional. Dr. Razib was incredibly knowledgeable and reassuring. I felt like I was in great hands."
                </blockquote>
                <p className="mt-6 font-semibold text-text-light dark:text-text-dark">S. Ahmed</p>
              </div>
              <div className="rounded-xl bg-background-light dark:bg-background-dark p-8 shadow-md">
                <div className="flex items-center text-yellow-400">
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                </div>
                <blockquote className="mt-4 text-text-muted-light dark:text-text-muted-dark">
                  "Booking an appointment was so easy, and the whole process was seamless. The facility is clean and modern. Highly recommend Dr. Razib to everyone."
                </blockquote>
                <p className="mt-6 font-semibold text-text-light dark:text-text-dark">F. Khan</p>
              </div>
              <div className="rounded-xl bg-background-light dark:bg-background-dark p-8 shadow-md">
                <div className="flex items-center text-yellow-400">
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                </div>
                <blockquote className="mt-4 text-text-muted-light dark:text-text-muted-dark">
                  "Dr. Razib is fantastic! He takes the time to listen and explains everything clearly. I feel so much better and more informed about my health."
                </blockquote>
                <p className="mt-6 font-semibold text-text-light dark:text-text-dark">J. Begum</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-text-muted-light dark:text-text-muted-dark">Have questions? I have answers. Find what you're looking for below.</p>
            </div>
            <div className="mt-12 space-y-4">
              <details className="group rounded-lg bg-white dark:bg-slate-800 p-6 shadow-md">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-text-light dark:text-text-dark list-none">
                  <span>How do I book an appointment?</span>
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 text-text-muted-light dark:text-text-muted-dark">
                  You can book an appointment easily by clicking the 'Book Appointment' button on this website, or by calling my office directly. New patients are always welcome.
                </p>
              </details>
              <details className="group rounded-lg bg-white dark:bg-slate-800 p-6 shadow-md">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-text-light dark:text-text-dark list-none">
                  <span>What insurance plans do you accept?</span>
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 text-text-muted-light dark:text-text-muted-dark">
                  I accept a wide range of insurance plans. Please visit the 'Insurance' page for a detailed list or contact my office to verify your coverage before your visit.
                </p>
              </details>
              <details className="group rounded-lg bg-white dark:bg-slate-800 p-6 shadow-md">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-text-light dark:text-text-dark list-none">
                  <span>What should I bring to my first appointment?</span>
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 text-text-muted-light dark:text-text-muted-dark">
                  For your first appointment, please bring a valid photo ID, your insurance card, a list of any current medications, and any relevant medical records. You can also complete new patient forms online to save time.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-4 text-white">
                <div className="text-primary">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3.25c2.622 0 4.75 2.128 4.75 4.75 0 2.622-2.128 4.75-4.75 4.75S7.25 10.622 7.25 8 9.378 3.25 12 3.25zM5.5 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold">Sakura</h2>
              </div>
              <p className="mt-4 text-sm text-slate-400">Dr. Ashraful Islam Razib (ENT)</p>
            </div>
            <div>
              <h3 className="font-semibold">Quick Links</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-slate-400 hover:text-white">Home</Link>
                </li>
                <li>
                  <Link to="/book-appointment" className="text-slate-400 hover:text-white">Appointment</Link>
                </li>
                <li>
                  <a href="#services" className="text-slate-400 hover:text-white">Services</a>
                </li>
                <li>
                  <a href="#faq" className="text-slate-400 hover:text-white">FAQ</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Contact</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>116/1, Siddheswari Circular Road, Dhaka-1217</li>
                <li>contact@drazib-ent.com</li>
                <li>09678191911</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Follow Me</h3>
              <div className="mt-4 flex space-x-4">
                <a className="text-slate-400 hover:text-white" href="#">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16.03 6.02,17.25 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"></path>
                  </svg>
                </a>
                <a className="text-slate-400 hover:text-white" href="#">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.585.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>© 2024 Dr. Ashraful Islam Razib. All rights reserved. | <a className="hover:text-white" href="#">Privacy Policy</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

