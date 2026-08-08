"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

interface DashboardSidebarProps {
  role: UserRole;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}

const companyLinks = [
  {
    label: "Overview",
    href: "/dashboard/company",
    icon: LayoutDashboard,
  },
  {
    label: "Drives",
    href: "/dashboard/company/drives",
    icon: BriefcaseBusiness,
  },
  {
    label: "Candidates",
    href: "/dashboard/company/candidates",
    icon: Users,
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

const studentLinks = [
  {
    label: "Overview",
    href: "/dashboard/student",
    icon: LayoutDashboard,
  },
  {
    label: "Applications",
    href: "/dashboard/student/applications",
    icon: BriefcaseBusiness,
  },
  {
    label: "Interviews",
    href: "/dashboard/student/interviews",
    icon: Video,
  },
  {
    label: "Feedback",
    href: "/dashboard/student/feedback",
    icon: FileText,
  },
  {
    label: "Profile",
    href: "/dashboard/student/profile",
    icon: UserRound,
  },
];

export function DashboardSidebar({
  role,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const links =
    role === "company"
      ? companyLinks
      : studentLinks;

  async function handleSignOut() {
    await signOut();
    setMobileOpen(false);
  }

  function isActive(href: string) {
    if (href === `/dashboard/${role}`) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ------------------------------------------------ */}
      {/* Mobile overlay                                   */}
      {/* ------------------------------------------------ */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ------------------------------------------------ */}
      {/* Sidebar                                          */}
      {/* ------------------------------------------------ */}

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 72 : 248,
        }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r border-line
          bg-surface
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ------------------------------------------------ */}
        {/* Header                                          */}
        {/* ------------------------------------------------ */}

        <div className="flex h-16 shrink-0 items-center border-b border-line px-3">
          <Link
            href={
              role === "company"
                ? "/dashboard/company"
                : "/dashboard/student"
            }
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white">
              H
            </span>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{
                    opacity: 0,
                    x: -8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -8,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                  className="font-display text-base font-semibold text-ink"
                >
                  HireLoop
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Desktop collapse */}

          <button
            type="button"
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            onClick={() =>
              setCollapsed(!collapsed)
            }
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-paper hover:text-ink lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Mobile close */}

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-paper hover:text-ink lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ------------------------------------------------ */}
        {/* Workspace                                      */}
        {/* ------------------------------------------------ */}

        <div className="border-b border-line px-3 py-4">
          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.div
                key="expanded-workspace"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="px-2"
              >
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted">
                  {role === "company"
                    ? "Company workspace"
                    : "Candidate workspace"}
                </p>

                <p className="mt-1 truncate text-xs font-medium text-ink">
                  {role === "company"
                    ? user?.name || "Company"
                    : user?.name || "Candidate"}
                </p>
              </motion.div>
            ) : (
              <div className="flex justify-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-light text-xs font-semibold text-teal-dark">
                  {user?.name?.charAt(0).toUpperCase() ||
                    "U"}
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------ */}
        {/* Navigation                                      */}
        {/* ------------------------------------------------ */}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  title={
                    collapsed
                      ? link.label
                      : undefined
                  }
                  className={`group relative flex h-10 items-center rounded-lg text-sm transition-colors ${
                    collapsed
                      ? "justify-center px-0"
                      : "gap-3 px-3"
                  } ${
                    active
                      ? "bg-teal-light text-teal-dark"
                      : "text-muted hover:bg-paper hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={`sidebar-active-${role}`}
                      className="absolute left-0 top-2 h-6 w-0.5 rounded-full bg-teal"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}

                  <Icon
                    className={`h-[17px] w-[17px] shrink-0 ${
                      active
                        ? "text-teal-dark"
                        : "text-muted group-hover:text-ink"
                    }`}
                  />

                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{
                          opacity: 0,
                          x: -5,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: -5,
                        }}
                        transition={{
                          duration: 0.16,
                        }}
                        className="truncate"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>

          {/* Divider */}

          <div className="my-4 border-t border-line" />

          {/* Settings */}

          <Link
            href={
              role === "company"
                ? "/dashboard/company/settings"
                : "/dashboard/student/settings"
            }
            onClick={() => setMobileOpen(false)}
            title={collapsed ? "Settings" : undefined}
            className={`flex h-10 items-center rounded-lg text-sm text-muted transition-colors hover:bg-paper hover:text-ink ${
              collapsed
                ? "justify-center px-0"
                : "gap-3 px-3"
            }`}
          >
            <Settings className="h-[17px] w-[17px] shrink-0" />

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{
                    opacity: 0,
                    x: -5,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -5,
                  }}
                  transition={{
                    duration: 0.16,
                  }}
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </nav>

        {/* ------------------------------------------------ */}
        {/* User / sign out                                */}
        {/* ------------------------------------------------ */}

        <div className="border-t border-line p-3">
          <div
            className={`flex items-center ${
              collapsed
                ? "justify-center"
                : "gap-3"
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-xs font-semibold text-ink">
              {user?.name?.charAt(0).toUpperCase() ||
                "U"}
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{
                    opacity: 0,
                    width: 0,
                  }}
                  animate={{
                    opacity: 1,
                    width: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    width: 0,
                  }}
                  className="min-w-0 flex-1 overflow-hidden"
                >
                  <p className="truncate text-xs font-medium text-ink">
                    {user?.name || "User"}
                  </p>

                  <p className="truncate text-[10px] text-muted">
                    {user?.email || ""}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!collapsed && (
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-signal-light hover:text-signal"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}