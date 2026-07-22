import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Session } from "@/lib/types";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

const session: Session = {
  members: [
    { id: "a", displayName: "Ada", role: "CEO", traits: {} },
    { id: "b", displayName: "Ben", role: "CFO", traits: {} },
    { id: "c", displayName: "Cleo", role: "CTO", traits: {} },
  ],
  signals: [],
  exposures: [],
  scenario: {
    companyContext: "A growth company facing a funding deadline.",
    beats: [
      { index: 1, title: "The forecast moves", body: "The board pack changes.", memberMoments: [{ memberId: "a", moment: "Ada convenes the team." }] },
      { index: 2, title: "Terms harden", body: "The investor changes position.", memberMoments: [{ memberId: "b", moment: "Ben tests the downside." }] },
      { index: 3, title: "The decision", body: "The deadline arrives.", memberMoments: [{ memberId: "c", moment: "Cleo protects the product plan." }] },
    ],
    options: [
      { id: "one", title: "Accept the terms", description: "Secure the runway. Absorb the governance cost." },
      { id: "two", title: "Build a bridge", description: "Ask insiders for time. Carry financing risk." },
      { id: "three", title: "Reset the plan", description: "Reduce the burn. Preserve strategic control." },
    ],
  },
};

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/components/session-provider", () => ({
  useSession: () => ({
    session,
    setScenario: vi.fn(),
    setChosenOptionId: vi.fn(),
  }),
}));

import ScenarioPage from "./page";

describe("ScenarioPage", () => {
  it("reveals three beats in order before presenting the options", async () => {
    const user = userEvent.setup();
    render(<ScenarioPage />);

    expect(screen.getByRole("heading", { name: "The forecast moves" })).toBeInTheDocument();
    expect(screen.queryByText("Accept the terms")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Terms harden" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "The decision" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Accept the terms/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Build a bridge/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reset the plan/ })).toBeInTheDocument();
  });
});
