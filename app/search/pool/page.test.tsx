import { cleanup, render, screen } from "@testing-library/react";
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
});
