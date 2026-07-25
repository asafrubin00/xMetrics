// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const { streamMessage } = vi.hoisted(() => ({ streamMessage: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { stream: streamMessage };
  },
}));

import { POST } from "./route";

const candidates = ["a", "b", "c", "d"].map((id) => ({
  id,
  displayName: id.toUpperCase(),
  role: "NED",
  background: "Board experience.",
  traits: {},
}));
const shortlist = {
  picks: [
    { candidateId: "a", rank: 1, reason: "Calm and experienced." },
    { candidateId: "b", rank: 2, reason: "Tests the downside." },
    { candidateId: "c", rank: 3, reason: "Builds alignment." },
  ],
  ranked: [
    { candidateId: "a", rank: 1 },
    { candidateId: "b", rank: 2 },
    { candidateId: "c", rank: 3 },
    { candidateId: "d", rank: 4 },
  ],
};
const requestBody = {
  candidates,
  brief: "Find a measured chair.",
  seatCount: 3,
  traitDefinitions: [],
};

function streamResult(text: string) {
  const result = {
    on: vi.fn((_event: string, listener: (delta: string) => void) => {
      listener(text);
      return result;
    }),
    finalMessage: vi.fn().mockResolvedValue({ stop_reason: "end_turn" }),
  };
  return result;
}

afterEach(() => {
  streamMessage.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/shortlist", () => {
  it("retries once after invalid model output and returns the validated shortlist", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    streamMessage
      .mockReturnValueOnce(streamResult("not json"))
      .mockReturnValueOnce(streamResult(JSON.stringify(shortlist)));

    const response = await POST(new Request("http://localhost/api/shortlist", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(shortlist);
    expect(streamMessage).toHaveBeenCalledTimes(2);
    expect(streamMessage).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-sonnet-4-6", max_tokens: 6_000 }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("clamps the requested seat count before prompting and validating", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    streamMessage.mockReturnValueOnce(streamResult(JSON.stringify(shortlist)));

    const response = await POST(new Request("http://localhost/api/shortlist", {
      method: "POST",
      body: JSON.stringify({ ...requestBody, seatCount: 1 }),
      headers: { "Content-Type": "application/json" },
    }));

    expect(response.status).toBe(200);
    expect(streamMessage.mock.calls[0][0].messages[0].content).toContain('"seatCount":3');
  });

  it("rejects model output containing an unknown candidate id", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const invalid = structuredClone(shortlist);
    invalid.ranked[3].candidateId = "outsider";
    streamMessage
      .mockReturnValueOnce(streamResult(JSON.stringify(invalid)))
      .mockReturnValueOnce(streamResult(JSON.stringify(invalid)));

    const response = await POST(new Request("http://localhost/api/shortlist", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    }));

    expect(response.status).toBe(502);
    expect(streamMessage).toHaveBeenCalledTimes(2);
  });
});
