import {
  ArrowUpRight,
  Users,
} from "lucide-react";

import { Card } from "./Card";
import {
  Badge,
  ScoreReadout,
} from "./Badge";
import type { Drive } from "@/lib/types";

interface DriveCardProps {
  drive: Drive;
  showStartInterview?: boolean;
}

export function DriveCard({
  drive,
  showStartInterview = true,
}: DriveCardProps) {
  const interviewUrl =
    `/interview?driveId=${encodeURIComponent(
      drive.id
    )}`;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-ink">
            {drive.title}
          </h3>

          <p className="mt-1 text-sm text-muted">
            {drive.role}
          </p>
        </div>

        <Badge tone="teal">
          Open
        </Badge>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {drive.requiredSkills.map(
          (skill) => (
            <Badge
              key={skill}
              tone="ink"
            >
              {skill}
            </Badge>
          )
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Users className="h-3.5 w-3.5" />

          {drive.candidateCount} candidate
          {drive.candidateCount === 1
            ? ""
            : "s"}
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
            Avg score
          </p>

          <ScoreReadout
            value={drive.avgScore}
            size="sm"
          />
        </div>
      </div>

      {showStartInterview && (
        <a
          href={interviewUrl}
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
        >
          Start interview

          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      )}
    </Card>
  );
}