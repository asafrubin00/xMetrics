import Anthropic from "@anthropic-ai/sdk";
import { DEBRIEF_SYSTEM_PROMPT } from "@/lib/debrief-prompt";
import { validateScenario } from "@/lib/scenario";
import type { TraitDefinition } from "@/lib/traits.config";
import type {
  DerivedSignal,
  PressureExposure,
  Scenario,
  TeamMember,
} from "@/lib/types";

export const maxDuration = 300;

interface DebriefRequestBody {
  members: TeamMember[];
  signals: DerivedSignal[];
  exposures: PressureExposure[];
  traitDefinitions: TraitDefinition[];
  scenario: Scenario;
  chosenOptionId: string;
}

function isDebriefRequestBody(value: unknown): value is DebriefRequestBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<DebriefRequestBody>;
  if (!Array.isArray(candidate.members) ||
    candidate.members.length < 3 ||
    !candidate.members.every((member) =>
      typeof member?.id === "string" &&
      typeof member.displayName === "string" &&
      typeof member.role === "string" &&
      typeof member.traits === "object" &&
      member.traits !== null,
    ) ||
    !Array.isArray(candidate.signals) ||
    !Array.isArray(candidate.exposures) ||
    !Array.isArray(candidate.traitDefinitions) ||
    typeof candidate.chosenOptionId !== "string") {
    return false;
  }

  const memberIds = new Set(candidate.members.map((member) => member.id));
  return validateScenario(candidate.scenario, memberIds) &&
    candidate.scenario.options.some((option) => option.id === candidate.chosenOptionId);
}

function logAnthropicError(error: unknown): void {
  console.error("Debrief generation failed", {
    error,
    status: error instanceof Anthropic.APIError ? error.status : undefined,
    message: error instanceof Error ? error.message : String(error),
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The debrief request was not valid JSON." }, { status: 400 });
  }

  if (!isDebriefRequestBody(body)) {
    return Response.json({ error: "The debrief request is incomplete." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Debrief generation is not configured." }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let anthropicStream: ReturnType<typeof client.messages.stream>;

  try {
    anthropicStream = client.messages.stream(
      {
        model: "claude-sonnet-4-6",
        max_tokens: 6_000,
        system: DEBRIEF_SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `Produce the team-specific debrief from this source data:\n${JSON.stringify(body)}`,
        }],
      },
      { signal: AbortSignal.timeout(180_000) },
    );
  } catch (error) {
    logAnthropicError(error);
    return Response.json(
      { error: "The debrief could not be generated. Please try again." },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const responseStream = new ReadableStream<Uint8Array>({
    start(controller) {
      anthropicStream.on("text", (textDelta: string) => {
        controller.enqueue(encoder.encode(textDelta));
      });
      void anthropicStream.finalMessage()
        .then(() => controller.close())
        .catch((error: unknown) => {
          logAnthropicError(error);
          controller.error(error);
        });
    },
    cancel() {
      anthropicStream.abort();
    },
  });

  return new Response(responseStream, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
