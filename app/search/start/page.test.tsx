import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SearchStartPage from "./page";

afterEach(() => {
  cleanup();
});

describe("SearchStartPage", () => {
  it("offers agentic and manual research modes", () => {
    render(<SearchStartPage />);

    expect(screen.getByRole("link", { name: /Agentic Research/ })).toHaveAttribute(
      "href",
      "/search/pool?mode=agentic",
    );
    expect(screen.getByRole("link", { name: /Manual Research/ })).toHaveAttribute(
      "href",
      "/search/pool",
    );
  });
});
