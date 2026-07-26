import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import CandidatePoolPage from "./page";

afterEach(() => {
  cleanup();
});

describe("CandidatePoolPage", () => {
  function cardFor(name: string) {
    const openProfile = screen.getByRole("button", { name: `Open profile for ${name}` });
    const card = openProfile.closest("article");
    if (!card) throw new Error(`Card not found for ${name}`);
    return within(card);
  }

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

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Compare" }));
    await user.click(cardFor("Elena Rossi").getByRole("button", { name: "Compare" }));
    await user.click(screen.getByRole("button", { name: "Compare (2)" }));

    expect(screen.getAllByTestId("profile-panel")).toHaveLength(2);
  });

  it("removes a comparison panel and resizes to one", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Compare" }));
    await user.click(cardFor("Elena Rossi").getByRole("button", { name: "Compare" }));
    await user.click(screen.getByRole("button", { name: "Compare (2)" }));
    await user.click(screen.getByRole("button", { name: "Remove Maya Chen from comparison" }));

    expect(screen.getAllByTestId("profile-panel")).toHaveLength(1);
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("caps the compare set at four candidates", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Compare" }));
    await user.click(cardFor("Elena Rossi").getByRole("button", { name: "Compare" }));
    await user.click(cardFor("Priya Nair").getByRole("button", { name: "Compare" }));
    await user.click(cardFor("Tom Bennett").getByRole("button", { name: "Compare" }));

    expect(cardFor("Amina Yusuf").getByRole("button", { name: "Compare" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Compare (4)" })).toBeInTheDocument();
  });

  it("adds a candidate to the long list and shows its selected state", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    const mayaCard = cardFor("Maya Chen");
    const addButton = mayaCard.getByRole("button", { name: "Add to long list" });
    await user.click(addButton);

    expect(screen.getByRole("button", { name: "View current long list (1)" })).toBeInTheDocument();
    expect(addButton).toHaveAttribute("aria-pressed", "true");
    expect(addButton).toHaveTextContent("✓");
    expect(addButton.closest("article")).toHaveClass("border-gold-500");
  });

  it("lists an added candidate in the panel and removes them", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Add to long list" }));
    await user.click(screen.getByRole("button", { name: "View current long list (1)" }));

    const dialog = screen.getByRole("dialog", { name: "Current long list" });
    expect(within(dialog).getByRole("button", { name: "Open profile for Maya Chen" })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Remove Maya Chen from long list" }));

    expect(within(dialog).getByText("No candidates yet — add people with ＋")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View current long list (1)" })).not.toBeInTheDocument();
  });

  it("keeps compare and long-list selection independent", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    const mayaCard = cardFor("Maya Chen");
    const compareButton = mayaCard.getByRole("button", { name: "Compare" });
    const longListButton = mayaCard.getByRole("button", { name: "Add to long list" });
    await user.click(compareButton);

    expect(compareButton).toHaveAttribute("aria-pressed", "true");
    expect(longListButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("button", { name: /View current long list/ })).not.toBeInTheDocument();

    await user.click(longListButton);
    expect(compareButton).toHaveAttribute("aria-pressed", "true");
    expect(longListButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Compare (1)" })).toBeInTheDocument();
  });

  it("caps the long list at twenty candidates", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);
    const cards = screen.getAllByTestId("pool-candidate-card");

    for (const card of cards.slice(0, 20)) {
      await user.click(within(card).getByRole("button", { name: "Add to long list" }));
    }

    expect(screen.getByRole("button", { name: "View current long list (20)" })).toBeInTheDocument();
    expect(within(cards[20]).getByRole("button", { name: "Add to long list" })).toBeDisabled();
  });

  it("shows the long-list panel and pool cards together in split view", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Add to long list" }));
    await user.click(screen.getByRole("button", { name: "View current long list (1)" }));

    const dialog = screen.getByRole("dialog", { name: "Current long list" });
    expect(within(dialog).getByRole("button", { name: "Open profile for Maya Chen" })).toBeInTheDocument();
    expect(screen.getAllByTestId("pool-candidate-card")).toHaveLength(50);
  });

  it("returns to the full grid when the long-list panel closes", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Add to long list" }));
    await user.click(screen.getByRole("button", { name: "View current long list (1)" }));
    await user.click(screen.getByRole("button", { name: "Close current long list" }));

    expect(screen.queryByRole("dialog", { name: "Current long list" })).not.toBeInTheDocument();
    expect(screen.getAllByTestId("pool-candidate-card")).toHaveLength(50);
  });

  it("keeps card actions working while the long-list panel is open", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Add to long list" }));
    await user.click(screen.getByRole("button", { name: "View current long list (1)" }));
    const elenaCompareButton = cardFor("Elena Rossi").getByRole("button", { name: "Compare" });
    await user.click(elenaCompareButton);

    expect(elenaCompareButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Compare (1)" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Current long list" })).toBeInTheDocument();
  });

  it("disables shortlist hand-off until three candidates are selected", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Add to long list" }));
    await user.click(screen.getByRole("button", { name: "View current long list (1)" }));

    expect(screen.getByRole("button", { name: "Build shortlist →" })).toBeDisabled();
    expect(screen.getByTitle("Add at least 3 to shortlist")).toBeInTheDocument();
  });

  it("links a three-person long list to the shortlist screen", async () => {
    const user = userEvent.setup();
    render(<CandidatePoolPage />);

    await user.click(cardFor("Maya Chen").getByRole("button", { name: "Add to long list" }));
    await user.click(cardFor("Elena Rossi").getByRole("button", { name: "Add to long list" }));
    await user.click(cardFor("Priya Nair").getByRole("button", { name: "Add to long list" }));
    await user.click(screen.getByRole("button", { name: "View current long list (3)" }));

    expect(screen.getByRole("link", { name: "Build shortlist →" })).toHaveAttribute(
      "href",
      "/search?ll=maya-chen,elena-rossi,priya-nair",
    );
  });
});
