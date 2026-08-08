"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  const dashboardHref =
    user?.role === "company" ? "/dashboard/company" : "/dashboard/student";

  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={user ? dashboardHref : "/"}>
          <Logo />
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink leading-tight">
                {user.name}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted leading-tight">
                {user.role === "company" ? user.companyName : user.branch}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-ink hover:text-ink"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Log in
            </Link>
            <Link href="/signup">
              <Button variant="primary" className="!px-4 !py-2">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
