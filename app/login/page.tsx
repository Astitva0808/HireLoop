"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Input";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    // Redirect based on the role we just loaded into context.
    const dest =
      JSON.parse(localStorage.getItem("hireloop_mock_session") || "{}")
        .role === "company"
        ? "/dashboard/company"
        : "/dashboard/student";
    router.push(dest);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>

        <div className="rounded-xl border border-line bg-surface p-7">
          <h1 className="font-display text-xl font-semibold text-ink">
            Log in
          </h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back — pick up where you left off.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && (
              <p className="rounded-md bg-signal-light px-3 py-2 text-sm text-signal">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="mt-2 w-full"
              disabled={submitting}
            >
              {submitting ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-teal-dark">
            Sign up
          </Link>
        </p>

        {user && (
          <p className="mt-3 text-center font-mono text-xs text-muted">
            Signed in as {user.email} —{" "}
            <Link
              href={
                user.role === "company"
                  ? "/dashboard/company"
                  : "/dashboard/student"
              }
              className="text-teal-dark"
            >
              go to dashboard
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
