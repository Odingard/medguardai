"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  mockPatients,
  type MockPatient,
} from "@/lib/clinical-notes/data";

type PatientStore = {
  patients: MockPatient[];
  activePatientId: string;
  pendingClinicalNotePrefill: string;
  setActivePatient: (patientId: string) => void;
  addPatient: (patient: MockPatient) => void;
  setPendingClinicalNotePrefill: (prefill: string) => void;
  clearPendingClinicalNotePrefill: () => void;
};

export const usePatientStore = create<PatientStore>()(
  persist(
    (set) => ({
      patients: mockPatients,
      activePatientId: mockPatients[0].id,
      pendingClinicalNotePrefill: "",
      setActivePatient: (patientId) => set({ activePatientId: patientId }),
      addPatient: (patient) =>
        set((state) => ({
          patients: [patient, ...state.patients],
          activePatientId: patient.id,
        })),
      setPendingClinicalNotePrefill: (prefill) =>
        set({ pendingClinicalNotePrefill: prefill }),
      clearPendingClinicalNotePrefill: () => set({ pendingClinicalNotePrefill: "" }),
    }),
    {
      name: "medguard-patient-store",
      partialize: (state) => ({
        patients: state.patients,
        activePatientId: state.activePatientId,
        pendingClinicalNotePrefill: state.pendingClinicalNotePrefill,
      }),
    },
  ),
);
