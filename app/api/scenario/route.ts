import Anthropic from "@anthropic-ai/sdk";
import { parseScenarioResponse } from "@/lib/scenario";
import { SCENARIO_SYSTEM_PROMPT } from "@/lib/scenario-prompt";
import type { DerivedSignal, PressureExposure, TeamMember } from "@/lib/types";
import type { TraitDefinition } from "@/lib/traits.config";

export const maxDuration = 300;

interface ScenarioRequestBody {
  members: TeamMember[];
  signals: DerivedSignal[];
  exposures: PressureExposure[];
  traitDefinitions: TraitDefinition[];
}

function isScenarioRequestBody(value: unknown): value is ScenarioRequestBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ScenarioRequestBody>;
  return Array.isArray(candidate.members) &&
    candidate.members.length >= 3 &&
    candidate.members.every((member) =>
      typeof member?.id === "string" &&
      typeof member.displayName === "string" &&
      typeof member.role === "string" &&
      typeof member.traits === "object" && member.traits !== null,
    ) &&
    Array.isArray(candidate.signals) &&
    Array.isArray(candidate.exposures) &&
    Array.isArray(candidate.traitDefinitions);
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The scenario request was not valid JSON." }, { status: 400 });
  }

  if (!isScenarioRequestBody(body)) {
    return Response.json({ error: "The scenario request is incomplete." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Scenario generation is not configured." }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const memberIds = new Set(body.members.map((member) => member.id));
  const userPrompt = `Generate a bespoke pressure scenario from this source data:\n${JSON.stringify(body)}`;

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let rawResponseText = "";
      const stream = client.messages.stream(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 6_000,
          system: SCENARIO_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        },
        { signal: AbortSignal.timeout(180_000) },
      );
      stream.on("text", (textDelta) => {
        rawResponseText += textDelta;
      });
      const message = await stream.finalMessage();
      const scenario = parseScenarioResponse(rawResponseText, memberIds);
      if (scenario) return Response.json(scenario);
      console.error("Scenario response failed validation", {
        attempt: attempt + 1,
        stopReason: message.stop_reason,
        responsePreview: rawResponseText.slice(0, 800),
      });
    }
  } catch (error) {
    console.error("Scenario generation failed", {
      error,
      status: error instanceof Anthropic.APIError ? error.status : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { error: "The scenario could not be generated. Please try again." },
      { status: 502 },
    );
  }

  return Response.json(
    { error: "The scenario could not be generated. Please try again." },
    { status: 502 },
  );
}
