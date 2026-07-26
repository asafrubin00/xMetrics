import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ShortlistStartPage from "./page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/search/shortlist-start");
});

describe("ShortlistStartPage", () => {
  it("carries the long list into agentic and manual shortlist modes", () => {
    window.history.replaceState(
      {},
      "",
      "/search/shortlist-start?ll=maya-chen,elena-rossi,priya-nair",
    );
    render(<ShortlistStartPage />);

    expect(screen.getByRole("link", { name: /Let the agent build your shortlist/ })).toHaveAttribute(
      "href",
      "/search?ll=maya-chen,elena-rossi,priya-nair",
    );
    expect(screen.getByRole("link", { name: /Build your shortlist manually/ })).toHaveAttribute(
      "href",
      "/search?ll=maya-chen,elena-rossi,priya-nair&mode=manual",
    );
  });
});
