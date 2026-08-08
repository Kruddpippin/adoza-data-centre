import { Link } from "react-router-dom";
import { StaticPageLayout } from "@/components/StaticPageLayout";

export default function TermsOfConditions() {
  return (
    <StaticPageLayout
      title="Terms of Conditions"
      subtitle="The rules for using the ADOZA Data Centre, for candidates and staff alike."
    >
      <section>
        <h2 className="font-display text-lg font-semibold">1. Acceptance</h2>
        <p className="mt-2">
          By registering, signing in, or otherwise using the ADOZA Data Centre, you agree to these terms. If
          you do not agree, do not use the platform.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">2. Terms for candidates</h2>
        <ul className="mt-2 space-y-1.5">
          <li>You must meet the programme's eligibility requirements (see the About page) to apply.</li>
          <li>Information you submit — identity, contact, location, skills, banking and delivery details — must be true and accurate. Knowingly submitting false information may result in disqualification.</li>
          <li>Registering more than once, or attempting to claim benefits under more than one identity, is not permitted and may result in disqualification and referral to the appropriate authorities.</li>
          <li>Your registration is reviewed by programme staff (verification, then beneficiary approval); submitting an application does not guarantee approval or benefits.</li>
          <li>Banking details you provide are used only to disburse approved grants to you, and must belong to you.</li>
          <li>You are responsible for keeping your sign-in credentials confidential and for the accuracy of information you update.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">3. Terms for staff</h2>
        <ul className="mt-2 space-y-1.5">
          <li>Staff access is granted per assigned role and must be used only for legitimate programme duties — registering candidates, verifying submissions, approving beneficiaries, or managing funding, equipment and communications, as applicable to that role.</li>
          <li>Accessing, modifying, or sharing candidate data outside the scope of your role or programme duties is prohibited.</li>
          <li>Approvals, verifications, and disbursement decisions must be made honestly and in line with programme eligibility criteria — not influenced by personal relationships, payment, or favouritism.</li>
          <li>Every action taken in the platform is logged to an audit trail and may be reviewed by administrators at any time.</li>
          <li>Field staff capturing photos or GPS location as part of a candidate registration confirm that the capture reflects an actual field visit.</li>
          <li>Staff accounts are personal and must not be shared. Report any suspected unauthorised access immediately.</li>
          <li>Misuse of staff access may result in suspension of access and, where applicable, referral to the Kogi State Government for disciplinary or legal action.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">4. Availability</h2>
        <p className="mt-2">
          The platform is provided on an "as available" basis. The programme may suspend or update the
          platform, or a user's access to it, at any time — including to investigate a suspected violation of
          these terms.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">5. Changes to these terms</h2>
        <p className="mt-2">
          These terms may be updated as the programme evolves. Continued use of the platform after a change
          means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">6. Privacy</h2>
        <p className="mt-2">
          See the <Link to="/privacy-policy" className="font-medium text-primary hover:underline">Privacy Policy</Link>{" "}
          for how your information is collected, used and protected.
        </p>
      </section>
    </StaticPageLayout>
  );
}
