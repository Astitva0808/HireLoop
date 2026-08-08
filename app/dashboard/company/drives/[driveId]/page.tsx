"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileEdit,
  Plus,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { getMyDrives } from "@/lib/api";
import type {
  Drive,
  InterviewSession,
  SessionStatus,
} from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

function DriveDetailsContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();

  const driveId = params.driveId as string;

  const [drive, setDrive] =
    useState<Drive | null>(null);

  const [sessions, setSessions] =
    useState<InterviewSession[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrive() {
      try {
        setLoading(true);
        const allDrives = await getMyDrives();
        const foundDrive = allDrives.find(
          (item) => item.id === driveId
        );

        setDrive((foundDrive as Drive) ?? null);
        setSessions([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load drive");
      } finally {
        setLoading(false);
      }
    }

    fetchDrive();
  }, [driveId]);

  const visibleSessions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return sessions;
    }

    return sessions.filter((session) =>
      session.studentName
        .toLowerCase()
        .includes(query)
    );
  }, [sessions, search]);

  const completedCount = sessions.filter(
    (session) =>
      session.status === "completed"
  ).length;

  const inProgressCount = sessions.filter(
    (session) =>
      session.status === "in_progress"
  ).length;

  const pendingCount = sessions.filter(
    (session) =>
      session.status === "not_started"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <main className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-screen bg-paper">
        <main className="mx-auto max-w-5xl px-6 py-12">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/company/drives"
              )
            }
            className="group flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to drives
          </button>

        <div className="mt-12 rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
          <BriefcaseBusiness className="mx-auto h-6 w-6 text-muted" />

          <h1 className="mt-4 text-sm font-semibold text-ink">
            {error ? "Error loading drive" : "Drive not found"}
          </h1>

          <p className="mt-1 text-sm text-muted">
            {error || "This interview drive may have been removed or does not exist."}
          </p>

            <Link
              href="/dashboard/company/drives"
              className="mt-5 inline-block"
            >
              <Button variant="primary">
                Back to drives
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pt-10">
        {/* ------------------------------------------------ */}
        {/* Back                                             */}
        {/* ------------------------------------------------ */}

        <motion.button
          initial={{
            opacity: 0,
            x: -8,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.4,
            ease,
          }}
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/company/drives"
            )
          }
          className="group flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          All drives
        </motion.button>

        {/* ------------------------------------------------ */}
        {/* Drive header                                    */}
        {/* ------------------------------------------------ */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.05,
            ease,
          }}
          className="mt-7 rounded-xl border border-line bg-surface p-6 sm:p-7"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={
                    drive.status === "open"
                      ? "teal"
                      : "ink"
                  }
                >
                  {drive.status === "open"
                    ? "Open"
                    : drive.status === "draft"
                      ? "Draft"
                      : "Closed"}
                </Badge>

                <span className="font-mono text-[10px] text-muted">
                  Created{" "}
                  {formatDate(
                    drive.createdAt
                  )}
                </span>
              </div>

              <h1 className="mt-4 max-w-2xl font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {drive.title}
              </h1>

              <p className="mt-1.5 text-sm text-muted">
                {drive.role}
              </p>

              {/* Skills */}

              <div className="mt-5 flex flex-wrap gap-1.5">
                {drive.requiredSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-paper px-2.5 py-1.5 text-[11px] text-muted"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {drive.status === "draft" && (
                <Link
                  href="/dashboard/company/new"
                >
                  <Button variant="ghost">
                    <FileEdit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              )}

              {drive.status === "open" && (
                <Button variant="primary">
                  <Plus className="h-4 w-4" />
                  Invite candidates
                </Button>
              )}
            </div>
          </div>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Metrics                                          */}
        {/* ------------------------------------------------ */}

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
            duration: 0.5,
            delay: 0.12,
            ease,
          }}
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <MetricCard
            label="Candidates"
            value={drive.candidateCount}
            icon={Users}
          />

          <MetricCard
            label="Completed"
            value={completedCount}
            icon={CheckCircle2}
          />

          <MetricCard
            label="In progress"
            value={inProgressCount}
            icon={Clock3}
          />

          <MetricCard
            label="Avg score"
            value={
              drive.avgScore !== null
                ? `${drive.avgScore.toFixed(1)} / 10`
                : "—"
            }
            icon={BriefcaseBusiness}
          />
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Candidates section                               */}
        {/* ------------------------------------------------ */}

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
            duration: 0.5,
            delay: 0.18,
            ease,
          }}
          className="mt-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Candidate pipeline
              </p>

              <h2 className="mt-1 text-lg font-semibold text-ink">
                Candidates
              </h2>
            </div>

            {sessions.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                <input
                  type="search"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search candidates..."
                  className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-xs text-ink outline-none transition-all placeholder:text-muted focus:border-teal focus:ring-2 focus:ring-teal/10"
                />
              </div>
            )}
          </div>

          {/* Candidate list */}

          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
            {visibleSessions.length > 0 ? (
              <div>
                {visibleSessions.map(
                  (session, index) => (
                    <CandidateRow
                      key={session.id}
                      session={session}
                      index={index}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyCandidates
                pendingCount={pendingCount}
                driveStatus={drive.status}
              />
            )}
          </div>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Interview configuration                          */}
        {/* ------------------------------------------------ */}

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
            duration: 0.5,
            delay: 0.25,
            ease,
          }}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-light text-teal-dark">
                <BriefcaseBusiness className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium text-ink">
                  Question source
                </p>

                <p className="text-xs text-muted">
                  How this drive generates questions
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Badge
                tone={
                  drive.questionSource ===
                  "auto"
                    ? "teal"
                    : "ink"
                }
              >
                {drive.questionSource ===
                "auto"
                  ? "AI-generated"
                  : "Custom questions"}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper text-muted">
                {drive.status ===
                "open" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : drive.status ===
                  "draft" ? (
                  <FileEdit className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-ink">
                  Drive status
                </p>

                <p className="text-xs text-muted">
                  Current recruitment state
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Badge
                tone={
                  drive.status ===
                  "open"
                    ? "teal"
                    : "ink"
                }
              >
                {drive.status ===
                "open"
                  ? "Accepting candidates"
                  : drive.status ===
                    "draft"
                    ? "Not published"
                    : "Closed"}
              </Badge>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

/* -------------------------------------------------- */
/* Metric card                                        */
/* -------------------------------------------------- */

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
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
        <span className="text-xs text-muted">
          {label}
        </span>

        <Icon className="h-4 w-4 text-muted" />
      </div>

      <p className="mt-3 font-display text-xl font-semibold text-ink">
        {value}
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Candidate row                                      */
/* -------------------------------------------------- */

function CandidateRow({
  session,
  index,
}: {
  session: InterviewSession;
  index: number;
}) {
  const statusConfig: Record<
    SessionStatus,
    {
      label: string;
      tone: "teal" | "amber" | "ink";
      icon: React.ElementType;
    }
  > = {
    completed: {
      label: "Completed",
      tone: "teal",
      icon: CheckCircle2,
    },
    in_progress: {
      label: "In progress",
      tone: "amber",
      icon: Clock3,
    },
    not_started: {
      label: "Not started",
      tone: "ink",
      icon: Clock3,
    },
  };

  const config =
    statusConfig[session.status];

  const StatusIcon = config.icon;

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
        duration: 0.35,
        delay: index * 0.05,
        ease,
      }}
      className="flex flex-col gap-4 border-b border-line px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper text-xs font-semibold text-ink">
          {session.studentName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {session.studentName}
          </p>

          <p className="mt-0.5 font-mono text-[10px] text-muted">
            {session.id}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <StatusIcon className="h-3.5 w-3.5 text-muted" />

          <Badge tone={config.tone}>
            {config.label}
          </Badge>
        </div>

        <div className="min-w-16 text-right">
          <p className="text-[10px] text-muted">
            Score
          </p>

          <p className="text-sm font-semibold text-ink">
            {session.overallScore !== null
              ? `${session.overallScore.toFixed(1)}`
              : "—"}
          </p>
        </div>

        <button
          type="button"
          className="hidden h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-paper hover:text-ink sm:flex"
          aria-label={`View ${session.studentName}`}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Empty candidates                                   */
/* -------------------------------------------------- */

function EmptyCandidates({
  pendingCount,
  driveStatus,
}: {
  pendingCount: number;
  driveStatus: Drive["status"];
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper">
        <Users className="h-5 w-5 text-muted" />
      </div>

      <h3 className="mt-4 text-sm font-medium text-ink">
        No candidate interviews yet
      </h3>

      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
        {driveStatus === "draft"
          ? "Publish this drive before candidates can apply."
          : "Candidates and their interview sessions will appear here."}
      </p>

      {pendingCount > 0 && (
        <p className="mt-2 text-[10px] text-muted">
          {pendingCount} candidate
          {pendingCount === 1
            ? ""
            : "s"} waiting to start.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* Date formatter                                     */
/* -------------------------------------------------- */

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

/* -------------------------------------------------- */
/* Page                                               */
/* -------------------------------------------------- */

export default function CompanyDriveDetailsPage() {
  return (
    <AuthGuard role="company">
      <DriveDetailsContent />
    </AuthGuard>
  );
}