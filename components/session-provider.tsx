"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { computeExposures, computeSignals } from "@/lib/signals";
import { parseMembers, serialiseMembers, TEAM_STORAGE_KEY } from "@/lib/session-storage";
import type { Scenario, Session, TeamMember } from "@/lib/types";

interface SessionContextValue {
  session: Session;
  setMembers: (members: TeamMember[]) => void;
  setScenario: (scenario: Scenario | undefined) => void;
  setChosenOptionId: (optionId: string | undefined) => void;
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
    window.localStorage.setItem(TEAM_STORAGE_KEY, serialiseMembers(members));
  }, [members, storageReady]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session: {
        members,
        signals: computeSignals(members),
        exposures: computeExposures(members),
        scenario,
        chosenOptionId,
      },
      setMembers: (nextMembers) => {
        setMembersState(nextMembers);
        setScenario(undefined);
        setChosenOptionId(undefined);
      },
      setScenario,
      setChosenOptionId,
    }),
    [chosenOptionId, members, scenario],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within SessionProvider");
  return context;
}
