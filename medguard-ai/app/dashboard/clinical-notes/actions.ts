"use server";

import {
  generateClinicalSoapNote,
  generatePatientInstructions,
  generateReferralLetter,
  magicEditClinicalNote,
} from "@/lib/ai";
import type {
  ClinicalTemplate,
  MockPatient,
} from "@/lib/clinical-notes/data";

type ClinicalNoteActionInput = {
  patient: MockPatient;
  template: Pick<ClinicalTemplate, "id" | "title" | "description" | "prompt">;
  specialty: string;
  encounterInput: string;
  note?: Parameters<typeof generatePatientInstructions>[0]["note"];
  instruction?: string;
};

export async function generateClinicalSoapNoteAction(input: ClinicalNoteActionInput) {
  return generateClinicalSoapNote(input);
}

export async function generatePatientInstructionsAction(input: ClinicalNoteActionInput) {
  return generatePatientInstructions(input);
}

export async function generateReferralLetterAction(input: ClinicalNoteActionInput) {
  return generateReferralLetter(input);
}

export async function magicEditClinicalNoteAction(input: ClinicalNoteActionInput) {
  return magicEditClinicalNote(input);
}
