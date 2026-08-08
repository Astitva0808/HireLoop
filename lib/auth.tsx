"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * MOCK AUTH LAYER
 * ─────────────────────────────────────────────────────────────────────────
 * This is a placeholder so the frontend has something real to run against
 * while the backend is being planned. It persists a fake "session" to
 * localStorage — nothing is sent over the network, nothing is secure.
 *
 * When Supabase is wired up, replace the three functions below
 * (signUp / signIn / signOut) with calls to `supabase.auth.*`, and swap
 * the localStorage read in the initial useEffect for
 * `supabase.auth.getSession()` + `onAuthStateChange`. Every component that
 * calls `useAuth()` will keep working unchanged.
 * ─────────────────────────────────────────────────────────────────────────
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User, UserRole } from "./types";

const STORAGE_KEY = "hireloop_mock_session";

interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
  branch?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUsers(): Record<string, User & { password: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("hireloop_mock_users");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStoredUsers(users: Record<string, User & { password: string }>) {
  window.localStorage.setItem("hireloop_mock_users", JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reading localStorage must happen client-side only (SSR has no
    // window), so this genuinely can't be lazy initial state — it has to
    // run after mount.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore corrupted session
    }
    setLoading(false);
  }, []);

  async function signUp(input: SignUpInput) {
    const users = readStoredUsers();
    if (users[input.email]) {
      return { error: "An account with this email already exists." };
    }
    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      role: input.role,
      companyName: input.companyName,
      branch: input.branch,
      password: input.password,
    };
    users[input.email] = newUser;
    writeStoredUsers(users);

    const { password: _password, ...publicUser } = newUser;
    void _password;
    setUser(publicUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(publicUser));
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const users = readStoredUsers();
    const match = users[email];
    if (!match || match.password !== password) {
      return { error: "Incorrect email or password." };
    }
    const { password: _password, ...publicUser } = match;
    void _password;
    setUser(publicUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(publicUser));
    return { error: null };
  }

  function signOut() {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
