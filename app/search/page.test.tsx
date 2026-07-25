import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import SearchPage from "./page";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SearchPage", () => {
  it("renders the candidate pool and empty finalist room", () => {
    render(<SearchPage />);
    expect(screen.getByText("Candidate pool")).toBeInTheDocument();
    expect(screen.getByText("Maya Chen")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Empty seat")).toHaveLength(5);
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
    await user.click(screen.getByRole("button", { name: "Shortlist" }));

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
    await user.click(screen.getByRole("button", { name: "Shortlist" }));
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
    await user.click(screen.getByRole("button", { name: "Shortlist" }));

    expect(await screen.findByRole("heading", { name: "Team dynamics" })).toBeInTheDocument();
    expect(screen.getAllByTestId("room-connection").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("drive team profile")).toBeInTheDocument();
    expect(screen.getByText("Friction to examine")).toBeInTheDocument();
  });
});
