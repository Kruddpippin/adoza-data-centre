import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, Spinner } from "@/components/ui";

const RETURN_TO_KEY = "adoza-verify-return-to";

// Landing point for the magic-link email EmailVerificationGate sends. detectSessionInUrl
// (see src/lib/supabase.js) has already turned the URL's #access_token fragment into a
// live OTP-authenticated session by the time this mounts — mark_email_verified() checks
// that server-side (via the session's amr claim) before recording anything, so this page
// itself doesn't need to prove ownership again, just call the RPC and bounce back.
export default function VerifyEmail() {
  const { session, loading: authLoading, refreshEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | done | error
  const [errorMessage, setErrorMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (authLoading || !session || ran.current) return;
    ran.current = true;
    (async () => {
      const { error } = await supabase.rpc("mark_email_verified");
      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }
      await refreshEmailVerification();
      setStatus("done");
      const returnTo = sessionStorage.getItem(RETURN_TO_KEY) || "/";
      sessionStorage.removeItem(RETURN_TO_KEY);
      setTimeout(() => navigate(returnTo, { replace: true }), 1200);
    })();
  }, [authLoading, session, navigate, refreshEmailVerification]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary/[0.04] p-4">
      <Card className="w-full max-w-sm p-6 text-center animate-fade-up">
        {authLoading || status === "verifying" ? (
          <>
            <Spinner className="mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">Confirming your email…</p>
          </>
        ) : status === "done" ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            </div>
            <h1 className="font-display mt-3 text-lg font-bold tracking-tight">Email confirmed</h1>
            <p className="mt-1 text-sm text-muted-foreground">Taking you back…</p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-700" />
            </div>
            <h1 className="font-display mt-3 text-lg font-bold tracking-tight">Couldn't confirm your email</h1>
            <p className="mt-1 text-sm text-muted-foreground">{errorMessage || "Something went wrong — try sending the link again."}</p>
          </>
        )}
      </Card>
    </div>
  );
}
