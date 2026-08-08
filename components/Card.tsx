import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_2px_16px_-4px_rgba(22,33,62,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <Card>
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">
        {value}
        {suffix && (
          <span className="ml-1 text-base font-normal text-muted">
            {suffix}
          </span>
        )}
      </p>
    </Card>
  );
}
