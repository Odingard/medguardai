"use server";

import { generateClinicalSoapNote } from "@/lib/ai";
import type {
  ClinicalTemplate,
  MockPatient,
} from "@/lib/clinical-notes/data";

export async function generateClinicalSoapNoteAction(input: {
  patient: MockPatient;
  template: ClinicalTemplate;
  specialty: string;
  encounterInput: string;
}) {
  return generateClinicalSoapNote(input);
}
