"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Video,
  X,
} from "lucide-react";

import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth";
import { getMyDrives, getCompanyAnalytics, getAllCandidates, getMyCompany } from "@/lib/api";

function CompanyDashboardContent() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drives, setDrives] = useState<{ id: string; status: string }[]>([]);
  const [analytics, setAnalytics] = useState<{ total_interviews: number; selected_candidates: number; total_applications: number; pending_applications: number; accepted_applications: number; completed_interviews: number } | null>(null);
  const [candidates, setCandidates] = useState<{ id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [company, drivesData, analyticsData, candidatesData] = await Promise.all([
          getMyCompany().catch(() => null),
          getMyDrives(),
          getCompanyAnalytics(),
          getAllCandidates(),
        ]);
        
        if (!company) {
          setError("Company profile not found. Please complete your company setup.");
          setDrives([]);
          setAnalytics(null);
          setCandidates([]);
          return;
        }
        
        setDrives(drivesData.map((d: { id: string; status: string }) => ({ id: d.id, status: d.status })));
        setAnalytics(analyticsData as { total_interviews: number; selected_candidates: number; total_applications: number; pending_applications: number; accepted_applications: number; completed_interviews: number });
        setCandidates(candidatesData as { id: string }[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const companyName =
    user?.companyName ||
    "Northwind Systems";

  const userName =
    user?.name ||
    "Company";

  const firstName =
    userName.trim().split(" ")[0];

  return (
    <div className="min-h-screen bg-paper">

      {/* ================================================= */}
      {/* MOBILE HEADER */}
      {/* ================================================= */}

      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 lg:hidden">

        <Link
          href="/dashboard/company"
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/10">
            <div className="h-4 w-4 rounded-full border-2 border-teal" />
          </div>

          <span className="font-display text-lg font-semibold text-ink">
            HireLoop
          </span>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
          className="rounded-lg p-2 text-muted hover:bg-paper"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

      </header>

      {/* ================================================= */}
      {/* MOBILE NAVIGATION */}
      {/* ================================================= */}

      {mobileMenuOpen && (
        <div className="border-b border-line bg-surface px-4 py-4 lg:hidden">

          <CompanyNavigation
            onNavigate={() =>
              setMobileMenuOpen(false)
            }
          />

        </div>
      )}

      <div className="flex min-h-[calc(100vh-64px)]">

        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">

          {/* Logo */}

          <div className="flex h-20 items-center border-b border-line px-6">

            <Link
              href="/dashboard/company"
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

          {/* Company information */}

          <div className="border-b border-line px-5 py-5">

            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Company
            </p>

            <p className="mt-2 truncate text-sm font-semibold text-ink">
              {companyName}
            </p>

            <p className="mt-1 text-xs text-muted">
              Recruitment workspace
            </p>

          </div>

          {/* Navigation */}

          <div className="flex-1 px-3 py-5">

            <p className="px-3 pb-3 font-mono text-[10px] uppercase tracking-widest text-muted">
              Workspace
            </p>

            <CompanyNavigation />

          </div>

          {/* Bottom sidebar */}

          <div className="border-t border-line p-3">

            <Link
              href="/dashboard/company/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-paper hover:text-ink"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/login";
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-paper hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>

          </div>

        </aside>

        {/* ================================================= */}
        {/* MAIN */}
        {/* ================================================= */}

        <main className="min-w-0 flex-1">

          {/* Top bar */}

          <header className="hidden h-20 items-center justify-between border-b border-line bg-surface px-8 lg:flex">

            <div>

              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Company workspace
              </p>

              <p className="mt-1 text-sm text-muted">
                Recruitment overview
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm font-semibold text-ink">
                {userName}
              </p>

              <p className="text-xs text-muted">
                {companyName}
              </p>

            </div>

          </header>

          {/* Dashboard content */}

          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-7 lg:px-10 lg:py-9">

            {/* ================================================= */}
            {/* HERO */}
            {/* ================================================= */}

            <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                <div>

                  <span className="inline-flex rounded-md bg-teal-light px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-teal">
                    Company
                  </span>

                  <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    Welcome back, {firstName}.
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                    Manage your recruitment pipeline,
                    review candidates, conduct interviews,
                    and track hiring performance.
                  </p>

                </div>

                <Link
                  href="/dashboard/company/drives"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  Create hiring drive
                </Link>

              </div>

            </section>

            {/* ================================================= */}
            {/* STAT CARDS */}
            {/* ================================================= */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

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
                  <CompanyStat
                    label="Active drives"
                    value={String(drives.filter((d) => d.status === "open" || d.status === "draft").length)}
                    icon={BriefcaseBusiness}
                  />

                  <CompanyStat
                    label="Total candidates"
                    value={String(candidates.length)}
                    icon={Users}
                  />

                  <CompanyStat
                    label="Interviews"
                    value={String(analytics?.total_interviews ?? 0)}
                    icon={Video}
                  />

                  <CompanyStat
                    label="Shortlisted"
                    value={String(analytics?.selected_candidates ?? 0)}
                    icon={Activity}
                  />
                </>
              )}

            </section>

            {/* ================================================= */}
            {/* MAIN GRID */}
            {/* ================================================= */}

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">

              {/* ------------------------------------------------ */}
              {/* ACTIVE DRIVES */}
              {/* ------------------------------------------------ */}

              <section className="rounded-xl border border-line bg-surface">

                <div className="flex items-center justify-between border-b border-line px-6 py-5">

                  <div>

                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      Recruitment
                    </p>

                    <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                      Active drives
                    </h2>

                  </div>

                  <Link
                    href="/dashboard/company/drives"
                    className="text-sm font-medium text-teal hover:underline"
                  >
                    View all
                  </Link>

                </div>

                <div className="p-6">

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-teal" />
                    </div>
                  ) : drives.length > 0 ? (
                    <div className="space-y-3">
                      {drives.slice(0, 3).map((drive) => (
                        <div key={drive.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-ink">Drive {drive.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted capitalize">{drive.status}</p>
                          </div>
                          <Link href={`/dashboard/company/drives/${drive.id}`} className="text-xs font-medium text-teal hover:underline">
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">

                    <BriefcaseBusiness className="mx-auto h-8 w-8 text-muted" />

                    <h3 className="mt-4 text-sm font-semibold text-ink">
                      No active hiring drives
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted">
                      Create your first hiring drive to
                      start receiving applications from
                      candidates.
                    </p>

                    <Link
                      href="/dashboard/company/drives"
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                    >
                      Create drive
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                  </div>
                  )}
                </div>

              </section>

              {/* ------------------------------------------------ */}
              {/* QUICK ACTIONS */}
              {/* ------------------------------------------------ */}

              <section className="rounded-xl border border-line bg-surface">

                <div className="border-b border-line px-6 py-5">

                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    Workspace
                  </p>

                  <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                    Quick actions
                  </h2>

                </div>

                <div className="space-y-1 p-3">

                  <QuickAction
                    href="/dashboard/company/candidates"
                    icon={Users}
                    title="Candidates"
                    description="Review your candidate pool"
                  />

                  <QuickAction
                    href="/dashboard/company/drives"
                    icon={BriefcaseBusiness}
                    title="Hiring drives"
                    description="Create and manage drives"
                  />

                  <QuickAction
                    href="/dashboard/company/applications"
                    icon={FileText}
                    title="Applications"
                    description="Review incoming applications"
                  />

                  <QuickAction
                    href="/dashboard/company/interviews"
                    icon={Video}
                    title="Interviews"
                    description="Manage interview activity"
                  />

                  <QuickAction
                    href="/dashboard/company/reports"
                    icon={FileText}
                    title="Reports"
                    description="Review interview reports"
                  />

                  <QuickAction
                    href="/dashboard/company/analytics"
                    icon={BarChart3}
                    title="Analytics"
                    description="View hiring analytics"
                  />

                </div>

              </section>

            </section>

            {/* ================================================= */}
            {/* CANDIDATE OVERVIEW */}
            {/* ================================================= */}

            <section className="mt-8 rounded-xl border border-line bg-surface">

              <div className="flex items-center justify-between border-b border-line px-6 py-5">

                <div>

                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    Candidate pipeline
                  </p>

                  <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                    Candidate overview
                  </h2>

                </div>

                <Link
                  href="/dashboard/company/candidates"
                  className="text-sm font-medium text-teal hover:underline"
                >
                  View candidates
                </Link>

              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

                {loading ? (
                  <div className="col-span-4 flex items-center justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-teal" />
                  </div>
                ) : (
                  <>
                    <PipelineCard
                      label="Applications"
                      value={String(analytics?.total_applications ?? 0)}
                    />

                    <PipelineCard
                      label="Under review"
                      value={String(analytics?.pending_applications ?? 0)}
                    />

                    <PipelineCard
                      label="Shortlisted"
                      value={String(analytics?.accepted_applications ?? 0)}
                    />

                    <PipelineCard
                      label="Interviewed"
                      value={String(analytics?.completed_interviews ?? 0)}
                    />
                  </>
                )}

              </div>

            </section>

            {/* ================================================= */}
            {/* RECENT ACTIVITY */}
            {/* ================================================= */}

            <section className="mt-8 rounded-xl border border-line bg-surface">

              <div className="border-b border-line px-6 py-5">

                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Activity
                </p>

                <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                  Recent activity
                </h2>

              </div>

              <div className="px-6 py-12 text-center">

                <Activity className="mx-auto h-8 w-8 text-muted" />

                <p className="mt-4 text-sm font-semibold text-ink">
                  No recent activity
                </p>

                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted">
                  Candidate applications, interviews,
                  shortlists, and other recruitment activity
                  will appear here.
                </p>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

/* ===================================================== */
/* COMPANY NAVIGATION */
/* ===================================================== */

function CompanyNavigation({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const items = [
    {
      label: "Overview",
      href: "/dashboard/company",
      icon: LayoutDashboard,
    },
    {
      label: "Candidates",
      href: "/dashboard/company/candidates",
      icon: Users,
    },
    {
      label: "Drives",
      href: "/dashboard/company/drives",
      icon: BriefcaseBusiness,
    },
    {
      label: "Applications",
      href: "/dashboard/company/applications",
      icon: FileText,
    },
    {
      label: "Interviews",
      href: "/dashboard/company/interviews",
      icon: Video,
    },
    {
      label: "Reports",
      href: "/dashboard/company/reports",
      icon: FileText,
    },
    {
      label: "Analytics",
      href: "/dashboard/company/analytics",
      icon: BarChart3,
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

/* ===================================================== */
/* STAT CARD */
/* ===================================================== */

function CompanyStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">

      <div className="flex items-center justify-between">

        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {label}
        </p>

        <Icon className="h-5 w-5 text-teal" />

      </div>

      <p className="mt-4 font-display text-3xl font-semibold text-ink">
        {value}
      </p>

    </div>
  );
}

/* ===================================================== */
/* QUICK ACTION */
/* ===================================================== */

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-paper"
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-light text-teal">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-medium text-ink">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted">
          {description}
        </p>

      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted" />

    </Link>
  );
}

/* ===================================================== */
/* PIPELINE CARD */
/* ===================================================== */

function PipelineCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-line p-5">

      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </p>

      <p className="mt-3 font-display text-2xl font-semibold text-ink">
        {value}
      </p>

    </div>
  );
}

/* ===================================================== */
/* PAGE */
/* ===================================================== */

export default function CompanyDashboardPage() {
  return (
    <AuthGuard role="company">
      <CompanyDashboardContent />
    </AuthGuard>
  );
}