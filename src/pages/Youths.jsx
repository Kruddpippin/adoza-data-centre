import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users, Download } from "lucide-react";
import { useYouths } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Select, Badge, Spinner, ErrorState, EmptyState, Table, Th, Td } from "@/components/ui";
import { VERIFICATION_META, EMPLOYMENT_LABELS, KOGI_LGAS, ageFrom, formatDate, exportCsv, isAdminRole } from "@/lib/utils";

export default function Youths() {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [lga, setLga] = useState("");
  const { data: youths, isLoading, isError, refetch } = useYouths({ search: search || undefined, status: status || undefined, lga: lga || undefined });

  const canRegister = isAdminRole(role) || role === "enumerator" || role === "field_agent";

  const handleExport = () =>
    exportCsv(
      "adoza-candidates.csv",
      (youths ?? []).map((y) => ({
        first_name: y.first_name,
        last_name: y.last_name,
        gender: y.gender,
        age: ageFrom(y.date_of_birth),
        phone: y.phone,
        ward: y.ward,
        lga: y.lga,
        employment: EMPLOYMENT_LABELS[y.employment_status],
        verification: y.verification_status,
        eligibility_score: y.eligibility_score,
        beneficiary: y.is_approved_beneficiary ? "yes" : "no",
        registered: formatDate(y.created_at),
      }))
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Candidates</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Door-to-door registrations across all wards.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!youths?.length}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          {canRegister && (
            <Link to="/youths/new">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Register candidate
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 animate-fade-up">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search candidates"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(VERIFICATION_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <Select value={lga} onChange={(e) => setLga(e.target.value)} className="w-44" aria-label="Filter by LGA">
          <option value="">All LGAs</option>
          {KOGI_LGAS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !youths?.length ? (
        <EmptyState icon={Users} title="No candidates found" message="Adjust your filters, or register the first candidate." />
      ) : (
        <Table className="animate-fade-up">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Age</Th>
              <Th>Ward / LGA</Th>
              <Th>Employment</Th>
              <Th>Score</Th>
              <Th>Status</Th>
              <Th>Registered</Th>
            </tr>
          </thead>
          <tbody>
            {youths.map((y) => (
              <tr key={y.id} className="transition-colors hover:bg-muted/40">
                <Td>
                  <Link to={`/youths/${y.id}`} className="font-medium text-primary hover:underline">
                    {y.first_name} {y.last_name}
                  </Link>
                  {y.is_approved_beneficiary && (
                    <Badge className="ml-2 bg-accent/15 text-accent-foreground">Beneficiary</Badge>
                  )}
                </Td>
                <Td className="tabular">{ageFrom(y.date_of_birth)}</Td>
                <Td>
                  <span className="block text-sm">{y.ward}</span>
                  <span className="text-xs text-muted-foreground">{y.lga}</span>
                </Td>
                <Td>{EMPLOYMENT_LABELS[y.employment_status]}</Td>
                <Td className="tabular font-semibold">{y.eligibility_score ?? "—"}</Td>
                <Td>
                  <Badge className={VERIFICATION_META[y.verification_status]?.cls}>
                    {VERIFICATION_META[y.verification_status]?.label}
                  </Badge>
                </Td>
                <Td className="text-xs text-muted-foreground">{formatDate(y.created_at)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
