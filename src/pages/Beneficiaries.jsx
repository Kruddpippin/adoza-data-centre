import { Link } from "react-router-dom";
import { Award, Download } from "lucide-react";
import { useYouths } from "@/hooks/useData";
import { Button, Badge, Spinner, ErrorState, EmptyState, Table, Th, Td } from "@/components/ui";
import { formatDate, ageFrom, EMPLOYMENT_LABELS, exportCsv } from "@/lib/utils";

export default function Beneficiaries() {
  const { data: youths, isLoading, isError, refetch } = useYouths({ beneficiary: true });

  const handleExport = () =>
    exportCsv(
      "adoza-beneficiaries.csv",
      (youths ?? []).map((y) => ({
        name: `${y.first_name} ${y.last_name}`,
        age: ageFrom(y.date_of_birth),
        phone: y.phone,
        ward: y.ward,
        lga: y.lga,
        employment: EMPLOYMENT_LABELS[y.employment_status],
        score: y.eligibility_score,
        approved: formatDate(y.beneficiary_approved_at),
      }))
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Beneficiaries</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Candidates approved by the empowerment committee.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!youths?.length}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !youths?.length ? (
        <EmptyState icon={Award} title="No beneficiaries yet" message="Verified candidates can be approved from their profile page." />
      ) : (
        <Table className="animate-fade-up">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Age</Th>
              <Th>Ward / LGA</Th>
              <Th>Employment</Th>
              <Th>Score</Th>
              <Th>Approved</Th>
            </tr>
          </thead>
          <tbody>
            {youths.map((y) => (
              <tr key={y.id} className="transition-colors hover:bg-muted/40">
                <Td>
                  <Link to={`/youths/${y.id}`} className="font-medium text-primary hover:underline">
                    {y.first_name} {y.last_name}
                  </Link>
                </Td>
                <Td className="tabular">{ageFrom(y.date_of_birth)}</Td>
                <Td>
                  <span className="block text-sm">{y.ward}</span>
                  <span className="text-xs text-muted-foreground">{y.lga}</span>
                </Td>
                <Td>{EMPLOYMENT_LABELS[y.employment_status]}</Td>
                <Td>
                  <Badge className="bg-primary/10 text-primary tabular">{y.eligibility_score ?? "—"}</Badge>
                </Td>
                <Td className="text-xs text-muted-foreground">{formatDate(y.beneficiary_approved_at)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
