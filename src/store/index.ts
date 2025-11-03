import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import appointmentSlice from './slices/appointmentSlice';
import doctorSlice from './slices/doctorSlice';
import patientSlice from './slices/patientSlice';
import clinicSlice from './slices/clinicSlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';
import assistantSlice from './slices/assistantSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appointments: appointmentSlice,
    doctors: doctorSlice,
    patients: patientSlice,
    clinics: clinicSlice,
    ui: uiSlice,
    users: userSlice,
    assistants: assistantSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
