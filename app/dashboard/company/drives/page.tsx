"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileEdit,
  Filter,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { useAuth } from "@/lib/auth";
import { getMyDrives } from "@/lib/api";
import type { Drive } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

type FilterType = "all" | "open" | "draft";

function CompanyDrivesContent() {
  const { user } = useAuth();

  const [drives, setDrives] = useState<Drive[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrives() {
      try {
        setLoading(true);
        const data = await getMyDrives();
        setDrives(data as Drive[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load drives");
      } finally {
        setLoading(false);
      }
    }

    fetchDrives();
  }, []);

  const companyDrives = useMemo(() => {
    const ownedDrives = drives.filter(
      (drive) => drive.companyId === user?.id
    );

    return ownedDrives.length > 0
      ? ownedDrives
      : drives;
  }, [drives, user]);

  const filteredDrives = useMemo(() => {
    const query = search.trim().toLowerCase();

    return companyDrives.filter((drive) => {
      const matchesFilter =
        filter === "all" ||
        drive.status === filter;

      if (!matchesFilter) return false;

      if (!query) return true;

      return (
        drive.title
          .toLowerCase()
          .includes(query) ||
        drive.role
          .toLowerCase()
          .includes(query) ||
        drive.requiredSkills.some((skill) =>
          skill
            .toLowerCase()
            .includes(query)
        )
      );
    });
  }, [companyDrives, filter, search]);

  const openCount = companyDrives.filter(
    (drive) => drive.status === "open"
  ).length;

  const draftCount = companyDrives.filter(
    (drive) => drive.status === "draft"
  ).length;

  const candidateCount = companyDrives.reduce(
    (total, drive) =>
      total + drive.candidateCount,
    0
  );

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pt-10">
        {/* ------------------------------------------------ */}
        {/* Header                                           */}
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
            duration: 0.55,
            ease,
          }}
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-light text-teal-dark">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
              </span>

              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Recruitment
              </span>
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Interview drives
            </h1>

            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
              Create, manage, and track the interview
              drives your company is running.
            </p>
          </div>

          <Link href="/dashboard/company/new">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                New drive
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </Link>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Summary cards                                    */}
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
            delay: 0.1,
            ease,
          }}
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <SummaryCard
            label="Total drives"
            value={companyDrives.length}
            icon={BriefcaseBusiness}
          />

          <SummaryCard
            label="Open"
            value={openCount}
            icon={CheckCircle2}
          />

          <SummaryCard
            label="Drafts"
            value={draftCount}
            icon={FileEdit}
          />

          <SummaryCard
            label="Candidates"
            value={candidateCount}
            icon={Users}
          />
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Search + filters                                 */}
        {/* ------------------------------------------------ */}

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
            duration: 0.45,
            delay: 0.2,
            ease,
          }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Search */}

          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search drives..."
              className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-teal focus:ring-2 focus:ring-teal/10"
            />
          </div>

          {/* Filters */}

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted" />

            <div className="flex rounded-lg border border-line bg-surface p-1">
              {(
                [
                  ["all", "All"],
                  ["open", "Open"],
                  ["draft", "Drafts"],
                ] as [FilterType, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === value
                      ? "bg-ink text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Drive list                                      */}
        {/* ------------------------------------------------ */}

        <section className="mt-7">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
              <p className="text-sm font-medium text-ink">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    Your drives
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {filteredDrives.length}{" "}
                    {filteredDrives.length === 1
                      ? "drive"
                      : "drives"}{" "}
                    shown
                  </p>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredDrives.length > 0 ? (
                  <motion.div
                    layout
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {filteredDrives.map(
                      (drive, index) => (
                        <DriveListCard
                          key={drive.id}
                          drive={drive}
                          index={index}
                        />
                      )
                    )}
                  </motion.div>
                ) : (
                  <EmptyState
                    search={search}
                    filter={filter}
                    onClear={() => {
                      setSearch("");
                      setFilter("all");
                    }}
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------- */
/* Summary card                                       */
/* -------------------------------------------------- */

function SummaryCard({
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
        <span className="text-xs text-muted">
          {label}
        </span>

        <Icon className="h-4 w-4 text-muted" />
      </div>

      <motion.p
        initial={{
          opacity: 0,
          y: 5,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className="mt-3 font-display text-2xl font-semibold text-ink"
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Drive card                                         */
/* -------------------------------------------------- */

function DriveListCard({
  drive,
  index,
}: {
  drive: Drive;
  index: number;
}) {
  const isOpen = drive.status === "open";

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.96,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
        ease,
      }}
      whileHover={{
        y: -4,
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-shadow duration-300 hover:shadow-[0_8px_30px_-12px_rgba(22,33,62,0.18)]"
    >
      {/* Top status line */}

      <div
        className={`h-0.5 w-full ${
          isOpen
            ? "bg-teal"
            : "bg-line"
        }`}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}

        <div className="flex items-start justify-between gap-3">
          <Badge
            tone={isOpen ? "teal" : "ink"}
          >
            {isOpen ? "Open" : "Draft"}
          </Badge>

          <span className="font-mono text-[10px] text-muted">
            {formatDate(drive.createdAt)}
          </span>
        </div>

        {/* Title */}

        <h3 className="mt-4 font-display text-base font-semibold leading-snug text-ink">
          {drive.title}
        </h3>

        <p className="mt-1 text-xs text-muted">
          {drive.role}
        </p>

        {/* Skills */}

        <div className="mt-4 flex min-h-[26px] flex-wrap gap-1.5">
          {drive.requiredSkills
            .slice(0, 4)
            .map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-paper px-2 py-1 text-[10px] text-muted"
              >
                {skill}
              </span>
            ))}

          {drive.requiredSkills.length > 4 && (
            <span className="rounded-md bg-paper px-2 py-1 text-[10px] text-muted">
              +{drive.requiredSkills.length - 4}
            </span>
          )}
        </div>

        {/* Metrics */}

        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-4">
          <div>
            <div className="flex items-center gap-1.5 text-muted">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[10px]">
                Candidates
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-ink">
              {drive.candidateCount}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-muted">
              <span className="text-[10px]">
                Avg score
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-ink">
              {drive.avgScore !== null
                ? `${drive.avgScore.toFixed(1)} / 10`
                : "—"}
            </p>
          </div>
        </div>

        {/* Action */}

        <div className="mt-auto pt-5">
          <Link
            href={`/dashboard/company/drives/${drive.id}`}
            className="group/link flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-paper"
          >
            <span>
              {isOpen
                ? "Manage drive"
                : "Continue setup"}
            </span>

            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Empty state                                        */
/* -------------------------------------------------- */

function EmptyState({
  search,
  filter,
  onClear,
}: {
  search: string;
  filter: FilterType;
  onClear: () => void;
}) {
  const filtered =
    search.length > 0 ||
    filter !== "all";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center"
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-paper">
        {filtered ? (
          <Search className="h-5 w-5 text-muted" />
        ) : (
          <BriefcaseBusiness className="h-5 w-5 text-muted" />
        )}
      </div>

      <h3 className="mt-4 text-sm font-medium text-ink">
        {filtered
          ? "No matching drives"
          : "No interview drives yet"}
      </h3>

      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
        {filtered
          ? "Try a different search term or clear your filters."
          : "Create your first interview drive to start screening candidates."}
      </p>

      {filtered ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 text-xs font-medium text-teal-dark hover:underline"
        >
          Clear filters
        </button>
      ) : (
        <Link
          href="/dashboard/company/new"
          className="mt-5 inline-block"
        >
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            Create drive
          </Button>
        </Link>
      )}
    </motion.div>
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

export default function CompanyDrivesPage() {
  return (
    <AuthGuard role="company">
      <CompanyDrivesContent />
    </AuthGuard>
  );
}