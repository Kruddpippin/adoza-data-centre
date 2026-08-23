import { useState } from "react";
import { MailCheck, Send, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

// sessionStorage, not a route param — read by VerifyEmail.jsx once the magic-link
// round trip lands back in the app, so it knows where to send the user afterward.
const RETURN_TO_KEY = "adoza-verify-return-to";

// Mandatory blocking card shown in place of a registration form for any email+password
// account that hasn't proven mailbox ownership yet. Verification works by sending a real
// Supabase magic-link email to the user's own address — clicking it re-authenticates them
// via OTP, and mark_email_verified() (called from VerifyEmail.jsx on landing) checks
// server-side that the current session's auth method really was "otp" before recording
// it, so this can't be self-granted by an unverified user calling the RPC directly.
export function EmailVerificationGate() {
  const { user, signOut, refreshEmailVerification } = useAuth();
  const [sendState, setSendState] = useState("idle"); // idle | sending | sent | error
  const [sendError, setSendError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [stillPending, setStillPending] = useState(false);

  const sendLink = async () => {
    setSendState("sending");
    setSendError("");
    sessionStorage.setItem(RETURN_TO_KEY, window.location.pathname + window.location.search);
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/verify-email` },
    });
    if (error) {
      setSendState("error");
      setSendError(error.message);
      return;
    }
    setSendState("sent");
  };

  const refresh = async () => {
    setRefreshing(true);
    setStillPending(false);
    await refreshEmailVerification();
    setRefreshing(false);
    // If the gate is still mounted after this, verification is (still) not complete.
    setStillPending(true);
  };

  return (
    <Card className="animate-fade-up p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <MailCheck className="h-6 w-6 text-amber-700" />
      </div>
      <h1 className="font-display mt-3 text-lg font-bold tracking-tight">Confirm your email</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Before you can continue, confirm that <span className="font-medium text-foreground">{user?.email}</span> is
        really yours. We'll send a link — open it on this device and you'll be brought right back here.
      </p>

      <div className="mt-4 space-y-2">
        <Button className="w-full" onClick={sendLink} loading={sendState === "sending"}>
          <Send className="h-4 w-4" /> {sendState === "sent" ? "Resend verification link" : "Send verification link"}
        </Button>
        {sendState === "sent" && (
          <p className="text-xs font-medium text-emerald-600">Check your email — the link brings you straight back here.</p>
        )}
        {sendState === "error" && <p className="text-xs font-medium text-destructive">{sendError}</p>}

        <Button variant="outline" className="w-full" onClick={refresh} loading={refreshing}>
          <RefreshCw className="h-4 w-4" /> I've verified — refresh
        </Button>
        {stillPending && (
          <p className="text-xs font-medium text-muted-foreground">Still not confirmed — check your inbox (and spam folder).</p>
        )}
      </div>

      <button
        type="button"
        onClick={signOut}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-3.5 w-3.5" /> Wrong email? Sign out and try again
      </button>
    </Card>
  );
}
