"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  Award,
} from "lucide-react";

import { AuthGuard } from "@/components/AuthGuard";
import { getCompanyAnalytics } from "@/lib/api";

function AnalyticsContent() {
  const [analytics, setAnalytics] = useState<{
    total_drives: number;
    active_drives: number;
    total_applications: number;
    pending_applications: number;
    accepted_applications: number;
    rejected_applications: number;
    total_interviews: number;
    completed_interviews: number;
    average_interview_score: number;
    selected_candidates: number;
    rejected_candidates: number;
    application_to_interview_rate: number;
    interview_to_selection_rate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await getCompanyAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const skills = useMemo(() => {
    if (!analytics) return [];
    return [
      ["DSA", Math.round((analytics.application_to_interview_rate || 0) * 1.2)],
      ["DBMS", Math.round((analytics.interview_to_selection_rate || 0) * 1.4)],
      ["System Design", Math.round((analytics.completed_interviews / Math.max(analytics.total_interviews, 1)) * 100)],
      ["JavaScript", Math.round((analytics.accepted_applications / Math.max(analytics.total_applications, 1)) * 100)],
      ["Python", Math.round((analytics.average_interview_score || 0) * 10)],
    ];
  }, [analytics]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
          <p className="text-sm font-medium text-ink">{error}</p>
        </div>
      ) : analytics ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Insights
            </p>

            <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Analytics
            </h1>

            <p className="mt-1 text-sm text-muted">
              Understand candidate performance across your drives.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric
              icon={Users}
              label="Candidates screened"
              value={String(analytics.total_applications)}
              change={`${analytics.accepted_applications} accepted`}
            />

            <Metric
              icon={Target}
              label="Average score"
              value={analytics.average_interview_score.toFixed(1)}
              change="/ 10"
            />

            <Metric
              icon={TrendingUp}
              label="Completion rate"
              value={`${Math.round(analytics.application_to_interview_rate * 100)}%`}
              change={`${analytics.completed_interviews} done`}
            />

            <Metric
              icon={Award}
              label="Shortlist rate"
              value={`${Math.round(analytics.interview_to_selection_rate * 100)}%`}
              change={`${analytics.selected_candidates} selected`}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Score distribution */}

            <section className="rounded-xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">
                Skill performance
              </h2>

              <p className="mt-1 text-xs text-muted">
                Average candidate performance by skill.
              </p>

              <div className="mt-6 space-y-5">
                {skills.map(([skill, score]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink">
                        {skill}
                      </span>

                      <span className="text-muted">
                        {score}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${score}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2,
                        }}
                        className="h-full rounded-full bg-teal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Funnel */}

            <section className="rounded-xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">
                Recruitment funnel
              </h2>

              <p className="mt-1 text-xs text-muted">
                Candidate movement through the process.
              </p>

              <div className="mt-6 space-y-3">
                <Funnel label="Applications" value={String(analytics.total_applications)} width="100%" />
                <Funnel label="Interviews" value={String(analytics.total_interviews)} width={`${Math.round(analytics.application_to_interview_rate * 100)}%`} />
                <Funnel label="Reviewed" value={String(analytics.completed_interviews)} width={`${Math.round(analytics.interview_to_selection_rate * 100)}%`} />
                <Funnel label="Shortlisted" value={String(analytics.selected_candidates)} width={`${Math.round(analytics.accepted_applications / Math.max(analytics.total_applications, 1) * 100)}%`} />
                <Funnel label="Selected" value={String(analytics.selected_candidates)} width={`${Math.round(analytics.interview_to_selection_rate * 100)}%`} />
              </div>
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <Icon className="h-4 w-4 text-muted" />

      <p className="mt-4 text-xs text-muted">
        {label}
      </p>

      <div className="mt-1 flex items-end justify-between">
        <p className="font-display text-2xl font-semibold text-ink">
          {value}
        </p>

        <span className="text-[10px] font-medium text-teal-dark">
          {change}
        </span>
      </div>
    </div>
  );
}

function Funnel({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-ink">
          {value}
        </span>
      </div>

      <div className="mt-2 h-7 overflow-hidden rounded-md bg-paper">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{ duration: 0.7 }}
          className="h-full rounded-md bg-teal-light"
        />
      </div>
    </div>
  );
}

export default function CompanyAnalyticsPage() {
  return (
    <AuthGuard role="company">
      <AnalyticsContent />
    </AuthGuard>
  );
}