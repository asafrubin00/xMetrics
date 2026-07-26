import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import SearchPage from "./page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/search");
});

describe("SearchPage", () => {
  it("falls back to an 18-person long list and empty shortlist", () => {
    render(<SearchPage />);
    expect(screen.getByText("Long list")).toBeInTheDocument();
    expect(screen.getByLabelText("The brief")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Let the agent build your shortlist" })).toBeInTheDocument();
    expect(screen.getByText("Maya Chen")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Candidate /)).toHaveLength(18);
    expect(screen.getAllByLabelText("Empty seat")).toHaveLength(5);
  });

  it("renders only the candidates supplied in the long-list parameter", () => {
    window.history.replaceState({}, "", "/search?ll=alice-morgan,benoit-laurent");

    render(<SearchPage />);

    expect(screen.getByText("Long list")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Candidate /)).toHaveLength(2);
    expect(screen.getByLabelText("Candidate Alice Morgan")).toBeInTheDocument();
    expect(screen.getByLabelText("Candidate Benoit Laurent")).toBeInTheDocument();
    expect(screen.queryByLabelText("Candidate Maya Chen")).not.toBeInTheDocument();
  });

  it("lets the researcher build and edit the shortlist manually", async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      {},
      "",
      "/search?ll=maya-chen,elena-rossi,priya-nair&mode=manual",
    );
    render(<SearchPage />);

    expect(screen.queryByLabelText("The brief")).not.toBeInTheDocument();
    expect(screen.queryByText("Runners-up")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Let the agent build your shortlist" })).toHaveAttribute(
      "href",
      "/search?ll=maya-chen,elena-rossi,priya-nair",
    );

    const mayaCard = screen.getByRole("button", { name: "Candidate Maya Chen" });
    await user.click(mayaCard);
    expect(screen.getByLabelText("Maya Chen, CEO")).toBeInTheDocument();
    expect(mayaCard).toHaveClass("border-gold-500/70");

    await user.click(mayaCard);
    expect(screen.queryByLabelText("Maya Chen, CEO")).not.toBeInTheDocument();

    await user.click(mayaCard);
    await user.click(screen.getByLabelText("Maya Chen, CEO"));
    expect(screen.queryByLabelText("Maya Chen, CEO")).not.toBeInTheDocument();
  });

  it("submits the brief and seats the returned finalists", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      picks: [
        { candidateId: "maya-chen", rank: 1, reason: "Makes clear decisions in uncertain markets." },
        { candidateId: "elena-rossi", rank: 2, reason: "Builds dependable controls without drama." },
        { candidateId: "priya-nair", rank: 3, reason: "Tests assumptions and owns the numbers." },
      ],
      ranked: [
        { candidateId: "maya-chen", rank: 1 },
        { candidateId: "elena-rossi", rank: 2 },
        { candidateId: "priya-nair", rank: 3 },
        { candidateId: "tom-bennett", rank: 4 },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await user.selectOptions(screen.getByLabelText("Finalists"), "3");
    await user.click(screen.getByRole("button", { name: "Let the agent build your shortlist" }));

    expect(await screen.findByText("Team dynamics")).toBeInTheDocument();
    expect(screen.getByText("Click a seated finalist to see the agent’s reason.")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Maya Chen, CEO"));
    expect(screen.getByText("Makes clear decisions in uncertain markets.")).toBeInTheDocument();
    expect(screen.getAllByText("Tom Bennett")).toHaveLength(2);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/shortlist", expect.objectContaining({ method: "POST" }));
  });

  it("lets the researcher replace and remove finalists", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      picks: [
        { candidateId: "maya-chen", rank: 1, reason: "Makes clear decisions in uncertain markets." },
        { candidateId: "elena-rossi", rank: 2, reason: "Builds dependable controls without drama." },
        { candidateId: "priya-nair", rank: 3, reason: "Tests assumptions and owns the numbers." },
      ],
      ranked: [
        { candidateId: "maya-chen", rank: 1 },
        { candidateId: "elena-rossi", rank: 2 },
        { candidateId: "priya-nair", rank: 3 },
        { candidateId: "tom-bennett", rank: 4 },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    await user.selectOptions(screen.getByLabelText("Finalists"), "3");
    await user.click(screen.getByRole("button", { name: "Let the agent build your shortlist" }));
    await screen.findByText("Team dynamics");

    const dataTransfer = {
      data: "",
      effectAllowed: "",
      dropEffect: "",
      setData(_type: string, value: string) { this.data = value; },
      getData() { return this.data; },
    };
    fireEvent.dragStart(screen.getByLabelText("Candidate Tom Bennett"), { dataTransfer });
    fireEvent.drop(screen.getByLabelText("Maya Chen, CEO"), { dataTransfer });
    expect(screen.getByLabelText("Tom Bennett, CTO")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Tom Bennett, CTO"));
    expect(screen.getByText("Added by you during refinement.")).toBeInTheDocument();

    fireEvent.dragStart(screen.getByLabelText("Tom Bennett, CTO"), { dataTransfer });
    fireEvent.drop(screen.getByLabelText("Remove finalist"), { dataTransfer });
    expect(screen.queryByLabelText("Tom Bennett, CTO")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Candidate Tom Bennett")).toHaveAttribute("draggable", "true");
  });

  it("renders computed finalist dynamics and room connections", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      picks: [
        { candidateId: "maya-chen", rank: 1, reason: "Makes clear decisions in uncertain markets." },
        { candidateId: "elena-rossi", rank: 2, reason: "Builds dependable controls without drama." },
        { candidateId: "priya-nair", rank: 3, reason: "Tests assumptions and owns the numbers." },
      ],
      ranked: [
        { candidateId: "maya-chen", rank: 1 },
        { candidateId: "elena-rossi", rank: 2 },
        { candidateId: "priya-nair", rank: 3 },
        { candidateId: "tom-bennett", rank: 4 },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await user.selectOptions(screen.getByLabelText("Finalists"), "3");
    await user.click(screen.getByRole("button", { name: "Let the agent build your shortlist" }));

    expect(await screen.findByRole("heading", { name: "Team dynamics" })).toBeInTheDocument();
    expect(screen.getAllByTestId("room-connection").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("drive team profile")).toBeInTheDocument();
    expect(screen.getByText("Friction to examine")).toBeInTheDocument();
  });
});
