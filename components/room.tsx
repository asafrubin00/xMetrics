"use client";

import { ghostSlot, seatSlots, type SeatSlot } from "@/lib/room-geometry";
import type { TeamMember } from "@/lib/types";

export interface RoomConnection {
  fromId: string;
  toId: string;
  kind: "concentration" | "polarity" | "dependency";
}

export interface RoomProps {
  members: TeamMember[];
  emptySeatCount?: number;
  highlightIds?: string[];
  dimUnhighlighted?: boolean;
  connections?: RoomConnection[];
  ghostSeatLabel?: string;
  interactive?: boolean;
  onSeatClick?: (memberId: string) => void;
}

function initials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function firstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}

function point(slot: SeatSlot): { x: number; y: number } {
  return { x: slot.left * 10, y: slot.top * 10 };
}

function concentrationPath(from: SeatSlot, to: SeatSlot): string {
  const start = point(from);
  const end = point(to);
  const midpointX = (start.x + end.x) / 2;
  const midpointY = (start.y + end.y) / 2;
  const controlX = midpointX + (500 - midpointX) * 0.35;
  const controlY = midpointY + (500 - midpointY) * 0.35;
  return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
}

function SeatLabel({
  member,
  labelAbove,
  highlighted,
}: {
  member: TeamMember;
  labelAbove: boolean;
  highlighted: boolean;
}) {
  return (
    <span
      className={`pointer-events-none absolute left-1/2 w-40 -translate-x-1/2 text-center ${labelAbove ? "bottom-[44px]" : "top-[44px]"}`}
    >
      <span className={`hidden truncate text-sm sm:block ${highlighted ? "text-cream-50" : "text-cream-300"}`}>
        {member.displayName}
      </span>
      <span className={`block truncate text-sm sm:hidden ${highlighted ? "text-cream-50" : "text-cream-300"}`}>
        {firstName(member.displayName)}
      </span>
      <span className="mt-0.5 hidden truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-gold-400 sm:block">
        {member.role}
      </span>
    </span>
  );
}

export function Room({
  members,
  emptySeatCount = 0,
  highlightIds = [],
  dimUnhighlighted = false,
  connections = [],
  ghostSeatLabel,
  interactive = false,
  onSeatClick,
}: RoomProps) {
  const emptySeats = Math.max(0, Math.min(emptySeatCount, 6 - members.length));
  const seatCount = Math.max(3, Math.min(6, members.length + emptySeats));
  const slots = seatSlots(seatCount);
  const memberSlots = new Map(
    members.map((member, index) => [member.id, slots[index]]),
  );
  const visibleConnections = connections
    .filter((connection) =>
      memberSlots.has(connection.fromId) && memberSlots.has(connection.toId),
    )
    .slice(0, 4);
  const connectedIds = visibleConnections.flatMap((connection) => [
    connection.fromId,
    connection.toId,
  ]);
  const highlighted = new Set([...highlightIds, ...connectedIds]);

  return (
    <div
      role="img"
      aria-label={`Team room with ${members.length} filled ${members.length === 1 ? "seat" : "seats"}`}
      className="relative aspect-square w-full max-w-[620px]"
    >
      <svg
        viewBox="0 0 1000 1000"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <marker
            id="room-dependency-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#F3EDE0" opacity="0.5" />
          </marker>
        </defs>
        <rect
          x="250"
          y="250"
          width="500"
          height="500"
          rx="20"
          fill="#101F35"
          stroke="#F3EDE0"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
        {visibleConnections.map((connection, index) => {
          const from = memberSlots.get(connection.fromId)!;
          const to = memberSlots.get(connection.toId)!;
          const start = point(from);
          const end = point(to);
          const key = `${connection.kind}-${connection.fromId}-${connection.toId}-${index}`;

          if (connection.kind === "concentration") {
            return (
              <path
                key={key}
                d={concentrationPath(from, to)}
                fill="none"
                stroke="#C9A227"
                strokeWidth="4"
                opacity="0.9"
              />
            );
          }
          return (
            <line
              key={key}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={connection.kind === "polarity" ? "#5B7A99" : "#F3EDE0"}
              strokeOpacity={connection.kind === "dependency" ? 0.5 : 0.9}
              strokeWidth="4"
              strokeDasharray={connection.kind === "polarity" ? "18 14" : undefined}
              markerEnd={connection.kind === "dependency" ? "url(#room-dependency-arrow)" : undefined}
            />
          );
        })}
      </svg>

      {members.map((member, index) => {
        const slot = slots[index];
        const isHighlighted = highlighted.has(member.id);
        const isDimmed = dimUnhighlighted && highlighted.size > 0 && !isHighlighted;
        return (
          <button
            key={member.id}
            type="button"
            aria-label={`${member.displayName}, ${member.role}`}
            onClick={() => onSeatClick?.(member.id)}
            className={`group absolute z-10 h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 rounded-full border bg-navy-900 font-display text-xl text-cream-50 outline-none transition-[opacity,box-shadow,border-width] duration-300 focus-visible:ring-4 focus-visible:ring-cream-50 motion-reduce:transition-none ${interactive || onSeatClick ? "cursor-pointer" : "cursor-default"} ${isHighlighted ? "border-[3px] border-gold-500 shadow-[0_0_20px_rgba(201,162,39,0.28)]" : "border-[1.5px] border-gold-500"} ${isDimmed ? "opacity-35" : "opacity-100"}`}
            style={{ left: `${slot.left}%`, top: `${slot.top}%` }}
          >
            {initials(member.displayName)}
            <SeatLabel member={member} labelAbove={slot.labelAbove} highlighted={isHighlighted} />
          </button>
        );
      })}

      {Array.from({ length: emptySeats }, (_, offset) => {
        const slot = slots[members.length + offset];
        return (
          <div
            key={`empty-${offset}`}
            role="img"
            tabIndex={0}
            aria-label="Empty seat"
            className="absolute z-10 h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cream-100/30 outline-none focus-visible:ring-4 focus-visible:ring-cream-50"
            style={{ left: `${slot.left}%`, top: `${slot.top}%` }}
          />
        );
      })}

      {ghostSeatLabel && members.length >= 3 && (() => {
        const slot = ghostSlot(members.length);
        return (
          <div
            role="img"
            tabIndex={0}
            aria-label={ghostSeatLabel}
            className="absolute z-10 h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cream-100/25 bg-navy-950 outline-none focus-visible:ring-4 focus-visible:ring-cream-50"
            style={{ left: `${slot.left}%`, top: `${slot.top}%` }}
          >
            <span className={`pointer-events-none absolute left-1/2 w-40 -translate-x-1/2 text-center font-display text-xs italic text-cream-300/70 ${slot.labelAbove ? "bottom-[44px]" : "top-[44px]"}`}>
              {ghostSeatLabel}
            </span>
          </div>
        );
      })()}
    </div>
  );
}
