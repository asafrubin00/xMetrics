"use client";

import { seatPositions, type SeatPosition } from "@/lib/room-geometry";
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

function ghostPosition(memberCount: number): SeatPosition {
  const angle = -90 + 180 / Math.max(3, memberCount);
  const radians = angle * (Math.PI / 180);
  return {
    x: 450 + 322 * Math.cos(radians),
    y: 280 + 196 * Math.sin(radians),
  };
}

function concentrationPath(from: SeatPosition, to: SeatPosition): string {
  const midpointX = (from.x + to.x) / 2;
  const midpointY = (from.y + to.y) / 2;
  const controlX = midpointX + (450 - midpointX) * 0.35;
  const controlY = midpointY + (280 - midpointY) * 0.35;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

export function Room({
  members,
  emptySeatCount = 0,
  highlightIds = [],
  dimUnhighlighted = false,
  connections = [],
  ghostSeatLabel,
  onSeatClick,
}: RoomProps) {
  const emptySeats = Math.max(0, Math.min(emptySeatCount, 6 - members.length));
  const seatCount = Math.max(3, Math.min(6, members.length + emptySeats));
  const positions = seatPositions(seatCount);
  const memberPositions = new Map(
    members.map((member, index) => [member.id, positions[index]]),
  );
  const visibleConnections = connections
    .filter((connection) =>
      memberPositions.has(connection.fromId) && memberPositions.has(connection.toId),
    )
    .slice(0, 4);
  const connectedIds = visibleConnections.flatMap((connection) => [
    connection.fromId,
    connection.toId,
  ]);
  const highlighted = new Set([...highlightIds, ...connectedIds]);

  return (
    <svg
      viewBox="0 0 900 560"
      role="img"
      aria-label={`Team room with ${members.length} filled ${members.length === 1 ? "seat" : "seats"}`}
      className="h-auto w-full overflow-visible"
    >
      <defs>
        <filter id="room-seat-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feFlood floodColor="#C9A227" floodOpacity="0.22" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
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

      <ellipse
        cx="450"
        cy="280"
        rx="210"
        ry="112"
        fill="#101F35"
        stroke="#233B5C"
        strokeWidth="2"
      />
      <ellipse
        cx="450"
        cy="280"
        rx="174"
        ry="80"
        fill="none"
        stroke="#C9A227"
        strokeOpacity="0.12"
      />

      <g aria-hidden="true">
        {visibleConnections.map((connection) => {
          const from = memberPositions.get(connection.fromId)!;
          const to = memberPositions.get(connection.toId)!;
          const key = `${connection.kind}-${connection.fromId}-${connection.toId}`;

          if (connection.kind === "concentration") {
            return (
              <path
                key={key}
                d={concentrationPath(from, to)}
                fill="none"
                stroke="#C9A227"
                strokeWidth="2"
                opacity="0.9"
              />
            );
          }

          return (
            <line
              key={key}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={connection.kind === "polarity" ? "#5B7A99" : "#F3EDE0"}
              strokeOpacity={connection.kind === "dependency" ? 0.5 : 0.9}
              strokeWidth="2"
              strokeDasharray={connection.kind === "polarity" ? "10 8" : undefined}
              markerEnd={connection.kind === "dependency" ? "url(#room-dependency-arrow)" : undefined}
            />
          );
        })}
      </g>

      {members.map((member, index) => {
        const position = positions[index];
        const isHighlighted = highlighted.has(member.id);
        const isDimmed = dimUnhighlighted && highlighted.size > 0 && !isHighlighted;

        return (
          <g
            key={member.id}
            role="button"
            tabIndex={0}
            aria-label={`${member.displayName}, ${member.role}`}
            onClick={() => onSeatClick?.(member.id)}
            onKeyDown={(event) => {
              if ((event.key === "Enter" || event.key === " ") && onSeatClick) {
                event.preventDefault();
                onSeatClick(member.id);
              }
            }}
            className={`group outline-none transition-[transform,opacity] duration-300 motion-reduce:transition-none ${onSeatClick ? "cursor-pointer" : "cursor-default"} ${isDimmed ? "opacity-35" : "opacity-100"}`}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          >
            <circle
              r="38"
              fill="#101F35"
              stroke="#C9A227"
              strokeWidth={isHighlighted ? 4 : 1.5}
              filter={isHighlighted ? "url(#room-seat-glow)" : undefined}
              className="transition-[stroke-width] duration-300 group-focus-visible:stroke-[5] group-focus-visible:stroke-cream-50 motion-reduce:transition-none"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#F8F4EA"
              fontFamily="var(--font-playfair-display), serif"
              fontSize="22"
            >
              {initials(member.displayName)}
            </text>
            <text
              y="58"
              textAnchor="middle"
              fill={isHighlighted ? "#F8F4EA" : "#D5CCB9"}
              fontFamily="var(--font-inter), sans-serif"
              fontSize="15"
              className="hidden sm:block"
            >
              {member.displayName}
            </text>
            <text
              y="58"
              textAnchor="middle"
              fill={isHighlighted ? "#F8F4EA" : "#D5CCB9"}
              fontFamily="var(--font-inter), sans-serif"
              fontSize="17"
              className="sm:hidden"
            >
              {firstName(member.displayName)}
            </text>
            <text
              y="76"
              textAnchor="middle"
              fill="#C9A227"
              fontFamily="var(--font-inter), sans-serif"
              fontSize="10"
              letterSpacing="1.4"
              className="hidden uppercase sm:block"
            >
              {member.role}
            </text>
          </g>
        );
      })}

      {Array.from({ length: emptySeats }, (_, offset) => {
        const position = positions[members.length + offset];
        return (
          <g
            key={`empty-${offset}`}
            role="img"
            tabIndex={0}
            aria-label="Empty seat"
            className="group outline-none transition-transform duration-300 motion-reduce:transition-none"
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          >
            <circle
              r="38"
              fill="none"
              stroke="#F3EDE0"
              strokeOpacity="0.3"
              strokeWidth="1.5"
              strokeDasharray="7 7"
              className="group-focus-visible:stroke-[5] group-focus-visible:stroke-cream-50 group-focus-visible:stroke-opacity-100"
            />
          </g>
        );
      })}

      {ghostSeatLabel && members.length >= 3 && (() => {
        const position = ghostPosition(members.length);
        return (
          <g
            role="img"
            tabIndex={0}
            aria-label={ghostSeatLabel}
            className="group outline-none"
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          >
            <circle
              r="38"
              fill="#0A1628"
              stroke="#F3EDE0"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeDasharray="7 7"
              className="group-focus-visible:stroke-[5] group-focus-visible:stroke-cream-50 group-focus-visible:stroke-opacity-100"
            />
            <text
              y="58"
              textAnchor="middle"
              fill="#D5CCB9"
              fillOpacity="0.72"
              fontFamily="var(--font-playfair-display), serif"
              fontSize="14"
              fontStyle="italic"
            >
              {ghostSeatLabel}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
