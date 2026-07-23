// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const { streamMessage } = vi.hoisted(() => ({ streamMessage: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { stream: streamMessage };
  },
}));

import { POST } from "./route";

const scenario = {
  companyContext: "A regulated software company facing a financing deadline.",
  beats: [
    { index: 1, title: "Setup", body: "Pressure arrives.", memberMoments: [{ memberId: "a", moment: "Ada convenes the team." }] },
    { index: 2, title: "Escalation", body: "The options narrow.", memberMoments: [{ memberId: "b", moment: "Ben challenges the assumptions." }] },
    { index: 3, title: "Decision", body: "The deadline lands.", memberMoments: [{ memberId: "c", moment: "Cleo frames the choice." }] },
  ],
  options: [
    { id: "one", title: "One", description: "First course. First risk." },
    { id: "two", title: "Two", description: "Second course. Second risk." },
    { id: "three", title: "Three", description: "Third course. Third risk." },
  ],
};

const requestBody = {
  members: [
    { id: "a", displayName: "Ada", role: "CEO", traits: {} },
    { id: "b", displayName: "Ben", role: "CFO", traits: {} },
    { id: "c", displayName: "Cleo", role: "CTO", traits: {} },
  ],
  signals: [],
  exposures: [],
  traitDefinitions: [],
};

afterEach(() => {
  streamMessage.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/scenario", () => {
  it("retries once after invalid model output and returns the validated scenario", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const streamResult = (text: string) => {
      const result = {
        on: vi.fn((_event: string, listener: (delta: string) => void) => {
          listener(text);
          return result;
        }),
        finalMessage: vi.fn().mockResolvedValue({ stop_reason: "end_turn" }),
      };
      return result;
    };
    streamMessage
      .mockReturnValueOnce(streamResult("not json"))
      .mockReturnValueOnce(streamResult(JSON.stringify(scenario)));

    const response = await POST(new Request("http://localhost/api/scenario", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(scenario);
    expect(streamMessage).toHaveBeenCalledTimes(2);
    expect(streamMessage).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-sonnet-4-6", max_tokens: 6_000 }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
