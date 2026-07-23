"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Room } from "@/components/room";
import { useSession } from "@/components/session-provider";
import { DEMO_TEAM, PERSONAS } from "@/lib/personas.config";
import { TRAITS } from "@/lib/traits.config";
import type { TeamMember } from "@/lib/types";

const defaultTraits = Object.fromEntries(TRAITS.map((trait) => [trait.id, 50]));

function traitSummary(member: TeamMember): string[] {
  return TRAITS.map((trait) => ({
    distance: Math.abs(member.traits[trait.id] - 50),
    text: member.traits[trait.id] >= 50 ? trait.highDescriptor : trait.lowDescriptor,
  }))
    .sort((first, second) => second.distance - first.distance)
    .slice(0, 2)
    .map(({ text }) => text);
}

function MemberForm({
  member,
  onCancel,
  onSave,
}: {
  member?: TeamMember;
  onCancel: () => void;
  onSave: (member: TeamMember) => void;
}) {
  const [displayName, setDisplayName] = useState(member?.displayName ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [traits, setTraits] = useState<Record<string, number>>(member?.traits ?? defaultTraits);

  return (
    <form
      className="rounded-2xl border border-gold-500/25 bg-navy-900 p-5 sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ id: member?.id ?? crypto.randomUUID(), displayName: displayName.trim(), role: role.trim(), traits });
      }}
    >
      <div className="grid gap-4">
        <label className="text-sm text-cream-300">Name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-cream-50 outline-none focus:border-gold-500" /></label>
        <label className="text-sm text-cream-300">Role<input required value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-cream-50 outline-none focus:border-gold-500" /></label>
      </div>
      <div className="mt-7 space-y-8">
        {(["drive", "thinking", "interpersonal", "pressure"] as const).map((group) => (
          <fieldset key={group}>
            <legend className="font-display text-lg capitalize text-cream-50">{group}</legend>
            <div className="mt-4 grid gap-5">
              {TRAITS.filter((trait) => trait.group === group).map((trait) => (
                <label key={trait.id} className="block text-sm text-cream-100">
                  {trait.name}
                  <input aria-label={trait.name} type="range" min="0" max="100" value={traits[trait.id]} onChange={(event) => setTraits((current) => ({ ...current, [trait.id]: Number(event.target.value) }))} className="mt-2 block w-full accent-gold-500" />
                  <span className="mt-1 flex justify-between gap-4 text-[11px] leading-4 text-cream-300"><span>{trait.lowDescriptor}</span><span className="text-right">{trait.highDescriptor}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-8 flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-cream-300 hover:text-cream-50">Cancel</button><button type="submit" className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400">Save member</button></div>
    </form>
  );
}

export default function TeamBuilder() {
  const { session, setMembers } = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const memberCards = useRef(new Map<string, HTMLElement>());
  const selectedIds = useMemo(() => new Set(session.members.map((member) => member.id)), [session.members]);
  const editingMember = session.members.find((member) => member.id === editingId);

  const saveMember = (member: TeamMember) => {
    setMembers(editingId ? session.members.map((current) => current.id === editingId ? member : current) : [...session.members, member]);
    setEditingId(null);
    setShowManualForm(false);
  };

  const selectMember = (memberId: string) => {
    setEditingId(memberId);
    setShowManualForm(false);
    requestAnimationFrame(() => memberCards.current.get(memberId)?.focus());
  };

  return (
    <main className="flex min-h-screen w-full flex-col lg:h-screen lg:overflow-hidden">
      <header className="shrink-0 border-b border-navy-700/70 px-5 py-5 sm:px-8 lg:px-10">
        <h1 className="font-display text-3xl text-cream-50">xMetrics</h1>
        <p className="mt-1 text-xs tracking-wide text-gold-400">psychometrics, multiplied.</p>
      </header>

      <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[30%_40%_30%]">
        <section className="order-2 min-w-0 border-navy-700/70 px-5 py-7 sm:px-8 lg:order-1 lg:max-h-[calc(100vh-81px)] lg:overflow-y-auto lg:border-r lg:px-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Your team</p>
              <h2 className="mt-2 font-display text-2xl text-cream-50 xl:text-3xl">The people in the room</h2>
            </div>
            <span className="shrink-0 text-sm text-cream-300">{session.members.length} / 6</span>
          </div>
          {session.members.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-navy-700 p-6 text-sm text-cream-300">
              Choose a preset profile or add a team member manually.
            </p>
          ) : (
            <div className="mt-5 grid gap-3">
              {session.members.map((member) => (
                <article
                  key={member.id}
                  ref={(node) => {
                    if (node) memberCards.current.set(member.id, node);
                    else memberCards.current.delete(member.id);
                  }}
                  tabIndex={-1}
                  className={`rounded-xl border bg-navy-900 p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold-500 ${editingId === member.id ? "border-gold-500/60" : "border-navy-700"}`}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg text-cream-50">{member.displayName}</h3>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-gold-400">{member.role}</p>
                    </div>
                    <div className="flex gap-2 text-[11px]">
                      <button onClick={() => selectMember(member.id)} className="text-cream-300 hover:text-cream-50">Edit</button>
                      <button onClick={() => setMembers(session.members.filter((current) => current.id !== member.id))} className="text-cream-300 hover:text-cream-50">Remove</button>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs leading-5 text-cream-300">
                    {traitSummary(member).map((summary) => <li key={summary}>— {summary}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="order-1 flex min-w-0 flex-col items-center justify-center border-b border-navy-700/70 px-5 py-7 sm:px-8 lg:order-2 lg:border-b-0 lg:px-7">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">The room</p>
          <div className="w-full max-w-[560px]">
            <Room
              members={session.members}
              emptySeatCount={Math.max(0, 3 - session.members.length)}
              onSeatClick={selectMember}
            />
          </div>
          <div className="mt-2 w-full max-w-sm text-center">
            <p className="text-xs text-cream-300">
              {session.members.length < 3
                ? `Add ${3 - session.members.length} more to continue`
                : `${session.members.length} of 6 seats filled`}
            </p>
            <Link aria-disabled={session.members.length < 3} tabIndex={session.members.length < 3 ? -1 : undefined} href={session.members.length >= 3 ? "/signals" : "#"} className={`mt-4 block rounded-lg px-6 py-3 text-center text-sm font-semibold ${session.members.length >= 3 ? "bg-gold-500 text-navy-950 hover:bg-gold-400" : "cursor-not-allowed bg-navy-800 text-cream-300/50"}`}>Continue to team signals</Link>
            <button onClick={() => setMembers(DEMO_TEAM.map((id) => PERSONAS.find((persona) => persona.id === id)!))} className="mt-3 text-xs font-semibold text-gold-400 hover:text-gold-300">Load demo team</button>
          </div>
        </section>

        <section className="order-3 min-w-0 border-t border-navy-700/70 px-5 py-7 sm:px-8 lg:max-h-[calc(100vh-81px)] lg:overflow-y-auto lg:border-l lg:border-t-0 lg:px-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Add people</p>
              <h2 className="mt-2 font-display text-2xl text-cream-50">Build the room</h2>
            </div>
            {!showManualForm && !editingMember && (
              <button disabled={session.members.length >= 6} onClick={() => setShowManualForm(true)} className="rounded-lg border border-cream-300/30 px-3 py-2 text-xs text-cream-100 hover:border-gold-500 disabled:opacity-40">Add manually</button>
            )}
          </div>

          {(showManualForm || editingMember) ? (
            <div className="mt-5">
              <MemberForm
                key={editingMember?.id ?? "new"}
                member={editingMember}
                onCancel={() => { setEditingId(null); setShowManualForm(false); }}
                onSave={saveMember}
              />
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1 2xl:grid-cols-2">
              {PERSONAS.map((persona) => {
                const disabled = selectedIds.has(persona.id) || session.members.length >= 6;
                return (
                  <button key={persona.id} disabled={disabled} onClick={() => setMembers([...session.members, persona])} className="rounded-xl border border-navy-700 bg-navy-900 p-4 text-left transition hover:-translate-y-0.5 hover:border-gold-500/60 motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-35">
                    <span className="block font-display text-base text-cream-50">{persona.displayName}</span>
                    <span className="mt-1 block text-xs text-cream-300">{persona.role}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="shrink-0 border-t border-navy-700/70 px-5 py-3 text-center text-[10px] text-cream-300/70">
        xMetrics — prototype. Not a validated assessment instrument.
      </footer>
    </main>
  );
}
