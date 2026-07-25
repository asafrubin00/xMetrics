import Anthropic from "@anthropic-ai/sdk";
import { parseShortlistResponse } from "@/lib/shortlist";
import { SHORTLIST_SYSTEM_PROMPT } from "@/lib/shortlist-prompt";
import type { Candidate } from "@/lib/candidates.config";
import type { TraitDefinition } from "@/lib/traits.config";

export const maxDuration = 300;

interface ShortlistRequestBody {
  candidates: Candidate[];
  brief: string;
  seatCount: number;
  traitDefinitions: TraitDefinition[];
}

function isShortlistRequestBody(value: unknown): value is ShortlistRequestBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ShortlistRequestBody>;
  return Array.isArray(candidate.candidates) &&
    candidate.candidates.length >= 3 &&
    candidate.candidates.every((person) =>
      typeof person?.id === "string" &&
      typeof person.displayName === "string" &&
      typeof person.role === "string" &&
      typeof person.background === "string" &&
      typeof person.traits === "object" && person.traits !== null,
    ) &&
    typeof candidate.brief === "string" &&
    candidate.brief.trim().length > 0 &&
    typeof candidate.seatCount === "number" &&
    Number.isFinite(candidate.seatCount) &&
    Array.isArray(candidate.traitDefinitions);
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The shortlist request was not valid JSON." }, { status: 400 });
  }

  if (!isShortlistRequestBody(body)) {
    return Response.json({ error: "The shortlist request is incomplete." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Shortlisting is not configured." }, { status: 500 });
  }

  const seatCount = Math.min(6, Math.max(3, Math.trunc(body.seatCount)));
  const candidateIds = new Set(body.candidates.map((candidate) => candidate.id));
  if (candidateIds.size !== body.candidates.length || candidateIds.size < seatCount) {
    return Response.json({ error: "The shortlist candidate pool is invalid." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const userPrompt = `Shortlist candidates for this search brief from the supplied source data:\n${JSON.stringify({ ...body, seatCount })}`;

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let rawResponseText = "";
      const stream = client.messages.stream(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 6_000,
          system: SHORTLIST_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        },
        { signal: AbortSignal.timeout(180_000) },
      );
      stream.on("text", (textDelta) => {
        rawResponseText += textDelta;
      });
      const message = await stream.finalMessage();
      const shortlist = parseShortlistResponse(rawResponseText, candidateIds, seatCount);
      if (shortlist) return Response.json(shortlist);
      console.error("Shortlist response failed validation", {
        attempt: attempt + 1,
        stopReason: message.stop_reason,
        responsePreview: rawResponseText.slice(0, 800),
      });
    }
  } catch (error) {
    console.error("Shortlist generation failed", {
      error,
      status: error instanceof Anthropic.APIError ? error.status : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { error: "The shortlist could not be generated. Please try again." },
      { status: 502 },
    );
  }

  return Response.json(
    { error: "The shortlist could not be generated. Please try again." },
    { status: 502 },
  );
}
