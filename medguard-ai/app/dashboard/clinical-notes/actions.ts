"use server";

import { generateClinicalSoapNote } from "@/lib/ai";
import type {
  ClinicalTemplate,
  MockPatient,
} from "@/lib/clinical-notes/data";

export async function generateClinicalSoapNoteAction(input: {
  patient: MockPatient;
  template: Pick<ClinicalTemplate, "id" | "title" | "description" | "prompt">;
  specialty: string;
  encounterInput: string;
}) {
  return generateClinicalSoapNote(input);
}
