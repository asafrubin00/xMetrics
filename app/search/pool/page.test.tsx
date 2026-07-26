import { cleanup, render, screen, within } from "@testing-library/react";
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

  it("opens a candidate profile with their name and bio", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(screen.getByRole("button", { name: "Open profile for Maya Chen" }));

    const dialog = screen.getByRole("dialog", { name: "Candidate profiles" });
    expect(within(dialog).getByRole("heading", { name: "Maya Chen" })).toBeInTheDocument();
    expect(within(dialog).getByText("Maya has led two regulated software businesses through rapid international growth. She now advises founders navigating the transition to institutional governance.")).toBeInTheDocument();
  });

  it("opens two selected candidates as two profile panels", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(screen.getByRole("button", { name: "Add Maya Chen to compare" }));
    await user.click(screen.getByRole("button", { name: "Add Elena Rossi to compare" }));
    await user.click(screen.getByRole("button", { name: "Compare (2)" }));

    expect(screen.getAllByTestId("profile-panel")).toHaveLength(2);
  });

  it("removes a comparison panel and resizes to one", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(screen.getByRole("button", { name: "Add Maya Chen to compare" }));
    await user.click(screen.getByRole("button", { name: "Add Elena Rossi to compare" }));
    await user.click(screen.getByRole("button", { name: "Compare (2)" }));
    await user.click(screen.getByRole("button", { name: "Remove Maya Chen from comparison" }));

    expect(screen.getAllByTestId("profile-panel")).toHaveLength(1);
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("caps the compare set at four candidates", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(screen.getByRole("button", { name: "Add Maya Chen to compare" }));
    await user.click(screen.getByRole("button", { name: "Add Elena Rossi to compare" }));
    await user.click(screen.getByRole("button", { name: "Add Priya Nair to compare" }));
    await user.click(screen.getByRole("button", { name: "Add Tom Bennett to compare" }));

    expect(screen.getByRole("button", { name: "Add Amina Yusuf to compare" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Compare (4)" })).toBeInTheDocument();
  });
});
