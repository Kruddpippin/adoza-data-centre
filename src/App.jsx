import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_ROLES } from "@/lib/utils";

// A truly unmatched URL (typo, stale bookmark) should land wherever this specific
// visitor actually belongs, not unconditionally on the staff dashboard — a candidate
// (or a signed-out visitor) hitting this fallback was landing on a page they'd
// immediately get bounced out of again by ProtectedRoute.
function NotFoundRedirect() {
  const { session, profile, loading } = useAuth();
  if (loading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/" replace />;
  return <Navigate to={profile ? "/dashboard" : "/my-registration"} replace />;
}

const Landing = lazy(() => import("@/pages/Landing"));
const About = lazy(() => import("@/pages/About"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfConditions = lazy(() => import("@/pages/TermsOfConditions"));
const Login = lazy(() => import("@/pages/Login"));
const YouthPortal = lazy(() => import("@/pages/YouthPortal"));
const StaffApplication = lazy(() => import("@/pages/StaffApplication"));
const OAuthAuthorize = lazy(() => import("@/pages/OAuthAuthorize"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Youths = lazy(() => import("@/pages/Youths"));
const YouthForm = lazy(() => import("@/pages/YouthForm"));
const YouthDetail = lazy(() => import("@/pages/YouthDetail"));
const Beneficiaries = lazy(() => import("@/pages/Beneficiaries"));
const Equipment = lazy(() => import("@/pages/Equipment"));
const Funding = lazy(() => import("@/pages/Funding"));
const Surveys = lazy(() => import("@/pages/Surveys"));
const FieldMap = lazy(() => import("@/pages/FieldMap"));
const Team = lazy(() => import("@/pages/Team"));
const Broadcast = lazy(() => import("@/pages/Broadcast"));
const Audit = lazy(() => import("@/pages/Audit"));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-conditions" element={<TermsOfConditions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-registration" element={<YouthPortal />} />
          <Route path="/staff-application" element={<StaffApplication />} />
          <Route path="/oauth/authorize" element={<OAuthAuthorize />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/youths" element={<Youths />} />
            <Route path="/youths/new" element={<YouthForm />} />
            <Route path="/youths/:id" element={<YouthDetail />} />
            <Route path="/youths/:id/edit" element={<YouthForm />} />
            <Route path="/map" element={<FieldMap />} />
            <Route
              path="/beneficiaries"
              element={
                <ProtectedRoute roles={[...ADMIN_ROLES, "validator", "committee"]}>
                  <Beneficiaries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipment"
              element={
                <ProtectedRoute roles={[...ADMIN_ROLES, "committee"]}>
                  <Equipment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funding"
              element={
                <ProtectedRoute roles={[...ADMIN_ROLES, "committee"]}>
                  <Funding />
                </ProtectedRoute>
              }
            />
            <Route path="/surveys" element={<Surveys />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={ADMIN_ROLES}>
                  <Team />
                </ProtectedRoute>
              }
            />
            <Route
              path="/broadcast"
              element={
                <ProtectedRoute roles={ADMIN_ROLES}>
                  <Broadcast />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute roles={ADMIN_ROLES}>
                  <Audit />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
