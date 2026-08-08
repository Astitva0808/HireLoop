"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Video,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { getMyDrives, getDriveInterviews } from "@/lib/api";
import type { Interview as ApiInterview } from "@/lib/api";

type InterviewStatus =
  | "scheduled"
  | "in_progress"
  | "completed";

type Interview = {
  id: string;
  candidate: string;
  email: string;
  drive: string;
  date: string;
  time: string;
  status: InterviewStatus;
  score: number | null;
};

const filters = [
  "all",
  "scheduled",
  "in_progress",
  "completed",
] as const;

function InterviewsContent() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filter, setFilter] =
    useState<(typeof filters)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterviews() {
      try {
        setLoading(true);
        const drives = await getMyDrives();
        const allInterviews: Interview[] = [];

        for (const drive of drives) {
          try {
            const driveInterviews = await getDriveInterviews(drive.id);
            for (const interview of driveInterviews) {
              const scheduledAt = interview.scheduled_at ? new Date(interview.scheduled_at) : null;
              allInterviews.push({
                id: interview.id,
                candidate: `Candidate ${interview.candidate_id.slice(0, 8)}`,
                email: "—",
                drive: drive.title,
                date: scheduledAt ? scheduledAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
                time: scheduledAt ? scheduledAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
                status: ["scheduled", "in_progress", "completed"].includes(interview.status) ? interview.status as InterviewStatus : "scheduled",
                score: interview.overall_score ?? null,
              });
            }
          } catch {
            // Skip drives that fail to load interviews
          }
        }

        setInterviews(allInterviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load interviews");
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    if (filter === "all") return interviews;
    return interviews.filter((item: Interview) => item.status === filter);
  }, [interviews, filter]);

  const totalCount = interviews.length;
  const scheduledCount = interviews.filter((item: Interview) => item.status === "scheduled").length;
  const inProgressCount = interviews.filter((item: Interview) => item.status === "in_progress").length;
  const completedCount = interviews.filter((item: Interview) => item.status === "completed").length;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Interview pipeline
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Interviews
            </h1>

            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
              Track candidate interviews from scheduling
              through final evaluation.
            </p>
          </div>

          <Button variant="primary">
            <CalendarDays className="h-4 w-4" />
            Schedule interview
          </Button>
        </div>
      </motion.section>

      {/* Stats */}

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.08,
        }}
        className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {loading ? (
          <div className="col-span-4 flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
          </div>
        ) : error ? (
          <div className="col-span-4 rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center">
            <p className="text-sm font-medium text-ink">{error}</p>
          </div>
        ) : (
          <>
            <Stat
              label="Total interviews"
              value={totalCount}
              icon={Users}
            />

            <Stat
              label="Scheduled"
              value={scheduledCount}
              icon={CalendarDays}
            />

            <Stat
              label="In progress"
              value={inProgressCount}
              icon={Clock3}
            />

            <Stat
              label="Completed"
              value={completedCount}
              icon={CheckCircle2}
            />
          </>
        )}
      </motion.section>

      {/* Filters */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.15,
        }}
        className="mt-8 flex overflow-x-auto rounded-lg border border-line bg-surface p-1"
      >
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-md px-4 py-2 text-xs font-medium capitalize transition ${
              filter === f
                ? "bg-ink text-white"
                : "text-muted hover:bg-paper hover:text-ink"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </motion.div>

      {/* Interview list */}

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.2,
        }}
        className="mt-5 overflow-hidden rounded-xl border border-line bg-surface"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
          </div>
        ) : error ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-ink">{error}</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-ink">No interviews found</p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
              Interviews will appear here once candidates are scheduled.
            </p>
          </div>
        ) : (
          filteredInterviews.map(
            (interview: Interview, index: number) => (
              <InterviewRow
                key={interview.id}
                interview={interview}
                index={index}
              />
            )
          )
        )}
      </motion.section>
    </main>
  );
}

/* -------------------------------------------------- */
/* Interview row                                     */
/* -------------------------------------------------- */

function InterviewRow({
  interview,
  index,
}: {
  interview: Interview;
  index: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
      }}
      className="group flex flex-col gap-4 border-b border-line p-5 last:border-0 transition-colors hover:bg-paper/50 lg:flex-row lg:items-center"
    >
      {/* Candidate */}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper font-display text-sm font-semibold text-ink">
          {interview.candidate
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {interview.candidate}
          </p>

          <p className="mt-0.5 truncate text-xs text-muted">
            {interview.email}
          </p>
        </div>
      </div>

      {/* Drive */}

      <div className="lg:w-48">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Drive
        </p>

        <p className="mt-1 truncate text-xs font-medium text-ink">
          {interview.drive}
        </p>
      </div>

      {/* Date */}

      <div className="lg:w-32">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Date
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-ink">
          <CalendarDays className="h-3.5 w-3.5 text-muted" />
          {interview.date}
        </div>
      </div>

      {/* Time */}

      <div className="lg:w-24">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Time
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <Clock3 className="h-3.5 w-3.5" />
          {interview.time}
        </div>
      </div>

      {/* Status */}

      <div className="lg:w-28">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Status
        </p>

        <div className="mt-1.5">
          <InterviewStatus
            status={interview.status}
          />
        </div>
      </div>

      {/* Score */}

      <div className="lg:w-20">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Score
        </p>

        <p className="mt-1 font-display text-sm font-semibold text-ink">
          {interview.score !== null
            ? `${interview.score.toFixed(1)} / 10`
            : "—"}
        </p>
      </div>

      {/* Action */}

      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-all hover:border-ink hover:bg-paper hover:text-ink"
        title="View interview"
      >
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Status                                             */
/* -------------------------------------------------- */

function InterviewStatus({
  status,
}: {
  status: InterviewStatus;
}) {
  if (status === "completed") {
    return (
      <Badge tone="teal">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Completed
      </Badge>
    );
  }

  if (status === "in_progress") {
    return (
      <Badge tone="amber">
        <Clock3 className="mr-1 h-3 w-3" />
        In progress
      </Badge>
    );
  }

  return (
    <Badge tone="ink">
      <Video className="mr-1 h-3 w-3" />
      Scheduled
    </Badge>
  );
}

/* -------------------------------------------------- */
/* Stat                                               */
/* -------------------------------------------------- */

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
      }}
      className="rounded-xl border border-line bg-surface p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {label}
        </p>

        <Icon className="h-4 w-4 text-muted" />
      </div>

      <p className="mt-3 font-display text-2xl font-semibold text-ink">
        {value}
      </p>
    </motion.div>
  );
}

export default function CompanyInterviewsPage() {
  return (
    <AuthGuard role="company">
      <InterviewsContent />
    </AuthGuard>
  );
}