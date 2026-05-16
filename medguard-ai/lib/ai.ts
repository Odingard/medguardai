import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

import {
  generateMockSoapNote,
  type ClinicalTemplate,
  type MockPatient,
  type SoapNote,
} from "@/lib/clinical-notes/data";

export type ClinicalNoteGenerationInput = {
  patient: MockPatient;
  template: Pick<ClinicalTemplate, "id" | "title" | "description" | "prompt">;
  specialty: string;
  encounterInput: string;
};

export type ClinicalNoteGenerationResult = {
  note: SoapNote;
  provider: "openai" | "anthropic" | "mock";
  model: string;
  warning?: string;
};

type AiSoapPayload = SoapNote;

const clinicalNoteSystemPrompt = `You are MedGuard AI, a clinical documentation assistant for licensed medical professionals.

Return only valid JSON with this exact shape:
{
  "subjective": "string",
  "objective": "string",
  "assessment": "string",
  "plan": "string",
  "billingCodes": ["string"],
  "icdCodes": ["string"],
  "confidence": {
    "subjective": number,
    "objective": number,
    "assessment": number,
    "plan": number,
    "billing": number,
    "overall": number
  }
}

Rules:
- Create a concise SOAP note from the encounter input.
- Do not invent facts that are not present. Mark uncertain details as "not documented".
- Suggested ICD/CPT/E/M codes are draft suggestions for provider review, not billing advice.
- Keep medical language professional and accurate.
- Confidence scores must be integers from 0 to 100.`;

function getMockResult(input: ClinicalNoteGenerationInput): ClinicalNoteGenerationResult {
  return {
    note: generateMockSoapNote({
      patient: input.patient,
      template: input.template,
      input: `${input.encounterInput}\nSpecialty: ${input.specialty}`,
    }),
    provider: "mock",
    model: "mock-clinical-soap-v1",
    warning:
      "No OPENAI_API_KEY or ANTHROPIC_API_KEY configured, so MedGuard used a deterministic mock SOAP generator.",
  };
}

function buildUserPrompt(input: ClinicalNoteGenerationInput) {
  return [
    `Patient: ${input.patient.name}`,
    `Age: ${input.patient.age}`,
    `DOB: ${input.patient.dob}`,
    `Visit reason: ${input.patient.reason}`,
    `Template: ${input.template.title}`,
    `Specialty: ${input.specialty}`,
    "",
    "Encounter input:",
    input.encounterInput || "No encounter input documented.",
  ].join("\n");
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function normalizeSoapPayload(payload: Partial<AiSoapPayload>): SoapNote {
  return {
    subjective: payload.subjective || "Not documented.",
    objective: payload.objective || "Not documented.",
    assessment: payload.assessment || "Not documented.",
    plan: payload.plan || "Not documented.",
    billingCodes: payload.billingCodes?.length ? payload.billingCodes : ["99213"],
    icdCodes: payload.icdCodes?.length ? payload.icdCodes : ["Z00.00"],
    confidence: {
      subjective: payload.confidence?.subjective ?? 80,
      objective: payload.confidence?.objective ?? 75,
      assessment: payload.confidence?.assessment ?? 75,
      plan: payload.confidence?.plan ?? 75,
      billing: payload.confidence?.billing ?? 65,
      overall: payload.confidence?.overall ?? 75,
    },
  };
}

async function generateWithOpenAI(
  input: ClinicalNoteGenerationInput,
): Promise<ClinicalNoteGenerationResult> {
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: clinicalNoteSystemPrompt },
      { role: "user", content: buildUserPrompt(input) },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty clinical note response.");
  }

  return {
    note: normalizeSoapPayload(JSON.parse(extractJson(content))),
    provider: "openai",
    model,
  };
}

