import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiSelectModal } from "./ai-select-modal";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AiSelectModal", () => {
  it("pauses the reveal while steering and resumes after submission", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <AiSelectModal
        longListIds={[]}
        onAddPicks={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.change(screen.getByLabelText("The brief"), {
      target: { value: "audit chair regulatory governance" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));

    const steerInput = screen.getByLabelText("Steer the agent");
    fireEvent.focus(steerInput);
    fireEvent.change(steerInput, { target: { value: "focus on APAC markets" } });

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(screen.getByRole("dialog", { name: "AI long-list builder" })).toBeInTheDocument();
    expect(screen.getByLabelText("Steer the agent")).toHaveValue("focus on APAC markets");
    expect(screen.queryByText(/strong fits — here’s the proposed long list/)).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.submit(screen.getByLabelText("Steer the agent").closest("form")!);

    expect(screen.getByText("Adjusting — prioritising focus on APAC markets.")).toBeInTheDocument();
    expect(screen.getByLabelText("Steer the agent")).toHaveValue("");

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByTestId("ai-considered-line")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
