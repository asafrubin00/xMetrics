import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CoverPage from "./page";

afterEach(() => {
  cleanup();
});

describe("CoverPage", () => {
  it("starts the search journey at the candidate pool", () => {
    render(<CoverPage />);

    expect(screen.getByRole("link", { name: /Search/ })).toHaveAttribute("href", "/search/pool");
    expect(screen.getByText("Build your long list →")).toBeInTheDocument();
  });
});
