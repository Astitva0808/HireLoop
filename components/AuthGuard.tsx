"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children: ReactNode;
  role?: UserRole;
}

export function AuthGuard({
  children,
  role,
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until Supabase authentication has finished resolving.
    if (loading) {
      return;
    }

    // No authenticated user.
    if (!user) {
      router.replace("/login");
      return;
    }

    // Authenticated user opened a dashboard
    // belonging to a different role.
    if (role && user.role !== role) {
      router.replace(
        user.role === "company"
          ? "/dashboard/company"
          : "/dashboard/student"
      );
    }
  }, [
    user,
    loading,
    role,
    router,
  ]);

  // --------------------------------------------------
  // AUTH IS STILL LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">
          Loading...
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // NO USER
  // --------------------------------------------------

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">
          Redirecting to login...
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // AUTHENTICATED USER
  // --------------------------------------------------
  //
  // The redirect for a wrong role is handled by
  // useEffect above.
  //
  // We intentionally render the children here instead
  // of displaying "Redirecting to your dashboard..."
  // because auth state can briefly settle between
  // renders.
  //
  // --------------------------------------------------

  return <>{children}</>;
}