async function generateWithAnthropic(
  input: ClinicalNoteGenerationInput,
): Promise<ClinicalNoteGenerationResult> {
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await client.messages.create({
    model,
    max_tokens: 1800,
    temperature: 0.2,
    system: clinicalNoteSystemPrompt,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const content = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n")
    .trim();

  if (!content) {
    throw new Error("Anthropic returned an empty clinical note response.");
  }

  return {
    note: normalizeSoapPayload(JSON.parse(extractJson(content))),
    provider: "anthropic",
    model,
  };
}

export async function generateClinicalSoapNote(
  input: ClinicalNoteGenerationInput,
): Promise<ClinicalNoteGenerationResult> {
  try {
    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(input);
    }

    if (process.env.ANTHROPIC_API_KEY) {
      return await generateWithAnthropic(input);
    }

    return getMockResult(input);
  } catch (error) {
    const fallback = getMockResult(input);

    return {
      ...fallback,
      warning:
        error instanceof Error
          ? "Live AI provider unavailable. Used safe mock fallback."
          : "Live AI provider unavailable. Used safe mock fallback.",
    };
  }
}


export type ClinicalTextGenerationInput = ClinicalNoteGenerationInput & {
  note?: SoapNote | null;
  instruction?: string;
};

function formatNoteForPrompt(note?: SoapNote | null) {
  if (!note) {
    return "No generated SOAP note yet.";
  }

  return [
    "SUBJECTIVE",
    note.subjective,
    "OBJECTIVE",
    note.objective,
    "ASSESSMENT",
    note.assessment,
    "PLAN",
    note.plan,
    `Billing: ${note.billingCodes.join(", ")}`,
    `ICD-10: ${note.icdCodes.join(", ")}`,
  ].join("\n");
}

async function generateClinicalText({
  input,
  task,
}: {
  input: ClinicalTextGenerationInput;
  task: string;
}) {
  const prompt = [
    task,
    "",
    buildUserPrompt(input),
    "",
    "Current note:",
    formatNoteForPrompt(input.note),
    input.instruction ? `Instruction: ${input.instruction}` : "",
  ].join("\n");

  try {
    if (process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const model = process.env.OPENAI_MODEL || "gpt-4o";
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are MedGuard AI. Produce concise, medically careful clinical text for provider review. Do not invent facts.",
          },
          { role: "user", content: prompt },
        ],
      });

      return {
        text: completion.choices[0]?.message?.content || "No AI text returned.",
        provider: "openai" as const,
        model,
      };
    }

    if (process.env.ANTHROPIC_API_KEY) {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
      const message = await client.messages.create({
        model,
        max_tokens: 1200,
        temperature: 0.2,
        system:
          "You are MedGuard AI. Produce concise, medically careful clinical text for provider review. Do not invent facts.",
        messages: [{ role: "user", content: prompt }],
      });

      return {
        text: message.content
          .map((block) => (block.type === "text" ? block.text : ""))
          .join("\n")
          .trim(),
        provider: "anthropic" as const,
        model,
      };
    }
  } catch {
    return {
      text:
        `Live AI provider unavailable. Using safe mock fallback.\n\n${mockClinicalText(input, task)}`,
      provider: "mock" as const,
      model: "mock-clinical-text-v1",
    };
  }

  return {
    text: mockClinicalText(input, task),
    provider: "mock" as const,
    model: "mock-clinical-text-v1",
  };
}

function mockClinicalText(input: ClinicalTextGenerationInput, task: string) {
  if (task.includes("patient instructions")) {
    return [
      `Patient Instructions for ${input.patient.name}`,
      "- Continue medications as discussed unless your clinician changes them.",
      "- Monitor symptoms and follow the care plan from today's visit.",
      "- Seek urgent care for chest pain, severe shortness of breath, fainting, or worsening symptoms.",
      "- Follow up as scheduled and complete any ordered labs or referrals.",
    ].join("\n");
  }

  if (task.includes("referral letter")) {
    return [
      `Referral Letter: ${input.patient.name}`,
      `Reason for referral: ${input.patient.reason}`,
      "Clinical summary: Please evaluate and advise based on the attached MedGuard AI provider-reviewed note.",
      "Pertinent details: See SOAP assessment and plan. No additional facts should be assumed from this draft.",
    ].join("\n");
  }

  return [
    "Magic Edit Result",
    input.instruction || "Refine the note for clarity and provider review.",
    "Updated note should remain concise, factual, and ready for clinician sign-off.",
  ].join("\n");
}

export async function generatePatientInstructions(input: ClinicalTextGenerationInput) {
  return generateClinicalText({
    input,
    task: "Generate patient instructions in plain language from the current visit and SOAP note.",
  });
}

export async function generateReferralLetter(input: ClinicalTextGenerationInput) {
  return generateClinicalText({
    input,
    task: "Generate a referral letter for the appropriate specialist from the current visit and SOAP note.",
  });
}

export async function magicEditClinicalNote(input: ClinicalTextGenerationInput) {
  return generateClinicalText({
    input,
    task: "Magic edit this clinical note according to the instruction while preserving medical accuracy.",
  });
}
