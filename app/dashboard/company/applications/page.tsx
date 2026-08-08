"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
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
import { getMyDrives, getDriveApplications, getAllCandidates } from "@/lib/api";
import type { Application as ApiApplication } from "@/lib/api";
import type { Candidate as ApiCandidate } from "@/lib/api";

type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected";

type Application = {
  id: string;
  candidateName: string;
  email: string;
  drive: string;
  appliedAt: string;
  status: ApplicationStatus;
  interviewStatus: "not_started" | "in_progress" | "completed";
  score: number | null;
};

const DEMO_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    candidateName: "Rahul Sharma",
    email: "rahul@example.com",
    drive: "SDE Intern — Backend",
    appliedAt: "Aug 5, 2026",
    status: "accepted",
    interviewStatus: "completed",
    score: 8.4,
  },
  {
    id: "app-2",
    candidateName: "Priya Singh",
    email: "priya@example.com",
    drive: "AI/ML Intern",
    appliedAt: "Aug 6, 2026",
    status: "pending",
    interviewStatus: "in_progress",
    score: null,
  },
  {
    id: "app-3",
    candidateName: "Arjun Verma",
    email: "arjun@example.com",
    drive: "SDE Intern — Backend",
    appliedAt: "Aug 6, 2026",
    status: "pending",
    interviewStatus: "not_started",
    score: null,
  },
  {
    id: "app-4",
    candidateName: "Ananya Gupta",
    email: "ananya@example.com",
    drive: "Frontend Developer — Batch 2026",
    appliedAt: "Aug 7, 2026",
    status: "rejected",
    interviewStatus: "completed",
    score: 5.8,
  },
];

const filters = [
  "all",
  "pending",
  "accepted",
  "rejected",
] as const;

function ApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<(typeof filters)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        const [drives, candidates] = await Promise.all([
          getMyDrives(),
          getAllCandidates(),
        ]);

        const candidateMap = new Map(
          candidates.map((c: ApiCandidate) => [c.id, c])
        );

        const allApplications: Application[] = [];

        for (const drive of drives) {
          try {
            const driveApplications = await getDriveApplications(drive.id);
            for (const app of driveApplications) {
              const candidate = candidateMap.get(app.candidate_id);
              allApplications.push({
                id: app.id,
                candidateName: candidate?.name || `Candidate ${app.candidate_id.slice(0, 8)}`,
                email: candidate?.email || "—",
                drive: drive.title,
                appliedAt: app.created_at ? new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
                status: app.status as ApplicationStatus,
                interviewStatus: "not_started",
                score: null,
              });
            }
          } catch {
            // Skip drives that fail to load applications
          }
        }

        setApplications(allApplications);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load applications");
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        app.candidateName
          .toLowerCase()
          .includes(query) ||
        app.email
          .toLowerCase()
          .includes(query) ||
        app.drive.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || app.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, search, filter]);

  const pendingCount = applications.filter(
    (a) => a.status === "pending"
  ).length;

  const acceptedCount = applications.filter(
    (a) => a.status === "accepted"
  ).length;

  const rejectedCount = applications.filter(
    (a) => a.status === "rejected"
  ).length;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      {/* Header */}

      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Recruitment
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Applications
            </h1>

            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
              Review incoming candidate applications
              for your drives.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Stats */}

      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <StatCard
          label="Total applications"
          value={applications.length}
          icon={FileText}
        />

        <StatCard
          label="Pending"
          value={pendingCount}
          icon={Clock3}
        />

        <StatCard
          label="Accepted"
          value={acceptedCount}
          icon={CheckCircle2}
        />

        <StatCard
          label="Rejected"
          value={rejectedCount}
          icon={XCircle}
        />
      </motion.section>

      {/* Search / Filters */}

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-8"
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
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
                onClick={() => setFilter(item)}
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

      {/* Application list */}

      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
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
        ) : filteredApplications.length === 0 ? (
          <EmptyState search={search} filter={filter} />
        ) : (
          filteredApplications.map(
            (app, index) => (
              <ApplicationRow
                key={app.id}
                application={app}
                index={index}
              />
            )
          )
        )}
      </motion.section>
    </main>
  );
}

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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-line bg-surface p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{label}</p>

        <Icon className="h-4 w-4 text-muted" />
      </div>

      <p className="mt-3 font-display text-2xl font-semibold text-ink">
        {value}
      </p>
    </motion.div>
  );
}

function ApplicationRow({
  application,
  index,
}: {
  application: Application;
  index: number;
}) {
  const statusConfig: Record<
    ApplicationStatus,
    { label: string; tone: "teal" | "amber" | "ink" }
  > = {
    accepted: { label: "Accepted", tone: "teal" },
    rejected: { label: "Rejected", tone: "ink" },
    pending: { label: "Pending", tone: "amber" },
  };

  const config = statusConfig[application.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group flex flex-col gap-4 border-b border-line p-5 last:border-0 transition-colors hover:bg-paper/50 lg:flex-row lg:items-center"
    >
      {/* Candidate */}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper font-display text-sm font-semibold text-ink">
          {application.candidateName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {application.candidateName}
          </p>

          <p className="mt-0.5 truncate text-xs text-muted">
            {application.email}
          </p>
        </div>
      </div>

      {/* Drive */}

      <div className="lg:w-48">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Applied for
        </p>

        <p className="mt-1 truncate text-xs font-medium text-ink">
          {application.drive}
        </p>
      </div>

      {/* Applied date */}

      <div className="lg:w-28">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Applied
        </p>

        <p className="mt-1 text-xs text-ink">
          {application.appliedAt}
        </p>
      </div>

      {/* Status */}

      <div className="lg:w-28">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Status
        </p>

        <div className="mt-1.5">
          <Badge tone={config.tone}>
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Interview */}

      <div className="lg:w-28">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Interview
        </p>

        <p className="mt-1 text-xs text-ink">
          {application.interviewStatus === "completed"
            ? "Completed"
            : application.interviewStatus === "in_progress"
              ? "In progress"
              : "Not started"}
        </p>
      </div>

      {/* Score */}

      <div className="lg:w-20">
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
          Score
        </p>

        <p className="mt-1 font-display text-sm font-semibold text-ink">
          {application.score !== null
            ? `${application.score.toFixed(1)} / 10`
            : "—"}
        </p>
      </div>

      {/* Action */}

      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-all hover:border-ink hover:bg-paper hover:text-ink"
        title="View application"
      >
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </motion.div>
  );
}

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
          <FileText className="h-5 w-5 text-muted" />
        )}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-ink">
        {search
          ? "No applications found"
          : `No ${filter} applications`}
      </h3>

      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
        {search
          ? "Try a different search term or clear your filters."
          : "Applications matching this status will appear here."}
      </p>
    </div>
  );
}

export default function CompanyApplicationsPage() {
  return (
    <AuthGuard role="company">
      <ApplicationsContent />
    </AuthGuard>
  );
}
