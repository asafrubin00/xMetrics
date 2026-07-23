export const DEBRIEF_SECTION_KEYS = [
  "whatHappened",
  "choiceAnalysis",
  "investorFindings",
  "whatWouldChange",
] as const;

export type DebriefSectionKey = (typeof DEBRIEF_SECTION_KEYS)[number];
export type DebriefSections = Partial<Record<DebriefSectionKey, string>>;

const delimiters = Object.fromEntries(
  DEBRIEF_SECTION_KEYS.map((key) => [key, `===SECTION:${key}===`]),
) as Record<DebriefSectionKey, string>;

function removePartialDelimiter(content: string): string {
  let partialLength = 0;

  for (const delimiter of Object.values(delimiters)) {
    const maximum = Math.min(content.length, delimiter.length - 1);
    for (let length = 1; length <= maximum; length += 1) {
      if (content.endsWith(delimiter.slice(0, length))) {
        partialLength = Math.max(partialLength, length);
      }
    }
  }

  return partialLength > 0 ? content.slice(0, -partialLength) : content;
}

export function parseDebriefTranscript(transcript: string): DebriefSections {
  const sections: DebriefSections = {};

  for (let index = 0; index < DEBRIEF_SECTION_KEYS.length; index += 1) {
    const key = DEBRIEF_SECTION_KEYS[index];
    const delimiter = delimiters[key];
    const delimiterIndex = transcript.indexOf(delimiter);
    if (delimiterIndex === -1) continue;

    const contentStart = delimiterIndex + delimiter.length;
    const nextKey = DEBRIEF_SECTION_KEYS[index + 1];
    const nextDelimiterIndex = nextKey
      ? transcript.indexOf(delimiters[nextKey], contentStart)
      : -1;
    const rawContent = transcript.slice(
      contentStart,
      nextDelimiterIndex === -1 ? transcript.length : nextDelimiterIndex,
    );
    sections[key] = removePartialDelimiter(rawContent).trim();
  }

  return sections;
}

export function createDebriefStreamParser() {
  let transcript = "";

  return {
    push(chunk: string): DebriefSections {
      transcript += chunk;
      return parseDebriefTranscript(transcript);
    },
  };
}
