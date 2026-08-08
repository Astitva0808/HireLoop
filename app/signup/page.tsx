"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Input";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

function SignupForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as UserRole) || "student";

  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [branch, setBranch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signUp({
      name,
      email,
      password,
      role,
      companyName: role === "company" ? companyName : undefined,
      branch: role === "student" ? branch : undefined,
    });
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    router.push(role === "company" ? "/dashboard/company" : "/dashboard/student");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>

        <div className="rounded-xl border border-line bg-surface p-7">
          <h1 className="font-display text-xl font-semibold text-ink">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tell us which side of the interview you&apos;re on.
          </p>

          {/* Role toggle */}
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-line bg-paper p-1">
            {(["student", "company"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-md py-2 text-sm font-medium transition-colors ${
                  role === r
                    ? "bg-ink text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {r === "student" ? "I'm a candidate" : "I'm hiring"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <Field label="Full name" htmlFor="name">
              <Input
                id="name"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            {role === "company" ? (
              <Field label="Company name" htmlFor="companyName">
                <Input
                  id="companyName"
                  required
                  placeholder="Northwind Systems"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Field>
            ) : (
              <Field label="Branch" htmlFor="branch" hint="e.g. CSE, ECE, IT">
                <Input
                  id="branch"
                  required
                  placeholder="Computer Science"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </Field>
            )}

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

            <Field
              label="Password"
              htmlFor="password"
              hint="At least 6 characters"
            >
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
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
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-teal-dark">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
