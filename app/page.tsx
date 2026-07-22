"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-cream-300">Name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-cream-50 outline-none focus:border-gold-500" /></label>
        <label className="text-sm text-cream-300">Role<input required value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-cream-50 outline-none focus:border-gold-500" /></label>
      </div>
      <div className="mt-7 space-y-8">
        {(["drive", "thinking", "interpersonal", "pressure"] as const).map((group) => (
          <fieldset key={group}>
            <legend className="font-display text-lg capitalize text-cream-50">{group}</legend>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
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
  const selectedIds = useMemo(() => new Set(session.members.map((member) => member.id)), [session.members]);
  const editingMember = session.members.find((member) => member.id === editingId);

  const saveMember = (member: TeamMember) => {
    setMembers(editingId ? session.members.map((current) => current.id === editingId ? member : current) : [...session.members, member]);
    setEditingId(null);
    setShowManualForm(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <header className="flex flex-col items-start gap-5 border-b border-navy-700/70 pb-8 sm:flex-row sm:justify-between">
        <div><h1 className="font-display text-4xl text-cream-50 sm:text-5xl">xMetrics</h1><p className="mt-2 text-sm tracking-wide text-gold-400">psychometrics, multiplied.</p></div>
        <button onClick={() => setMembers(DEMO_TEAM.map((id) => PERSONAS.find((persona) => persona.id === id)!))} className="rounded-lg border border-gold-500/50 px-3 py-2 text-xs font-semibold text-gold-400 hover:bg-gold-500/10 sm:px-4 sm:text-sm">Load demo team</button>
      </header>

      <section className="py-8"><div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Your team</p><h2 className="mt-2 font-display text-3xl text-cream-50">The people in the room</h2></div><span className="text-sm text-cream-300">{session.members.length} / 6</span></div>
        {session.members.length === 0 ? <p className="mt-6 rounded-xl border border-dashed border-navy-700 p-6 text-sm text-cream-300">Choose preset profiles below or add a team member manually.</p> : <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{session.members.map((member) => <article key={member.id} className="rounded-xl border border-navy-700 bg-navy-900 p-5"><div className="flex justify-between gap-3"><div><h3 className="font-display text-xl text-cream-50">{member.displayName}</h3><p className="mt-1 text-xs uppercase tracking-wider text-gold-400">{member.role}</p></div><div className="flex gap-2 text-xs"><button onClick={() => { setEditingId(member.id); setShowManualForm(false); }} className="text-cream-300 hover:text-cream-50">Edit</button><button onClick={() => setMembers(session.members.filter((current) => current.id !== member.id))} className="text-cream-300 hover:text-cream-50">Remove</button></div></div><ul className="mt-4 space-y-1 text-sm text-cream-300">{traitSummary(member).map((summary) => <li key={summary}>— {summary}</li>)}</ul></article>)}</div>}
      </section>

      {(showManualForm || editingMember) && <section className="mb-10"><MemberForm key={editingMember?.id ?? "new"} member={editingMember} onCancel={() => { setEditingId(null); setShowManualForm(false); }} onSave={saveMember} /></section>}

      {!showManualForm && !editingMember && <section className="border-t border-navy-700/70 pt-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Preset profiles</p><h2 className="mt-2 font-display text-2xl text-cream-50">Build the room quickly</h2></div><button disabled={session.members.length >= 6} onClick={() => setShowManualForm(true)} className="rounded-lg border border-cream-300/30 px-4 py-2 text-sm text-cream-100 hover:border-gold-500 disabled:opacity-40">Add manually</button></div><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{PERSONAS.map((persona) => { const disabled = selectedIds.has(persona.id) || session.members.length >= 6; return <button key={persona.id} disabled={disabled} onClick={() => setMembers([...session.members, persona])} className="rounded-xl border border-navy-700 bg-navy-900 p-4 text-left transition hover:-translate-y-0.5 hover:border-gold-500/60 disabled:cursor-not-allowed disabled:opacity-35"><span className="block font-display text-base text-cream-50">{persona.displayName}</span><span className="mt-1 block text-xs text-cream-300">{persona.role}</span></button>; })}</div></section>}

      <div className="mt-10 flex flex-col items-stretch gap-4 border-t border-navy-700 bg-navy-950/95 py-5 backdrop-blur sm:sticky sm:bottom-0 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-cream-300">Add {Math.max(0, 3 - session.members.length)} more to continue</p><Link aria-disabled={session.members.length < 3} tabIndex={session.members.length < 3 ? -1 : undefined} href={session.members.length >= 3 ? "/signals" : "#"} className={`rounded-lg px-6 py-3 text-center text-sm font-semibold ${session.members.length >= 3 ? "bg-gold-500 text-navy-950 hover:bg-gold-400" : "cursor-not-allowed bg-navy-800 text-cream-300/50"}`}>Continue to team signals</Link></div>
    </main>
  );
}
