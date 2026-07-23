import { describe, expect, it } from "vitest";
import {
  createDebriefStreamParser,
  parseDebriefTranscript,
} from "./debrief-stream";

const transcript = `===SECTION:whatHappened===
Maya took control when the terms changed.

Priya tested the downside.
===SECTION:choiceAnalysis===
The bridge preserves options but creates an execution bottleneck.
===SECTION:investorFindings===
- Key-person dependency: Maya remains the final decision point.
- Friction line: Priya and Tom frame risk differently.
===SECTION:whatWouldChange===
An operator comfortable holding delegated authority would reduce the bottleneck.`;

describe("debrief stream parsing", () => {
  it("splits a complete transcript into the four named sections", () => {
    expect(parseDebriefTranscript(transcript)).toEqual({
      whatHappened: "Maya took control when the terms changed.\n\nPriya tested the downside.",
      choiceAnalysis: "The bridge preserves options but creates an execution bottleneck.",
      investorFindings: "- Key-person dependency: Maya remains the final decision point.\n- Friction line: Priya and Tom frame risk differently.",
      whatWouldChange: "An operator comfortable holding delegated authority would reduce the bottleneck.",
    });
  });

  it("handles a streamed chunk boundary in the middle of a delimiter", () => {
    const parser = createDebriefStreamParser();
    parser.push("===SECTION:whatHappened===\nMaya acted.\n===SECTION:choiceAna");

    expect(parser.push("lysis===\nThe team chose time.\n===SECTION:investorFindings===\n- Maya is pivotal.\n===SECTION:whatWouldChange===\nAdd an operator.")).toEqual({
      whatHappened: "Maya acted.",
      choiceAnalysis: "The team chose time.",
      investorFindings: "- Maya is pivotal.",
      whatWouldChange: "Add an operator.",
    });
  });

  it("does not leak a partial next delimiter into the visible section", () => {
    const parser = createDebriefStreamParser();
    const sections = parser.push(
      "===SECTION:whatHappened===\nMaya acted.\n===SECTION:choiceAna",
    );

    expect(sections.whatHappened).toBe("Maya acted.");
    expect(sections.choiceAnalysis).toBeUndefined();
  });
});
