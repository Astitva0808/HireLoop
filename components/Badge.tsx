import { ReactNode } from "react";

type Tone = "teal" | "amber" | "ink" | "signal" | "muted";

const toneClasses: Record<Tone, string> = {
  teal: "bg-teal-light text-teal-dark",
  amber: "bg-amber-light text-amber",
  ink: "bg-ink/[0.06] text-ink",
  signal: "bg-signal-light text-signal",
  muted: "bg-line/60 text-muted",
};

export function Badge({
  children,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** A score readout — bigger, used for the headline number on cards. */
export function ScoreReadout({
  value,
  outOf = 10,
  size = "md",
}: {
  value: number | null;
  outOf?: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  if (value === null) {
    return (
      <span className={`font-mono ${sizeClasses} text-muted`}>—</span>
    );
  }

  const tone =
    value >= 7 ? "text-teal-dark" : value >= 5 ? "text-amber" : "text-signal";

  return (
    <span className={`font-mono ${sizeClasses} font-semibold ${tone}`}>
      {value.toFixed(1)}
      <span className="text-muted text-[0.5em] font-normal">/{outOf}</span>
    </span>
  );
}

const statusToneMap: Record<string, Tone> = {
  open: "teal",
  draft: "muted",
  closed: "ink",
  completed: "teal",
  in_progress: "amber",
  not_started: "muted",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = statusToneMap[status] ?? "muted";
  return <Badge tone={tone}>{status.replace("_", " ")}</Badge>;
}
