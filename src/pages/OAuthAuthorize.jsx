import { useEffect, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { ShieldCheck, ShieldX, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState } from "@/components/ui";

function ConsentScreen({ authorizationId, details, onDecision }) {
  const [deciding, setDeciding] = useState(null);
  const scopes = details.scope ? details.scope.split(" ").filter(Boolean) : [];

  const decide = async (approve) => {
    setDeciding(approve ? "approve" : "deny");
    const call = approve
      ? supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
      : supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
    const { data, error } = await call;
    if (error) {
      onDecision(error.message);
      setDeciding(null);
      return;
    }
    window.location.href = data.redirect_url;
  };

  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-col items-center gap-3 text-center">
        {details.client.logo_uri ? (
          <img src={details.client.logo_uri} alt={details.client.name} className="h-12 w-12 rounded-xl object-contain" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight">{details.client.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">wants to access your ADOZA account</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{details.user.email}</span>
        </p>
      </div>

      {scopes.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">This app will be able to</p>
          <ul className="space-y-1.5">
            {scopes.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" /> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <Button type="button" variant="outline" className="flex-1" loading={deciding === "deny"} disabled={!!deciding} onClick={() => decide(false)}>
          <ShieldX className="h-4 w-4" /> Deny
        </Button>
        <Button type="button" className="flex-1" loading={deciding === "approve"} disabled={!!deciding} onClick={() => decide(true)}>
          <ShieldCheck className="h-4 w-4" /> Allow
        </Button>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Redirects to {details.redirect_uri}
      </p>
    </Card>
  );
}

export default function OAuthAuthorize() {
  const { session, loading: authLoading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const authorizationId = searchParams.get("authorization_id");

  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !session || !authorizationId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    supabase.auth.oauth.getAuthorizationDetails(authorizationId).then(({ data, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if ("redirect_url" in data) {
        window.location.href = data.redirect_url;
        return;
      }
      setDetails(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, session, authorizationId]);

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;

  if (!authorizationId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState message="Missing authorization request. Please restart the sign-in from the requesting app." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src="/kogi-logo.png"
            alt="Kogi State Government"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover shadow-lg"
          />
          <h1 className="font-display text-xl font-bold tracking-tight">ADOZA Data Centre</h1>
        </div>

        {loading ? (
          <Card className="p-8"><Spinner /></Card>
        ) : error ? (
          <Card className="p-6"><ErrorState message={error} /></Card>
        ) : details ? (
          <ConsentScreen authorizationId={authorizationId} details={details} onDecision={setError} />
        ) : null}
      </div>
    </div>
  );
}
