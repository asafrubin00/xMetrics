// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const { streamMessage } = vi.hoisted(() => ({ streamMessage: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { stream: streamMessage };
  },
}));

import { POST } from "./route";

const streamedDebrief = `===SECTION:whatHappened===
Ada took control.
===SECTION:choiceAnalysis===
The chosen course concentrates execution risk.
===SECTION:investorFindings===
- Ada is the decision bottleneck.
===SECTION:whatWouldChange===
An experienced operator would distribute authority.`;

const requestBody = {
  members: [
    { id: "a", displayName: "Ada", role: "CEO", traits: {} },
    { id: "b", displayName: "Ben", role: "CFO", traits: {} },
    { id: "c", displayName: "Cleo", role: "CTO", traits: {} },
  ],
  signals: [],
  exposures: [],
  traitDefinitions: [],
  scenario: {
    companyContext: "A regulated software company facing a deadline.",
    beats: [
      { index: 1, title: "Setup", body: "Pressure arrives.", memberMoments: [{ memberId: "a", moment: "Ada convenes the team." }] },
      { index: 2, title: "Escalation", body: "Options narrow.", memberMoments: [{ memberId: "b", moment: "Ben tests the downside." }] },
      { index: 3, title: "Decision", body: "The deadline lands.", memberMoments: [{ memberId: "c", moment: "Cleo frames the choice." }] },
    ],
    options: [
      { id: "one", title: "One", description: "First course. First risk." },
      { id: "two", title: "Two", description: "Second course. Second risk." },
      { id: "three", title: "Three", description: "Third course. Third risk." },
    ],
  },
  chosenOptionId: "two",
};

afterEach(() => {
  streamMessage.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/debrief", () => {
  it("streams Anthropic text through without changing the response body", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const chunks = [
      streamedDebrief.slice(0, 70),
      streamedDebrief.slice(70, 180),
      streamedDebrief.slice(180),
    ];
    const result = {
      on: vi.fn((_event: string, listener: (delta: string) => void) => {
        result.listener = listener;
        return result;
      }),
      listener: null as null | ((delta: string) => void),
      finalMessage: vi.fn(async () => {
        for (const chunk of chunks) result.listener?.(chunk);
        return { stop_reason: "end_turn" };
      }),
      abort: vi.fn(),
    };
    streamMessage.mockReturnValue(result);

    const response = await POST(new Request("http://localhost/api/debrief", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe(streamedDebrief);
    expect(streamMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-6",
        max_tokens: 6_000,
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
