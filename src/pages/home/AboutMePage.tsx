import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const AboutMePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </button>
        </nav>
      </header>

      <main className="w-full">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-slate-800/50">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
              {/* Doctor Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center lg:justify-start"
              >
                <div className="relative w-full max-w-md">
                  <div className="overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      className="w-full h-auto object-cover"
                      alt="Dr. Ashraful Islam Razib"
                      src="https://brachealthcare.com/wp-content/uploads/2025/03/Untitled-1-1.jpg"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Doctor Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-light dark:text-text-dark mb-4">
                  Dr. Ashraful Islam Razib
                </h1>
                <p className="text-2xl text-primary font-semibold mb-6">
                  Consultant, ENT and Head-Neck Surgery Specialist
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <AcademicCapIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-light dark:text-text-dark">Qualifications</p>
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        MBBS (SOMC), CCD (BIRDEM), MCPS (ENT), FCPS (ENT and Head-Neck Surgery)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <MapPinIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-light dark:text-text-dark">Location</p>
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        116/1, Siddheswari Circular Road, 27 Shaheed Sangbadik Selina Parvin Road, Dhaka- 1217
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <PhoneIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-light dark:text-text-dark">Phone</p>
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark">09678191911</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <ClockIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-light dark:text-text-dark">Schedule</p>
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        Saturday [8:00 PM to 10:00 PM], Tuesday & Wednesday [7:00 PM to 10:00 PM]
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary text-white font-bold tracking-wide transition-colors hover:bg-primary/90"
                >
                  Book an Appointment
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="w-full py-16 md:py-24 bg-background-light dark:bg-background-dark">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-8 text-center">
                About Dr. Ashraful Islam Razib
              </h2>
              
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-6">
                  Dr. Md. Ashraful Islam is a dedicated ENT Specialist and Head-Neck Surgeon known for his strong academic background, hands-on clinical expertise, and compassionate approach to patient care. He earned his MBBS from Sylhet MAG Osmani Medical College under Shahjalal University of Science & Technology (SUST), and went on to achieve both MCPS and FCPS in Otolaryngology & Head-Neck Surgery from the Bangladesh College of Physicians and Surgeons (BCPS).
                </p>

                <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-6">
                  His post-graduate training at renowned institutions—including the National Institute of ENT, Dhaka Medical College Hospital, and Sylhet MAG Osmani Medical College Hospital—has equipped him with the skills to manage complex ENT conditions and perform advanced head-neck surgical procedures.
                </p>

                <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-6">
                  Currently serving at the National Institute of ENT, Dr. Islam is highly regarded for his meticulous clinical practice and his empathetic manner in dealing with patients. His ability to listen, connect, and communicate with those under his care has earned him trust and respect from both patients and colleagues.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Professional Experience Section */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-slate-800/50">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-8 text-center">
                Professional Experience
              </h2>

              <div className="space-y-8">
                {/* Current Position */}
                <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <BuildingOfficeIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Current Position</h3>
                      <p className="text-text-muted-light dark:text-text-muted-dark">
                        Consultant, National Institute of ENT
                      </p>
                    </div>
                  </div>
                </div>

                {/* Previous Positions */}
                <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <BuildingOfficeIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-4">Previous Positions</h3>
                      <ul className="space-y-2 text-text-muted-light dark:text-text-muted-dark">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Honorary Medical Officer at Sylhet MAG Osmani and Dhaka Medical College Hospitals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Assistant Registrar in ENT at Sylhet Women's Medical College Hospital</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Assistant Surgeon at Dewanganj Upazila Health Complex, Jamalpur</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Training & Education */}
                <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <AcademicCapIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-4">Training & Education</h3>
                      <ul className="space-y-2 text-text-muted-light dark:text-text-muted-dark">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Post-graduate training at National Institute of ENT, Dhaka Medical College Hospital, and Sylhet MAG Osmani Medical College Hospital</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Teaching Methodology (CME, MOHFW)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Laryngeal Framework & Phono surgery</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Temporal Bone Dissection (National Institute of ENT)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Courses in Research Methodology and Basic Surgical Skills</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Research */}
                <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <AcademicCapIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Research</h3>
                      <p className="text-text-muted-light dark:text-text-muted-dark">
                        Notable work on "Pattern of Clinical Presentation in Laryngeal Carcinoma"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specialization */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 shadow-md border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary rounded-lg p-3">
                      <AcademicCapIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Specialization</h3>
                      <p className="text-lg text-primary font-semibold">
                        ENT and Head-Neck Surgery, with deep passion for head and neck surgical oncology
                      </p>
                      <p className="text-text-muted-light dark:text-text-muted-dark mt-2">
                        Deeply passionate about head and neck surgical oncology, Dr. Md. Ashraful Islam combines clinical excellence with a humane approach, striving every day to improve the lives of his patients with both skill and sensitivity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-white">
          <div className="mx-auto max-w-4xl px-4 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Schedule Your Appointment?
              </h2>
              <p className="text-xl text-slate-200 mb-8">
                Book your appointment today and experience expert ENT care with compassion and excellence.
              </p>
              <button
                onClick={() => navigate('/book-appointment')}
                className="inline-flex items-center justify-center rounded-lg h-12 px-8 bg-white text-primary font-bold tracking-wide transition-colors hover:bg-slate-100"
              >
                Book an Appointment Now
              </button>
            </motion.div>
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

export default AboutMePage;

