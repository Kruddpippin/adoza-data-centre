import { Navigate } from "react-router-dom";
import { Network } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMySupportGroupMembership, useExecutiveStructure } from "@/hooks/useSupportGroup";
import { SupportGroupNav } from "@/components/SupportGroupNav";
import { Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState, EmptyState } from "@/components/ui";
import { LessonContent } from "@/components/LessonContent";

export default function SupportGroupExecutiveStructure() {
  const { session, user, loading: authLoading } = useAuth();
  const {
    data: member, isLoading: memberLoading, isError: memberError, refetch: refetchMember,
  } = useMySupportGroupMembership(user?.id);
  const {
    data: structure, isLoading: structureLoading, isError: structureError, refetch: refetchStructure,
  } = useExecutiveStructure();

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/gyb2syb" replace />;
  // Not (yet) an approved member — send them back to see their registration status.
  if (!memberLoading && !memberError && !member) return <Navigate to="/gyb2syb" replace />;

  const isLoading = memberLoading || structureLoading;
  const isError = memberError || structureError;
  const hasContent = !!structure?.content && structure.content.trim() !== "";

  return (
    <div className="mx-auto min-h-screen max-w-2xl p-4 lg:p-8">
      <SupportGroupNav member={member} />
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={() => { refetchMember(); refetchStructure(); }} />
      ) : (
        <Card>
          <CardHeader><CardTitle>GYB2SYB DOOR2DOOR Executive Structure</CardTitle></CardHeader>
          <CardContent>
            {hasContent ? (
              <LessonContent text={structure.content} />
            ) : (
              <EmptyState
                icon={Network}
                title="Not published yet"
                message="Executive structure will be published here soon."
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
