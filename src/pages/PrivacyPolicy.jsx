import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function PrivacyPolicy() {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      subtitle="How the ADOZA Data Centre collects, uses and protects your information."
    >
      <section>
        <h2 className="font-display text-lg font-semibold">1. Who this applies to</h2>
        <p className="mt-2">
          This policy covers everyone who uses the ADOZA Data Centre: candidates applying to or benefiting from
          the SYB Door-to-Door Candidate Empowerment Programme, and programme staff (field agents, enumerators,
          validators, the Benefits Committee and administrators) who operate it.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">2. Information we collect</h2>
        <p className="mt-2 font-medium text-foreground">From candidates:</p>
        <ul className="mt-2 space-y-1.5">
          <li>Identity details — name, date of birth, gender, phone number, email, means of identification</li>
          <li>Location — home address, ward, LGA, and GPS coordinates captured during registration</li>
          <li>Skills, education and employment information, and needs-assessment responses</li>
          <li>Banking details, submitted by the candidate, used solely for grant disbursement</li>
          <li>A photo, used to verify identity and reduce duplicate or fraudulent registrations</li>
        </ul>
        <p className="mt-3 font-medium text-foreground">From staff:</p>
        <ul className="mt-2 space-y-1.5">
          <li>Name, email address and assigned role</li>
          <li>Activity within the platform (registrations processed, verification and approval decisions), which is logged for audit purposes</li>
          <li>For field-based staff, GPS location and a photo captured at the point of a candidate registration, to verify field visits actually took place</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">3. How we use it</h2>
        <ul className="mt-2 space-y-1.5">
          <li>To process registrations through verification, beneficiary approval, and disbursement of funding, equipment or training</li>
          <li>To contact candidates about the status of their application or benefits</li>
          <li>To detect duplicate registrations and prevent fraud</li>
          <li>To maintain an audit trail of staff decisions, for programme accountability and oversight</li>
          <li>To produce anonymised, aggregate statistics about programme reach and outcomes</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">4. Who can see your information</h2>
        <p className="mt-2">
          Candidate information is visible only to programme staff whose role requires it to do their job —
          for example, a validator sees registrations pending verification, and the Benefits Committee sees
          approved beneficiaries and funding records. Access is enforced at the database level and every
          change is recorded in an audit log. Your information is never sold, and is not shared outside the
          programme except where required by law or to deliver the benefits you applied for (e.g. disbursing
          a grant to your bank account).
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">5. How long we keep it</h2>
        <p className="mt-2">
          Programme records are retained for as long as needed to administer the programme and meet the Kogi
          State Government's accountability and audit obligations. Candidates may request that their
          registration be reviewed or corrected by contacting the programme.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">6. Your responsibilities</h2>
        <p className="mt-2">
          Please provide accurate information, and keep your banking and contact details up to date so that
          approvals and disbursements aren't delayed. Do not share your sign-in credentials with anyone else.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">7. Changes to this policy</h2>
        <p className="mt-2">
          This policy may be updated as the programme evolves. Material changes will be reflected here with an
          updated date.
        </p>
      </section>
    </StaticPageLayout>
  );
}
