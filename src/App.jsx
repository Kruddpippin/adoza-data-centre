import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Spinner } from "@/components/ui";
import { ADMIN_ROLES } from "@/lib/utils";

const Login = lazy(() => import("@/pages/Login"));
const YouthPortal = lazy(() => import("@/pages/YouthPortal"));
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
const Audit = lazy(() => import("@/pages/Audit"));

export default function App() {
  return (
    <Suspense fallback={<Spinner className="min-h-screen" />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/my-registration" element={<YouthPortal />} />
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
              <ProtectedRoute roles={[...ADMIN_ROLES, "verifier", "committee"]}>
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
            path="/audit"
            element={
              <ProtectedRoute roles={ADMIN_ROLES}>
                <Audit />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
