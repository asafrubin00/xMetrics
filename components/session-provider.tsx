"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { computeExposures, computeSignals } from "@/lib/signals";
import { parseMembers, serialiseMembers, TEAM_STORAGE_KEY } from "@/lib/session-storage";
import type { Debrief, Scenario, Session, TeamMember } from "@/lib/types";

interface SessionContextValue {
  session: Session;
  setMembers: (members: TeamMember[]) => void;
  setScenario: (scenario: Scenario | undefined) => void;
  setChosenOptionId: (optionId: string | undefined) => void;
  setDebrief: (debrief: Debrief | undefined) => void;
  clearGenerated: () => void;
  startOver: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialMembers = [],
}: Readonly<{
  children: React.ReactNode;
  initialMembers?: TeamMember[];
}>) {
  const [members, setMembersState] = useState<TeamMember[]>(initialMembers);
  const [scenario, setScenario] = useState<Scenario>();
  const [chosenOptionId, setChosenOptionId] = useState<string>();
  const [debrief, setDebrief] = useState<Debrief>();
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      if (initialMembers.length === 0) {
        setMembersState(parseMembers(window.localStorage.getItem(TEAM_STORAGE_KEY)));
      }
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, [initialMembers.length]);

  useEffect(() => {
    if (!storageReady) return;
    if (members.length === 0) {
      window.localStorage.removeItem(TEAM_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TEAM_STORAGE_KEY, serialiseMembers(members));
    }
  }, [members, storageReady]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session: {
        members,
        signals: computeSignals(members),
        exposures: computeExposures(members),
        scenario,
        chosenOptionId,
        debrief,
      },
      setMembers: (nextMembers) => {
        setMembersState(nextMembers);
        setScenario(undefined);
        setChosenOptionId(undefined);
        setDebrief(undefined);
      },
      setScenario,
      setChosenOptionId,
      setDebrief,
      clearGenerated: () => {
        setScenario(undefined);
        setChosenOptionId(undefined);
        setDebrief(undefined);
      },
      startOver: () => {
        window.localStorage.removeItem(TEAM_STORAGE_KEY);
        setMembersState([]);
        setScenario(undefined);
        setChosenOptionId(undefined);
        setDebrief(undefined);
      },
    }),
    [chosenOptionId, debrief, members, scenario],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within SessionProvider");
  return context;
}
