"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Input";
import { useAuth } from "@/lib/auth";

const ease = [0.22, 1, 0.36, 1] as const;

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

    if (error) {
      setSubmitting(false);
      setError(error);
      return;
    }

    /*
     * signIn stores the authenticated session in localStorage.
     * We use the stored session here to determine the correct
     * dashboard immediately after login.
     */
    const session = JSON.parse(
      localStorage.getItem("hireloop_mock_session") || "{}"
    );

    const destination =
      session.role === "company"
        ? "/dashboard/company"
        : "/dashboard/student";

    router.push(destination);
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">
      {/* ------------------------------------------------ */}
      {/* Background atmosphere                            */}
      {/* ------------------------------------------------ */}

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-180px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-teal-light/25 blur-3xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ------------------------------------------------ */}
      {/* Main                                          */}
      {/* ------------------------------------------------ */}

      <div className="relative mx-auto flex max-w-md flex-col px-6 pb-16 pt-14 sm:pt-20">
        {/* Logo */}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease,
          }}
          className="mb-8 flex justify-center"
        >
          <Link
            href="/"
            className="transition-opacity hover:opacity-75"
          >
            <Logo />
          </Link>
        </motion.div>

        {/* Card */}

        <motion.div
          initial={{
            opacity: 0,
            y: 22,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.65,
            ease,
          }}
          className="rounded-xl border border-line bg-surface p-7 shadow-[0_4px_28px_-12px_rgba(22,33,62,0.14)] sm:p-8"
        >
          {/* Heading */}

          <div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.5,
                ease,
              }}
              className="mb-4 flex items-center gap-2 text-xs font-medium text-teal-dark"
            >
              <LockKeyhole className="h-3.5 w-3.5" />
              Secure sign in
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                ease,
              }}
              className="font-display text-xl font-semibold text-ink"
            >
              Log in
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.28,
                duration: 0.5,
                ease,
              }}
              className="mt-1 text-sm text-muted"
            >
              Welcome back — pick up where you left off.
            </motion.p>
          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.35,
                duration: 0.5,
                ease,
              }}
            >
              <Field label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                />
              </Field>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.42,
                duration: 0.5,
                ease,
              }}
            >
              <Field
                label="Password"
                htmlFor="password"
              >
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                />
              </Field>
            </motion.div>

            {/* Error */}

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -5,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="overflow-hidden rounded-md bg-signal-light px-3 py-2 text-sm text-signal"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.5,
                ease,
              }}
              className="mt-2"
            >
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={submitting}
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                >
                  {submitting ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging in…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="login"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Log in
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Signup */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.7,
            duration: 0.5,
          }}
          className="mt-6 text-center text-sm text-muted"
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="group inline-flex items-center gap-1 font-medium text-teal-dark"
          >
            Sign up
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.p>

        {/* Already signed in */}

        <AnimatePresence>
          {user && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 10,
              }}
              transition={{
                duration: 0.4,
                ease,
              }}
              className="mt-4 rounded-lg border border-line bg-surface px-4 py-3"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />

                <p className="text-xs leading-relaxed text-muted">
                  Signed in as{" "}
                  <span className="font-medium text-ink">
                    {user.email}
                  </span>
                  {" — "}

                  <Link
                    href={
                      user.role === "company"
                        ? "/dashboard/company"
                        : "/dashboard/student"
                    }
                    className="font-medium text-teal-dark hover:underline"
                  >
                    go to dashboard
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}