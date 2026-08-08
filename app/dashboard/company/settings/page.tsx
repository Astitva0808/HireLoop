"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Input";
import { useAuth } from "@/lib/auth";
import { getMyCompany, getSettings, updateSettings } from "@/lib/api";

function SettingsContent() {
  const { user } = useAuth();

  const [name, setName] = useState(
    user?.name ?? ""
  );

  const [company, setCompany] = useState(
    user?.companyName ?? ""
  );

  const [email, setEmail] = useState(
    user?.email ?? ""
  );

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const companyData = await getMyCompany();
        setName(companyData.name || user?.name || "");
        setCompany(companyData.name || user?.companyName || "");
        setEmail(companyData.email || user?.email || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [user]);

  async function handleSave() {
    try {
      setError(null);
      const companyData = await getMyCompany();
      await updateSettings(companyData.id, {
        email_notifications: true,
        interview_notifications: true,
        application_notifications: true,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Account
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted">
          Manage your company profile and account information.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 rounded-xl border border-line bg-surface p-6 sm:p-7"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
          </div>
        ) : error ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-ink">{error}</p>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-ink">
              Company profile
            </h2>

            <div className="mt-6 space-y-5">
          <Field label="Your name" htmlFor="name">
            <Input
              id="name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </Field>

          <Field label="Company name" htmlFor="company">
            <Input
              id="company"
              value={company}
              onChange={(e) =>
                setCompany(e.target.value)
              }
            />
          </Field>

          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-5">
          {error && !loading && (
            <span className="text-xs text-signal">
              {error}
            </span>
          )}

          {saved && (
            <span className="text-xs text-teal-dark">
              Changes saved
            </span>
          )}

          <Button
            variant="primary"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </div>
          </>
        )}
      </motion.section>
    </main>
  );
}

export default function CompanySettingsPage() {
  return (
    <AuthGuard role="company">
      <SettingsContent />
    </AuthGuard>
  );
}