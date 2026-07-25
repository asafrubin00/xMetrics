import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import CandidatePoolPage from "./page";

afterEach(() => {
  cleanup();
});

describe("CandidatePoolPage", () => {
  it("renders all 50 candidate cards", () => {
    render(<CandidatePoolPage />);
    expect(screen.getAllByTestId("pool-candidate-card")).toHaveLength(50);
  });

  it("shows the pool count in the header", () => {
    render(<CandidatePoolPage />);
    expect(screen.getByTestId("pool-count")).toHaveTextContent("50");
  });

  it("updates the cards and live count when a facet is selected", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(screen.getByText("Industry"));
    await user.click(screen.getByRole("checkbox", { name: "Healthcare" }));

    expect(screen.getAllByTestId("pool-candidate-card").length).toBeLessThan(50);
    expect(screen.getByTestId("pool-count")).not.toHaveTextContent("50 of 50");
  });
});
