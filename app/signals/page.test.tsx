import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionProvider } from "@/components/session-provider";
import { DEMO_TEAM, PERSONAS } from "@/lib/personas.config";
import TeamSignals from "./page";

describe("TeamSignals", () => {
  it("renders signal cards for the demo team", () => {
    const demoMembers = DEMO_TEAM.map((id) => {
      const persona = PERSONAS.find((candidate) => candidate.id === id);
      if (!persona) throw new Error(`Unknown demo persona: ${id}`);
      return persona;
    });

    render(<SessionProvider initialMembers={demoMembers}><TeamSignals /></SessionProvider>);

    expect(screen.getByRole("heading", { name: "Team signals" })).toBeInTheDocument();
    expect(screen.getAllByTestId("signal-card").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Concentration").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Vacuum").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Polarity").length).toBeGreaterThan(0);
  });
});
