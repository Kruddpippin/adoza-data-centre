import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/utils";

type Profile = { id: string; name: string; email: string; role: Role; status: string };

type AuthContextValue = {
  session: Session | null;
  user: Session["user"] | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  profileError: string | null;
  // No `profiles` row and no `youths` record either — a signed-in user this app has
  // never seen before, most likely a new staff sign-up that needs to apply.
  needsStaffApplication: boolean;
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signOut: () => ReturnType<typeof supabase.auth.signOut>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [needsStaffApplication, setNeedsStaffApplication] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId?: string) => {
    if (!userId) {
      setProfile(null);
      setProfileError(null);
      setNeedsStaffApplication(false);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!error) {
      setProfile(data as Profile);
      setProfileError(null);
      setNeedsStaffApplication(false);
      return;
    }
    if (error.code !== "PGRST116") {
      // Real failure (network, RLS, etc.) — not simply "no profiles row yet".
      console.error("Failed to load profile", error);
      setProfile(null);
      setProfileError(error.message);
      setNeedsStaffApplication(false);
      return;
    }

    // No `profiles` row. Candidates never get one either (by design), so this alone
    // doesn't tell us who's signing in — check for a `youths` record to tell a
    // candidate apart from a brand-new staff applicant.
    setProfile(null);
    const { data: youthRow, error: youthErr } = await supabase.from("youths").select("id").limit(1).maybeSingle();
    if (youthErr) console.error("Failed to check candidate record", youthErr);
    if (youthRow) {
      setProfileError("This app is for ADOZA staff only. Candidates should use the ADOZA website to check their registration.");
      setNeedsStaffApplication(false);
    } else {
      setProfileError(null);
      setNeedsStaffApplication(true);
    }
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        setSession(data.session);
        await loadProfile(data.session?.user?.id);
      })
      .finally(() => active && setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next);
      await loadProfile(next?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        role: profile?.role ?? null,
        loading,
        profileError,
        needsStaffApplication,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
