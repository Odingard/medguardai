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
  template: ClinicalTemplate;
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
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
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
          ? `AI provider failed: ${error.message}. Used mock fallback.`
          : "AI provider failed. Used mock fallback.",
    };
  }
}
