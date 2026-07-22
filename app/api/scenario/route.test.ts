// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const { createMessage } = vi.hoisted(() => ({ createMessage: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: createMessage };
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
  createMessage.mockReset();
  vi.unstubAllEnvs();
});

describe("POST /api/scenario", () => {
  it("retries once after invalid model output and returns the validated scenario", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    createMessage
      .mockResolvedValueOnce({ content: [{ type: "text", text: "not json" }] })
      .mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(scenario) }] });

    const response = await POST(new Request("http://localhost/api/scenario", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(scenario);
    expect(createMessage).toHaveBeenCalledTimes(2);
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-sonnet-4-6" }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
