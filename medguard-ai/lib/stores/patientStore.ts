"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  mockPatients,
  type MockPatient,
} from "@/lib/clinical-notes/data";

export type ModuleHandoffSource =
  | "smart-intake"
  | "data-migration"
  | "patient-directory";

export type ClinicalNoteHandoff = {
  patientId: string;
  source: ModuleHandoffSource;
  prefill: string;
};

type PatientStore = {
  patients: MockPatient[];
  currentPatientId: string;
  recentPatientIds: string[];
  clinicalNoteHandoff: ClinicalNoteHandoff | null;
  patientWorkspaceOpen: boolean;
  activePatientId: string;
  pendingClinicalNotePrefill: string;
  setCurrentPatient: (patientId: string) => void;
  openPatientWorkspace: (patientId: string) => void;
  closePatientWorkspace: () => void;
  setActivePatient: (patientId: string) => void;
  addPatient: (patient: MockPatient) => void;
  prepareClinicalNoteHandoff: (handoff: ClinicalNoteHandoff) => void;
  setPendingClinicalNotePrefill: (prefill: string) => void;
  clearClinicalNoteHandoff: () => void;
  clearPendingClinicalNotePrefill: () => void;
};

function withRecentPatient(patientId: string, recentPatientIds: string[]) {
  return [patientId, ...recentPatientIds.filter((id) => id !== patientId)].slice(
    0,
    5,
  );
}

export const usePatientStore = create<PatientStore>()(
  persist(
    (set) => ({
      patients: mockPatients,
      currentPatientId: mockPatients[0].id,
      activePatientId: mockPatients[0].id,
      patientWorkspaceOpen: false,
      recentPatientIds: [mockPatients[0].id],
      clinicalNoteHandoff: null,
      pendingClinicalNotePrefill: "",
      setCurrentPatient: (patientId) =>
        set((state) => ({
          currentPatientId: patientId,
          activePatientId: patientId,
          patientWorkspaceOpen: true,
          recentPatientIds: withRecentPatient(patientId, state.recentPatientIds),
        })),
      openPatientWorkspace: (patientId) =>
        set((state) => ({
          currentPatientId: patientId,
          activePatientId: patientId,
          patientWorkspaceOpen: true,
          recentPatientIds: withRecentPatient(patientId, state.recentPatientIds),
        })),
      closePatientWorkspace: () =>
        set({ patientWorkspaceOpen: false, clinicalNoteHandoff: null, pendingClinicalNotePrefill: "" }),
      setActivePatient: (patientId) =>
        set((state) => ({
          currentPatientId: patientId,
          activePatientId: patientId,
          patientWorkspaceOpen: true,
          recentPatientIds: withRecentPatient(patientId, state.recentPatientIds),
        })),
      addPatient: (patient) =>
        set((state) => ({
          patients: [patient, ...state.patients],
          currentPatientId: patient.id,
          activePatientId: patient.id,
          patientWorkspaceOpen: true,
          recentPatientIds: withRecentPatient(patient.id, state.recentPatientIds),
        })),
      prepareClinicalNoteHandoff: (handoff) =>
        set((state) => ({
          currentPatientId: handoff.patientId,
          activePatientId: handoff.patientId,
          patientWorkspaceOpen: true,
          recentPatientIds: withRecentPatient(
            handoff.patientId,
            state.recentPatientIds,
          ),
          clinicalNoteHandoff: handoff,
          pendingClinicalNotePrefill: handoff.prefill,
        })),
      setPendingClinicalNotePrefill: (prefill) =>
        set({ pendingClinicalNotePrefill: prefill }),
      clearClinicalNoteHandoff: () =>
        set({ clinicalNoteHandoff: null, pendingClinicalNotePrefill: "" }),
      clearPendingClinicalNotePrefill: () =>
        set({ clinicalNoteHandoff: null, pendingClinicalNotePrefill: "" }),
    }),
    {
      name: "medguard-patient-store",
      partialize: (state) => ({
        patients: state.patients,
        currentPatientId: state.currentPatientId,
        activePatientId: state.activePatientId,
        patientWorkspaceOpen: state.patientWorkspaceOpen,
        recentPatientIds: state.recentPatientIds,
        clinicalNoteHandoff: state.clinicalNoteHandoff,
        pendingClinicalNotePrefill: state.pendingClinicalNotePrefill,
      }),
    },
  ),
);
