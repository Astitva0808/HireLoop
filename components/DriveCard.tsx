import { Users } from "lucide-react";
import { Card } from "./Card";
import { Badge, ScoreReadout, StatusBadge } from "./Badge";
import type { Drive } from "@/lib/types";

export function DriveCard({ drive }: { drive: Drive }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            {drive.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{drive.role}</p>
        </div>
        <StatusBadge status={drive.status} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {drive.requiredSkills.map((skill) => (
          <Badge key={skill} tone="ink">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Users className="h-3.5 w-3.5" />
          {drive.candidateCount} candidate{drive.candidateCount === 1 ? "" : "s"}
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
            Avg score
          </p>
          <ScoreReadout value={drive.avgScore} size="sm" />
        </div>
      </div>
    </Card>
  );
}
