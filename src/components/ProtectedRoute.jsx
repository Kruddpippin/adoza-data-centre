import { Navigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui";

export function ProtectedRoute({ children, roles }) {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!role) return <Navigate to="/my-registration" replace />;

  if (roles && role && !roles.includes(role)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold">Access restricted</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your role doesn't have permission to view this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return children;
}
