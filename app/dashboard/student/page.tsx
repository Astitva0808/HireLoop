"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { SessionCard } from "@/components/SessionCard";
import { DriveCard } from "@/components/DriveCard";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { getMyInterviews, getOpenDrives } from "@/lib/api";
import type { Interview as ApiInterview } from "@/lib/api";
import type { InterviewSession, Drive } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------- */
/* Navigation                                         */
/* -------------------------------------------------- */

function StudentNavigation({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const items = [
    {
      label: "Dashboard",
      href: "/dashboard/student",
      icon: LayoutDashboard,
    },
    {
      label: "Open drives",
      href: "/dashboard/student/drives",
      icon: BriefcaseBusiness,
    },
    {
      label: "Interview",
      href: "/interview",
      icon: MessageSquare,
    },
    {
      label: "Feedback",
      href: "/feedback",
      icon: Sparkles,
    },
  ];

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <Icon className="h-4 w-4 shrink-0" />

            <span className="flex-1">
              {item.label}
            </span>

            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          </Link>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------- */
/* Dashboard                                          */
/* -------------------------------------------------- */

function StudentDashboardContent() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [openDrives, setOpenDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [interviewsData, drivesData] = await Promise.all([
          getMyInterviews().catch(() => []),
          getOpenDrives().catch(() => []),
        ]);

        const mappedSessions: InterviewSession[] = (interviewsData as ApiInterview[]).map((interview) => ({
          id: interview.id,
          driveId: interview.drive_id,
          driveTitle: `Drive ${interview.drive_id.slice(0, 8)}`,
          companyName: "—",
          studentId: interview.candidate_id,
          studentName: `Candidate ${interview.candidate_id.slice(0, 8)}`,
          status: ["not_started", "in_progress", "completed"].includes(interview.status)
            ? (interview.status as "not_started" | "in_progress" | "completed")
            : "not_started",
          overallScore: interview.overall_score ?? null,
        }));

        setSessions(mappedSessions);
        setOpenDrives(drivesData as Drive[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const completed = useMemo(
    () =>
      sessions.filter(
        (session) => session.status === "completed"
      ),
    [sessions]
  );

  const inProgress = useMemo(
    () =>
      sessions.filter(
        (session) => session.status === "in_progress"
      ),
    [sessions]
  );

  const avgScore =
    completed.length > 0
      ? completed.reduce(
          (sum, session) => sum + (session.overallScore ?? 0),
          0
        ) / completed.length
      : null;

  const attemptedDriveIds = new Set(
    sessions.map((session) => session.driveId)
  );

  const availableDrives = openDrives.filter(
    (drive) => !attemptedDriveIds.has(drive.id)
  );

  const userName = user?.name || "Student";
  const firstName = userName.trim().split(" ")[0];
  const branch = user?.branch || "Student";

  return (
    <div className="min-h-screen bg-paper">
      {/* Mobile header */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 lg:hidden">
        <Link href="/dashboard/student" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/10">
            <div className="h-4 w-4 rounded-full border-2 border-teal" />
          </div>
          <span className="font-display text-lg font-semibold text-ink">
            HireLoop
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-muted hover:bg-paper"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-line bg-surface px-4 py-4 lg:hidden">
          <StudentNavigation
            onNavigate={() => setMobileMenuOpen(false)}
          />

          <div className="mt-4 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-paper hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-line px-6">
            <Link
              href="/dashboard/student"
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/10">
                <div className="h-4 w-4 rounded-full border-2 border-teal" />
              </div>
              <span className="font-display text-xl font-semibold text-ink">
                HireLoop
              </span>
            </Link>
          </div>

          <div className="border-b border-line px-5 py-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Candidate
            </p>
            <p className="mt-2 truncate text-sm font-semibold text-ink">
              {userName}
            </p>
            <p className="mt-1 text-xs text-muted">
              {branch}
            </p>
          </div>

          <div className="flex-1 px-3 py-5">
            <p className="px-3 pb-3 font-mono text-[10px] uppercase tracking-widest text-muted">
              Workspace
            </p>
            <StudentNavigation />
          </div>

          <div className="border-t border-line p-3">
            <button
              type="button"
              onClick={signOut}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-paper hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="hidden h-20 items-center justify-between border-b border-line bg-surface px-8 lg:flex">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Candidate workspace
              </p>
              <p className="mt-1 text-sm text-muted">
                Your interview dashboard
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">
                {firstName}
              </p>
              <p className="text-xs text-muted">
                {branch}
              </p>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
            {/* Welcome */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease }}
              className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <span className="inline-flex rounded-md bg-teal-light px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-teal">
                  Candidate
                </span>
                <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  Welcome back, {firstName}.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  Find opportunities, complete interviews, and track how you perform.
                </p>
              </div>

              {availableDrives.length > 0 && (
                <Link href="#open-drives">
                  <Button variant="primary">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Explore drives
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </motion.section>

            {/* Stats */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
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
                  <StatCard
                    label="Completed"
                    value={completed.length}
                    icon={CheckCircle2}
                  />
                  <StatCard
                    label="In progress"
                    value={inProgress.length}
                    icon={Clock3}
                  />
                  <StatCard
                    label="Open to you"
                    value={availableDrives.length}
                    icon={BriefcaseBusiness}
                  />
                  <StatCard
                    label="Average score"
                    value={
                      avgScore !== null
                        ? avgScore.toFixed(1)
                        : "—"
                    }
                    suffix={
                      avgScore !== null
                        ? "/ 10"
                        : undefined
                    }
                    icon={Target}
                  />
                </>
              )}
            </motion.section>

            {/* Current interview */}
            {inProgress.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15, ease }}
                className="mt-8"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      Continue
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-ink">
                      Interview in progress
                    </h2>
                  </div>
                  <Badge tone="teal">Live</Badge>
                </div>

                <div className="overflow-hidden rounded-xl border border-teal/20 bg-teal-light/40 p-5 sm:p-6">
                  {inProgress.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-display text-base font-semibold text-ink">
                          {session.driveTitle}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {session.companyName}
                        </p>
                      </div>
                      <Link href={`/interview?sessionId=${session.id}`}>
                        <Button variant="primary">
                          Continue interview
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Open drives */}
            <section id="open-drives" className="mt-10 scroll-mt-20">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2, ease }}
                className="flex items-end justify-between"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    Opportunities
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-ink">
                    Open drives
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Interview opportunities available to you.
                  </p>
                </div>
                {availableDrives.length > 0 && (
                  <span className="hidden text-xs text-muted sm:block">
                    {availableDrives.length} available
                  </span>
                )}
              </motion.div>

              {loading ? (
                <div className="mt-4 flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
                </div>
              ) : error ? (
                <div className="mt-4 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
                  <p className="text-sm font-medium text-ink">{error}</p>
                </div>
              ) : availableDrives.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.25 }}
                  className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {availableDrives.map((drive, index) => (
                    <motion.div
                      key={drive.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.25 + index * 0.06,
                        ease,
                      }}
                      whileHover={{ y: -4 }}
                    >
                      <DriveCard drive={drive} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyDrives />
              )}
            </section>

            {/* Interview history */}
            <section className="mt-10">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3, ease }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Your activity
                </p>
                <h2 className="mt-1 text-lg font-semibold text-ink">
                  Interview history
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Review your completed and upcoming interviews.
                </p>
              </motion.div>

              {loading ? (
                <div className="mt-4 flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
                </div>
              ) : error ? (
                <div className="mt-4 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
                  <p className="text-sm font-medium text-ink">{error}</p>
                </div>
              ) : sessions.length === 0 ? (
                <EmptySessions />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.35 + index * 0.05,
                        ease,
                      }}
                      whileHover={{ y: -3 }}
                    >
                      <SessionCard session={session} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>

            {/* Preparation CTA */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease }}
              className="mt-10 overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="relative p-6 sm:p-7">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-teal-light/60 blur-3xl" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-light text-teal-dark">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-ink">
                        Prepare smarter
                      </h3>
                      <p className="mt-1 max-w-lg text-xs leading-relaxed text-muted">
                        Your interview performance is broken down skill by skill so you know exactly where to improve.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/student/feedback">
                    <Button variant="ghost">
                      View feedback
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Stat card                                          */
/* -------------------------------------------------- */

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-line bg-surface p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <Icon className="h-4 w-4 text-muted" />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <p className="font-display text-xl font-semibold text-ink">
          {value}
        </p>
        {suffix && (
          <span className="text-[10px] text-muted">{suffix}</span>
        )}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Empty states                                       */
/* -------------------------------------------------- */

function EmptyDrives() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper">
        <BriefcaseBusiness className="h-5 w-5 text-muted" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-ink">
        No new opportunities
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
        You&apos;ve either attempted all currently open drives or there aren&apos;t any available right now.
      </p>
    </motion.div>
  );
}

function EmptySessions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper">
        <Clock3 className="h-5 w-5 text-muted" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-ink">
        No interviews yet
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
        Open drives will appear above. Start an interview to begin building your profile.
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Page wrapper                                       */
/* -------------------------------------------------- */

export default function StudentDashboardPage() {
  return (
    <AuthGuard role="student">
      <StudentDashboardContent />
    </AuthGuard>
  );
}
