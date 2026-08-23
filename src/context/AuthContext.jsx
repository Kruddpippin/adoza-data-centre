import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

// Security requirement: any signed-in user is force-logged-out after 10 minutes
// of no interaction, regardless of Supabase's own token auto-refresh.
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "wheel"];
const ACTIVITY_THROTTLE_MS = 1000;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Separate from `loading` (initial bootstrap only) — tracks profile fetches that happen
  // later too, e.g. right after a fresh sign-in, so callers can wait for `profile` to be
  // trustworthy before deciding "is this a staff account or a candidate" for redirects.
  const [profileLoading, setProfileLoading] = useState(false);
  // Only ever meaningful for signup_method === "password" accounts (see
  // needsEmailVerification below) — true while unchecked/not-applicable.
  const [emailVerified, setEmailVerified] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    const fetchProfile = () => supabase.from("profiles").select("*").eq("id", userId).single();
    let { data, error } = await fetchProfile();
    // PGRST116 ("no rows") from .single() is the expected, genuine signal that this
    // account has no profile — every candidate account, by design. Any OTHER error
    // (a transient network blip, a slow connection, a momentary 5xx) must not be read
    // the same way: doing so was silently mislabeling real staff accounts as "not
    // staff" right after a successful login, which Login.jsx's portal-mismatch check
    // then treated as reason enough to force a sign-out. One retry turns "any single
    // hiccup logs a staff member out" into "needs two in a row", without changing
    // anything for the ordinary no-profile-at-all case.
    if (error && error.code !== "PGRST116") {
      ({ data, error } = await fetchProfile());
    }
    setProfile(error && error.code !== "PGRST116" ? null : data ?? null);
    setProfileLoading(false);
  }, []);

  // Only accounts created through the password signup form ever need this. Checking
  // user.app_metadata.provider === "email" here would be wrong and was tried first —
  // empirically, Supabase reports "email" as the provider for magic-link (OTP) accounts
  // too, not just password ones (confirmed live: existing magic-link candidates/staff
  // all show provider: "email"), so that check would have wrongly gated every magic-link
  // user on their very first load. signup_method is a custom user_metadata flag this
  // app sets itself only in the signUp() call below, so it's unambiguous. Google and
  // magic-link sessions never need gating anyway — no unconfirmed state exists for
  // them — and this project's auth.signUp() calls return a live session immediately
  // (see [[adoza_email_verification_gate]] memory), which also means Supabase's own
  // email_confirmed_at gets stamped right away and can't be used as the gate — hence
  // the separate email_verifications table this checks instead.
  const loadEmailVerification = useCallback(async (user) => {
    if (!user || user.user_metadata?.signup_method !== "password") {
      setEmailVerified(true);
      return;
    }
    const { data } = await supabase
      .from("email_verifications")
      .select("verified_at")
      .eq("user_id", user.id)
      .maybeSingle();
    setEmailVerified(!!data?.verified_at);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        setSession(data.session);
        await Promise.all([loadProfile(data.session?.user?.id), loadEmailVerification(data.session?.user)]);
      })
      .finally(() => active && setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, next) => {
      // A null session on anything other than a genuine SIGNED_OUT is a transient
      // event, not a real logout (e.g. an intermediate auth-state notification firing
      // before an OAuth redirect's session has fully landed) — trusting it blindly
      // flickered a just-completed sign-in back to signed-out. Only SIGNED_OUT (an
      // explicit signOut() call, or Supabase's own idle/refresh-failure handling)
      // should ever actually clear the session here.
      if (!next && event !== "SIGNED_OUT") return;
      setSession(next);
      await Promise.all([loadProfile(next?.user?.id), loadEmailVerification(next?.user)]);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, loadEmailVerification]);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password, signupSource) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { signup_source: signupSource, signup_method: "password" } },
    });
  const signOut = () => supabase.auth.signOut();
  const refreshEmailVerification = () => loadEmailVerification(session?.user);

  // Force sign-out after 10 minutes of no mouse/keyboard/touch activity, independent
  // of Supabase's own silent token refresh (which would otherwise keep an unattended
  // session alive indefinitely).
  const idleTimerRef = useRef(null);
  useEffect(() => {
    if (!session) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    let lastReset = 0;
    const resetTimer = () => {
      const now = Date.now();
      if (now - lastReset < ACTIVITY_THROTTLE_MS) return;
      lastReset = now;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        supabase.auth.signOut();
      }, IDLE_TIMEOUT_MS);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [session]);

  const user = session?.user ?? null;
  const needsEmailVerification = !!user && user.user_metadata?.signup_method === "password" && !emailVerified;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        profileLoading,
        needsEmailVerification,
        signIn,
        signUp,
        signOut,
        refreshEmailVerification,
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
