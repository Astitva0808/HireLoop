"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  XCircle,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { getAllCandidates } from "@/lib/api";
import type { Candidate as ApiCandidate } from "@/lib/api";

type CandidateStatus =
  "pending"
  | "review"
  | "shortlisted"
  | "rejected";

type Candidate = {
  id: string;
  name: string;
  email: string;
  drive: string;
  interviewStatus:
    | "not_started"
    | "in_progress"
    | "completed";
  applicationStatus: CandidateStatus;
  score: number | null;
};

const DEMO_CANDIDATES: Candidate[] = [
  {
    id: "candidate-1",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    drive: "SDE Intern — Backend",
    interviewStatus: "completed",
    applicationStatus: "shortlisted",
    score: 8.4,
  },
  {
    id: "candidate-2",
    name: "Priya Singh",
    email: "priya@example.com",
    drive: "AI/ML Intern",
    interviewStatus: "in_progress",
    applicationStatus: "pending",
    score: null,
  },
  {
    id: "candidate-3",
    name: "Arjun Verma",
    email: "arjun@example.com",
    drive: "SDE Intern — Backend",
    interviewStatus: "completed",
    applicationStatus: "review",
    score: 7.2,
  },
  {
    id: "candidate-4",
    name: "Ananya Gupta",
    email: "ananya@example.com",
    drive: "Frontend Developer",
    interviewStatus: "completed",
    applicationStatus: "rejected",
    score: 5.8,
  },
];

const filters = [
  "all",
  "pending",
  "review",
  "shortlisted",
  "rejected",
] as const;

function CandidatesContent() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<(typeof filters)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true);
        const data = await getAllCandidates();
        const mapped: Candidate[] = data.map((c: ApiCandidate) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          drive: c.branch || "—",
          interviewStatus: "not_started",
          applicationStatus: "pending" as CandidateStatus,
          score: null,
        }));
        setCandidates(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const query = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        !query ||
        candidate.name
          .toLowerCase()
          .includes(query) ||
        candidate.email
          .toLowerCase()
          .includes(query) ||
        candidate.drive
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        candidate.applicationStatus === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [candidates, search, filter]);

  const totalCandidates = candidates.length;

  const pendingCount = candidates.filter(
    (candidate) =>
      candidate.applicationStatus ===
      "pending"
  ).length;

  const shortlistedCount = candidates.filter(
    (candidate) =>
      candidate.applicationStatus ===
      "shortlisted"
  ).length;

  const completedCount = candidates.filter(
    (candidate) =>
      candidate.interviewStatus ===
      "completed"
  ).length;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      {/* Header */}

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
          Recruitment
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Candidates
            </h1>

            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
              Review applicants, interview performance,
              and candidate scores in one place.
            </p>
          </div>

          <Button variant="primary">
            <Users className="h-4 w-4" />
            Invite candidates
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
        <StatCard
          label="Total candidates"
          value={totalCandidates}
          icon={Users}
        />

        <StatCard
          label="Pending review"
          value={pendingCount}
          icon={Clock3}
        />

        <StatCard
          label="Shortlisted"
          value={shortlistedCount}
          icon={CheckCircle2}
        />

        <StatCard
          label="Interviews done"
          value={completedCount}
          icon={CheckCircle2}
        />
      </motion.section>

      {/* Search / Filters */}

      <motion.section
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
        className="mt-8"
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by candidate, email or drive..."
              className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-4 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/10"
            />
          </div>

          {/* Filter */}

          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-line bg-surface p-1">
            <SlidersHorizontal className="ml-2 mr-1 h-3.5 w-3.5 shrink-0 text-muted" />

            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setFilter(item)
                }
                className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium capitalize transition ${
                  filter === item
                    ? "bg-ink text-white"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Candidate list */}

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
        ) : filteredCandidates.length === 0 ? (
          <EmptyState
            search={search}
            filter={filter}
          />
        ) : (
          filteredCandidates.map(
            (candidate, index) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
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
/* Candidate row                                     */
/* -------------------------------------------------- */

function CandidateRow({
  candidate,
  index,
}: {
  candidate: Candidate;
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
          {candidate.name
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {candidate.name}
          </p>

          <p className="mt-0.5 truncate text-xs text-muted">
            {candidate.email}
          </p>
        </div>
      </div>

      {/* Drive */}

      <div className="lg:w-48">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Applied for
        </p>

        <p className="mt-1 truncate text-xs font-medium text-ink">
          {candidate.drive}
        </p>
      </div>

      {/* Interview */}

      <div className="lg:w-32">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Interview
        </p>

        <div className="mt-1.5">
          <InterviewStatus
            status={
              candidate.interviewStatus
            }
          />
        </div>
      </div>

      {/* Score */}

      <div className="lg:w-20">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Score
        </p>

        <p className="mt-1 font-display text-sm font-semibold text-ink">
          {candidate.score !== null
            ? `${candidate.score.toFixed(1)} / 10`
            : "—"}
        </p>
      </div>

      {/* Application status */}

      <div className="lg:w-28">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Status
        </p>

        <div className="mt-1.5">
          <CandidateStatus
            status={
              candidate.applicationStatus
            }
          />
        </div>
      </div>

      {/* Action */}

      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-all hover:border-ink hover:bg-paper hover:text-ink"
        title="View candidate"
      >
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Stats                                              */
/* -------------------------------------------------- */

function StatCard({
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

/* -------------------------------------------------- */
/* Candidate status                                   */
/* -------------------------------------------------- */

function CandidateStatus({
  status,
}: {
  status: CandidateStatus;
}) {
  if (status === "shortlisted") {
    return (
      <Badge tone="teal">
        Shortlisted
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge tone="ink">
        Rejected
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge tone="amber">
        Pending
      </Badge>
    );
  }

  return (
    <Badge tone="ink">
      Review
    </Badge>
  );
}

/* -------------------------------------------------- */
/* Interview status                                   */
/* -------------------------------------------------- */

function InterviewStatus({
  status,
}: {
  status: Candidate["interviewStatus"];
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-teal-dark">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber">
        <Clock3 className="h-3.5 w-3.5" />
        In progress
      </span>
    );
  }

  return (
    <span className="text-xs text-muted">
      Not started
    </span>
  );
}

/* -------------------------------------------------- */
/* Empty state                                        */
/* -------------------------------------------------- */

function EmptyState({
  search,
  filter,
}: {
  search: string;
  filter: string;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-paper">
        {search ? (
          <Search className="h-5 w-5 text-muted" />
        ) : (
          <Users className="h-5 w-5 text-muted" />
        )}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-ink">
        {search
          ? "No candidates found"
          : `No ${filter} candidates`}
      </h3>

      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
        {search
          ? "Try a different name, email address, or drive."
          : "Candidates matching this status will appear here."}
      </p>
    </div>
  );
}

export default function CompanyCandidatesPage() {
  return (
    <AuthGuard role="company">
      <CandidatesContent />
    </AuthGuard>
  );
}