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
  profileErrorCode: string | null;
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signOut: () => ReturnType<typeof supabase.auth.signOut>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileErrorCode, setProfileErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId?: string) => {
    if (!userId) {
      setProfile(null);
      setProfileError(null);
      setProfileErrorCode(null);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) {
      console.error("Failed to load profile", error);
      setProfile(null);
      // PGRST116 = no row found — candidates never get a `profiles` row, so this
      // means a candidate/beneficiary email tried to sign in to this staff-only app.
      setProfileError(
        error.code === "PGRST116"
          ? "This app is for ADOZA staff only. Candidates should use the ADOZA website to check their registration."
          : error.message
      );
      setProfileErrorCode(error.code ?? null);
      return;
    }
    setProfile(data as Profile);
    setProfileError(null);
    setProfileErrorCode(null);
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
        profileErrorCode,
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
