import {
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useAuth } from "../../hooks/useAuth";
import {
  assistantBookingService,
  CreatePatientBookingRequest,
} from "../../services/assistantBookingService";
import { fetchClinics } from "../../store/slices/clinicSlice";
import { fetchCurrentDoctorProfile } from "../../store/slices/doctorSlice";
// Removed fetchAvailableSlots import - using assistant-specific service instead
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import { Appointment } from "../../types";

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour24 = parseInt(hours, 10);

  // Get floor value of minutes (remove decimal places)
  const minsFloat = parseFloat(minutes || "0");
  const mins = Math.floor(minsFloat).toString().padStart(2, "0");

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

// Helper function to calculate time in minutes from time string (HH:MM)
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

// Helper function to format minutes to time string (HH:MM)
const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = Math.floor(totalMinutes % 60); // Use floor to remove decimal places
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// Helper function to calculate individual patient slot time
const calculatePatientSlotTime = (
  startTime: string,
  endTime: string,
  slotIndex: number,
  totalPatients: number
): string => {
  if (!startTime || !endTime || totalPatients === 0) return startTime;

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const totalDuration = endMinutes - startMinutes;
  const durationPerPatient = totalDuration / totalPatients;
  const slotTimeMinutes = startMinutes + durationPerPatient * (slotIndex - 1);
  return minutesToTime(slotTimeMinutes);
};

const AssistantBookingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAssistant, user } = useAuth();

  console.log(
    "[AssistantBookingPage] Component rendered, isAssistant:",
    isAssistant,
    "user:",
    user
  );
  const { clinics } = useAppSelector((state) => state.clinics);
  const { currentDoctorProfile } = useAppSelector((state) => state.doctors);

  const [availableSlots, setAvailableSlots] = useState<Appointment[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Appointment | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlotUniqueId, setSelectedSlotUniqueId] = React.useState<
    string | null
  >(null);

  const [bookingData, setBookingData] = useState<CreatePatientBookingRequest>({
    doctorId: 0,
    appointmentId: 0,
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientAge: 0,
    patientGender: "",
    patientLocation: "",
    patientType: "New",
    isOldPatient: false,
    doctorFee: 0,
    reasonForVisit: "",
    notes: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    if (isAssistant) {
      dispatch(fetchCurrentDoctorProfile());
      dispatch(fetchClinics());
    }
  }, [dispatch, isAssistant]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (currentDoctorProfile && selectedDate && selectedClinic) {
        setSlotsLoading(true);
        try {
          const slots = await assistantBookingService.getAvailableSlots(
            currentDoctorProfile.id,
            selectedDate,
            selectedClinic
          );
          setAvailableSlots(slots);
        } catch (error: any) {
          console.error("Failed to fetch available slots:", error);
          toast.error(
            error?.response?.data?.message || "Failed to fetch available slots"
          );
          setAvailableSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      } else {
        setAvailableSlots([]);
      }
    };

    fetchSlots();
  }, [currentDoctorProfile, selectedDate, selectedClinic]);

  useEffect(() => {
    if (currentDoctorProfile) {
      setBookingData((prev) => ({
        ...prev,
        doctorId: currentDoctorProfile.id,
        doctorFee: currentDoctorProfile.consultationFee,
      }));
    }
  }, [currentDoctorProfile]);

  const handleSlotSelect = (slot: any) => {
    // Find the original appointment slot from filteredSlots
    const originalSlot = filteredSlots.find((s) => s.id === slot.id);
    if (!originalSlot) return;

    // Convert time from 12-hour format to 24-hour format if needed
    const time24 = slot.individualStartTime || slot.startTime;
    // Ensure time is in HH:MM format (24-hour)
    let timeValue = time24;
    if (time24 && time24.includes(" ")) {
      // If it's in 12-hour format, convert it
      const [time, period] = time24.split(" ");
      const [hours, minutes] = time.split(":");
      let hour24 = parseInt(hours, 10);
      if (period === "PM" && hour24 !== 12) hour24 += 12;
      if (period === "AM" && hour24 === 12) hour24 = 0;
      timeValue = `${hour24.toString().padStart(2, "0")}:${minutes}`;
    }

    setSelectedSlot(originalSlot);
    setSelectedSlotUniqueId(slot.uniqueId);
    setBookingData((prev) => ({
      ...prev,
      doctorId: currentDoctorProfile?.id || slot.doctorId || 0,
      appointmentId: slot.id,
      date: slot.date,
      time: timeValue,
      doctorFee:
        slot.doctor?.consultationFee ||
        currentDoctorProfile?.consultationFee ||
        0,
    }));
    setShowBookingModal(true);
  };

  const handleBookAppointment = async () => {
    if (
      !bookingData.patientName ||
      !bookingData.patientPhone ||
      !bookingData.patientAge ||
      !bookingData.patientGender
    ) {
      toast.error("Please fill in all required patient information");
      return;
    }

    if (bookingData.patientAge < 1 || bookingData.patientAge > 150) {
      toast.error("Please enter a valid age");
      return;
    }

    // Validate required fields for backend
    if (!bookingData.doctorId || bookingData.doctorId <= 0) {
      toast.error("Doctor ID is missing. Please select a slot again.");
      return;
    }

    if (!bookingData.appointmentId || bookingData.appointmentId <= 0) {
      toast.error("Appointment slot is missing. Please select a slot again.");
      return;
    }

    try {
      setIsBooking(true);

      // Prepare data for backend - ensure correct types
      // Only include fields that have values (don't send undefined)
      const requestData: any = {
        doctorId: Number(bookingData.doctorId),
        appointmentId: Number(bookingData.appointmentId),
        patientName: bookingData.patientName.trim(),
        patientPhone: bookingData.patientPhone.trim(),
        patientAge: Number(bookingData.patientAge),
        patientGender: bookingData.patientGender.trim(),
        patientType: bookingData.patientType || "New",
        isOldPatient: bookingData.isOldPatient || false,
        doctorFee: Number(bookingData.doctorFee),
        date: bookingData.date,
        time: bookingData.time,
      };

      // Only add optional fields if they have values
      const trimmedEmail = bookingData.patientEmail?.trim();
      if (trimmedEmail && trimmedEmail.length > 0) {
        requestData.patientEmail = trimmedEmail;
      }
      if (bookingData.patientLocation?.trim()) {
        requestData.patientLocation = bookingData.patientLocation.trim();
      }
      if (bookingData.reasonForVisit?.trim()) {
        requestData.reasonForVisit = bookingData.reasonForVisit.trim();
      }
      if (bookingData.notes?.trim()) {
        requestData.notes = bookingData.notes.trim();
      }

      console.log(
        "[AssistantBookingPage] Calling assistantBookingService.bookPatient with:",
        requestData
      );
      const result = await assistantBookingService.bookPatient(requestData);
      console.log("[AssistantBookingPage] Booking successful, result:", result);
      toast.success("Appointment booked successfully!");
      setShowBookingModal(false);
      setSelectedSlot(null);
      setSelectedSlotUniqueId(null);
      setBookingData({
        doctorId: currentDoctorProfile?.id || 0,
        appointmentId: 0,
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        patientAge: 0,
        patientGender: "",
        patientLocation: "",
        patientType: "New",
        isOldPatient: false,
        doctorFee: currentDoctorProfile?.consultationFee || 0,
        reasonForVisit: "",
        notes: "",
        date: selectedDate,
        time: "",
      });
      // Refresh slots
      if (currentDoctorProfile && selectedDate && selectedClinic) {
        setSlotsLoading(true);
        try {
          const slots = await assistantBookingService.getAvailableSlots(
            currentDoctorProfile.id,
            selectedDate,
            selectedClinic
          );
          setAvailableSlots(slots);
        } catch (error: any) {
          console.error("Failed to refresh slots:", error);
        } finally {
          setSlotsLoading(false);
        }
      }
    } catch (error: any) {
      console.error("Booking error:", error);

      // Handle validation errors (400 Bad Request)
      if (error?.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = "Validation failed: ";

        if (Array.isArray(errorData.message)) {
          // Backend validation errors array
          errorMessage += errorData.message.join(", ");
        } else if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        } else if (errorData.message) {
          errorMessage = JSON.stringify(errorData.message);
        } else {
          errorMessage =
            "Please check all required fields are filled correctly";
        }

        toast.error(errorMessage);
        console.error("Validation errors:", errorData);
      } else if (error?.response?.status === 403) {
        console.error("403 Forbidden - Check user role in JWT token");
        toast.error("Access denied. Please check your permissions.");
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to book appointment";
        toast.error(errorMessage);
      }
    } finally {
      setIsBooking(false);
    }
  };

  const filteredSlots = availableSlots.filter((slot) => {
    if (!selectedDate) return true;
    const slotDate = new Date(slot.date).toISOString().split("T")[0];
    return slotDate === selectedDate;
  });

  // Create individual slots for each patient spot (both booked and available)
  const individualSlots = filteredSlots.flatMap((slot) => {
    const bookedTimes = slot.bookedTimes || [];
    const maxPatients = slot.maxPatients;
    const cards = [];

    // Generate all possible positions (0 to maxPatients-1)
    for (let position = 0; position < maxPatients; position++) {
      // Calculate the time for this position
      const individualStartTime = calculatePatientSlotTime(
        slot.startTime,
        slot.endTime || slot.startTime,
        position,
        maxPatients
      );

      // Check if this time is already booked
      // Compare times in HH:MM format (normalize to handle slight variations)
      const isBooked = bookedTimes.some((bookedTime) => {
        // Normalize both times to HH:MM format for comparison
        const bookedTimeNormalized = bookedTime.substring(0, 5); // "HH:MM"
        const slotTimeNormalized = individualStartTime.substring(0, 5); // "HH:MM"
        return bookedTimeNormalized === slotTimeNormalized;
      });

      // Include ALL positions (both booked and available)
      cards.push({
        ...slot,
        slotIndex: position + 1, // Position number (1, 2, 3, ...)
        totalAvailable: maxPatients - bookedTimes.length,
        individualStartTime, // Each card has its own calculated start time
        uniqueId: `${slot.id}-${position}`, // Unique identifier for selection
        isBooked, // Mark if this slot is booked
      });
    }
    return cards;
  });

  if (!isAssistant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Only assistants can book appointments for patients.
          </p>
        </div>
      </div>
    );
  }

  if (!currentDoctorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
            <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary-600" />
              Book Appointment for Patient
            </h1>
            <p className="text-sm text-gray-600">
              Doctor: Dr. {currentDoctorProfile.name} | Fee: ৳
              {currentDoctorProfile.consultationFee}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1 text-primary-600" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <BuildingOfficeIcon className="h-4 w-4 inline mr-1 text-primary-600" />
                  Select Clinic
                </label>
                <select
                  value={selectedClinic || ""}
                  onChange={(e) =>
                    setSelectedClinic(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Clinics</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.locationName} - {clinic.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Available Slots */}
        {selectedDate && selectedClinic ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary-600" />
              Available Slots
            </h2>
            {slotsLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : individualSlots.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  No available slots found
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try selecting a different date or clinic
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-primary-600" />
                  Time Slots <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 max-h-[500px] overflow-y-auto">
                  {individualSlots.map((slot, index) => {
                    const isSelected = selectedSlotUniqueId === slot.uniqueId;
                    const isBooked = slot.isBooked || false;
                    return (
                      <motion.button
                        key={slot.uniqueId}
                        type="button"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.01 }}
                        whileHover={!isBooked ? { scale: 1.05 } : {}}
                        whileTap={!isBooked ? { scale: 0.95 } : {}}
                        onClick={() => !isBooked && handleSlotSelect(slot)}
                        disabled={isBooked}
                        className={`
                          px-4 py-3 rounded-md transition-all duration-200 text-center font-medium border-2
                          ${
                            isBooked
                              ? "bg-red-600 text-white border-red-600 cursor-not-allowed opacity-75"
                              : isSelected
                              ? "bg-green-700 text-yellow-200 shadow-lg ring-2 ring-green-500 border-green-500"
                              : "bg-green-800 text-yellow-200 border-green-800 hover:bg-white hover:text-black hover:border-green-500 hover:shadow-md"
                          }
                        `}
                      >
                        {formatTimeTo12Hour(
                          slot.individualStartTime || slot.startTime
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Select Date and Clinic
            </h3>
            <p className="text-sm text-gray-600">
              Please select a date and clinic to view available appointment
              slots
            </p>
          </div>
        )}

        {/* Booking Modal */}
        <Modal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          title="Book Appointment for Patient"
          size="md"
        >
          <div className="space-y-3">
            <div className="bg-primary-50 p-2 rounded-md mb-2">
              <p className="text-xs font-medium text-gray-700 mb-0.5">
                Selected Slot:
              </p>
              <p className="text-xs text-gray-600">
                {selectedSlot && bookingData.time && (
                  <>
                    {formatTimeTo12Hour(bookingData.time)} on{" "}
                    {format(new Date(selectedSlot.date), "MMM dd, yyyy")}
                    {selectedSlot.clinic &&
                      ` at ${selectedSlot.clinic.locationName}`}
                  </>
                )}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Patient Name *
              </label>
              <input
                type="text"
                value={bookingData.patientName}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    patientName: e.target.value,
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Email
                </label>
                <input
                  type="email"
                  value={bookingData.patientEmail || ""}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientEmail: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={bookingData.patientPhone}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientPhone: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Age *
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={bookingData.patientAge || ""}
                  onChange={(e) => {
                    const age = parseInt(e.target.value, 10);
                    setBookingData({
                      ...bookingData,
                      patientAge: isNaN(age) ? 0 : age,
                    });
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Gender *
                </label>
                <select
                  value={bookingData.patientGender}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientGender: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Patient Type *
                </label>
                <select
                  value={bookingData.patientType || "New"}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientType: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="New">New</option>
                  <option value="Old">Old</option>
                  <option value="OT">OT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Location
                </label>
                <input
                  type="text"
                  value={bookingData.patientLocation || ""}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientLocation: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Reason for Visit
              </label>
              <textarea
                value={bookingData.reasonForVisit || ""}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    reasonForVisit: e.target.value,
                  })
                }
                rows={2}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Notes
              </label>
              <textarea
                value={bookingData.notes || ""}
                onChange={(e) =>
                  setBookingData({ ...bookingData, notes: e.target.value })
                }
                rows={2}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="bg-yellow-50 p-2 rounded-md border border-yellow-200">
              <p className="text-xs text-gray-700">
                <span className="font-medium">Consultation Fee:</span> ৳
                {bookingData.doctorFee}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedSlot(null);
                }}
                className="text-xs px-3 py-1.5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookAppointment}
                disabled={isBooking}
                className="text-xs px-3 py-1.5"
              >
                {isBooking ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-1.5" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                    Book Appointment
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AssistantBookingPage;
