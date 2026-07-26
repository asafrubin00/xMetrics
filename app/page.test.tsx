import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CoverPage from "./page";

afterEach(() => {
  cleanup();
});

describe("CoverPage", () => {
  it("starts the search journey at the research-mode choice", () => {
    render(<CoverPage />);

    expect(screen.getByRole("link", { name: /Search/ })).toHaveAttribute("href", "/search/start");
    expect(screen.getByText("Build your long list →")).toBeInTheDocument();
  });
});
