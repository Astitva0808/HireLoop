import { Card } from "./Card";
import { ScoreReadout, StatusBadge } from "./Badge";
import { Button } from "./Button";
import type { InterviewSession } from "@/lib/types";

export function SessionCard({ session }: { session: InterviewSession }) {
  const isDone = session.status === "completed";

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            {session.driveTitle}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{session.companyName}</p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {isDone && session.skillBreakdown && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
          {Object.entries(session.skillBreakdown).map(([skill, score]) => (
            <div key={skill} className="flex items-baseline gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                {skill}
              </span>
              <ScoreReadout value={score} size="sm" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <ScoreReadout value={session.overallScore} />
        <Button
          variant={isDone ? "ghost" : "secondary"}
          className="!px-4 !py-2 text-sm"
        >
          {isDone ? "View report" : "Start interview"}
        </Button>
      </div>
    </Card>
  );
}
