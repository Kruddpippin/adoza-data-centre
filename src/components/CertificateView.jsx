import { Award, Printer } from "lucide-react";
import { Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export function CertificateView({ youthName, courseTitle, certificateNumber, issuedAt }) {
  return (
    <div className="space-y-4">
      <div className="certificate-print-area rounded-2xl border-2 border-accent/40 bg-card p-6 text-center sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
          <Award className="h-6 w-6 text-accent-foreground" aria-hidden />
        </div>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Adoza Data Centre — Tech Hub
        </p>
        <h2 className="font-display mt-1 text-lg font-bold tracking-tight sm:text-xl">Certificate of Completion</h2>
        <p className="mt-5 text-xs text-muted-foreground">This is to certify that</p>
        <p className="font-display mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">{youthName}</p>
        <p className="mt-3 text-sm text-muted-foreground">has successfully completed the training</p>
        <p className="font-display mt-1 text-base font-bold tracking-tight sm:text-lg">{courseTitle}</p>
        <div className="mx-auto mt-6 flex max-w-xs items-center justify-between border-t pt-3 text-[11px] text-muted-foreground">
          <span>Issued {formatDate(issuedAt)}</span>
          <span className="font-mono">{certificateNumber}</span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print / save as PDF
      </Button>
    </div>
  );
}
