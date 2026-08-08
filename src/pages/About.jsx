import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function About() {
  return (
    <StaticPageLayout
      title="About the ADOZA Programme"
      subtitle="SYB Door-to-Door Candidate Empowerment Programme — Kogi State Government"
    >
      <section>
        <h2 className="font-display text-lg font-semibold">What is ADOZA?</h2>
        <p className="mt-2">
          The ADOZA Data Centre supports the Skill-Up Youth Business (SYB) Door-to-Door Candidate Empowerment
          Programme, a Kogi State Government initiative to identify, verify and support young residents of the
          state with skills training, equipment and start-up funding. The programme reaches candidates directly
          where they live, through field officers who register interested youths door-to-door as well as a
          self-service portal for candidates who prefer to apply themselves.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Who can apply</h2>
        <ul className="mt-2 space-y-1.5">
          <li>Resident of Kogi State, at least 18 years old</li>
          <li>Not currently benefiting from another empowerment scheme</li>
          <li>Holds a valid means of identification</li>
          <li>Willing to participate in training as part of the programme</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">How it works</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
          <li>
            <span className="font-medium text-foreground">Registration</span> — candidates register themselves
            through the portal, or are registered in the field by a programme enumerator.
          </li>
          <li>
            <span className="font-medium text-foreground">Verification</span> — a programme validator reviews
            each registration for accuracy and eligibility.
          </li>
          <li>
            <span className="font-medium text-foreground">Beneficiary approval</span> — the Benefits Committee
            reviews verified candidates and approves eligible beneficiaries.
          </li>
          <li>
            <span className="font-medium text-foreground">Support</span> — approved beneficiaries receive
            training, equipment and/or grant funding, disbursed to the banking details they provide.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Programme staff</h2>
        <p className="mt-2">
          Field agents, enumerators, validators, the Benefits Committee and administrators operate the
          programme day-to-day — registering candidates, verifying submissions, approving beneficiaries and
          managing the disbursement of funding and equipment, with every decision recorded and auditable.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Questions</h2>
        <p className="mt-2">
          Candidates can check their registration status at any time from the portal after signing in. For
          anything else, contact the programme through your local Kogi State Government office.
        </p>
      </section>
    </StaticPageLayout>
  );
}
