import { Link } from "react-router-dom";
import { StaticPageLayout } from "@/components/StaticPageLayout";

function QA({ q, children }) {
  return (
    <details className="group rounded-lg border bg-card p-4 open:bg-muted/30">
      <summary className="cursor-pointer list-none font-display text-sm font-semibold marker:content-none sm:text-base">
        <span className="mr-2 inline-block text-primary transition-transform group-open:rotate-90">›</span>
        {q}
      </summary>
      <div className="mt-2 pl-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

export default function FAQ() {
  return (
    <StaticPageLayout
      title="Frequently Asked Questions"
      subtitle="Answers to common questions about registering for the SYB programme and using ADOZA Data Centre."
    >
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Registration</h2>

        <QA q="Who can register for the SYB programme?">
          <p>Young residents of Kogi State are welcome to register for the Skill-Up Youth Business (SYB)
          Door-to-Door Candidate Empowerment programme.</p>
        </QA>

        <QA q="How do I register?">
          <p>You can register yourself from the <Link to="/login" className="underline">Login page</Link> using
          Google sign-in or a magic-link email, then filling out the registration form on your Candidate
          Dashboard. You can also be registered in the field by a programme enumerator using our mobile app —
          either way, your details go into the same system.</p>
        </QA>

        <QA q="What documents do I need?">
          <p>You'll need one form of government identification — your Voter's Card, National Identification
          Number (NIN), International Passport, or Driver's License — plus a live photo taken during
          registration.</p>
        </QA>

        <QA q="Why can't I upload a photo from my gallery?">
          <p>Photos must be taken live through the camera at the moment of registration. This is deliberate —
          it prevents candidates from submitting a stock or reused photo, which helps keep duplicate
          registrations out of the programme.</p>
        </QA>

        <QA q="Can I use the mobile app instead of the website?">
          <p>Yes. The ADOZA mobile app is available for Android and offers the same registration form as the
          website, with offline-friendly draft saving for areas with patchy network coverage.</p>
        </QA>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Your application status</h2>

        <QA q="How do I check my application status?">
          <p>Sign in and visit your Candidate Dashboard at any time — your current status is shown at the top,
          with a full timeline of your registration journey below it. There's no need to visit an office to
          check.</p>
        </QA>

        <QA q="What does 'Verified' mean?">
          <p>It means the programme team has reviewed your submitted details and documents and confirmed they
          are in order.</p>
        </QA>

        <QA q="What does 'Approved beneficiary' mean?">
          <p>It means the benefits committee has approved you to receive support under the programme —
          funding, equipment, and/or training, depending on what you're eligible for.</p>
        </QA>

        <QA q="How long does verification take?">
          <p>Verification is carried out by the programme team as submissions come in, so timing can vary with
          volume. You don't need to follow up in person — your dashboard updates automatically as soon as your
          status changes, and you'll see a notification too.</p>
        </QA>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Bank details, delivery &amp; account</h2>

        <QA q="How do I add or update my bank details?">
          <p>Once your registration is verified, a "Bank details" option becomes available from your dashboard.
          Enter your bank and 10-digit account number there — this is what's used for any funding disbursed to
          you.</p>
        </QA>

        <QA q="How do I choose how equipment is delivered to me?">
          <p>From your dashboard, you can set a delivery preference — to your home address, a different
          address, or pickup at the empowerment centre.</p>
        </QA>

        <QA q="I forgot my password — what do I do?">
          <p>Use "Forgot password" on the Login page to reset it by email. If you originally signed in with
          Google, continue using the Google sign-in button instead — there's no separate password to reset.</p>
        </QA>

        <QA q="Can I change my registration photo later?">
          <p>No — once your photo is captured and approved during registration, it's locked to protect the
          integrity of the programme's records. If there's a genuine problem with your photo, reach out through
          our <Link to="/contact" className="underline">Contact &amp; Feedback</Link> page.</p>
        </QA>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Staff &amp; general</h2>

        <QA q="I'd like to volunteer as a field enumerator or programme staff — how do I apply?">
          <p>Visit the Login page and choose "Apply to join the team" under the Staff tab. You'll sign in and
          pick a role to apply for; a programme admin reviews and approves applications.</p>
        </QA>

        <QA q="How is my personal data protected?">
          <p>See our <Link to="/privacy-policy" className="underline">Privacy Policy</Link> for full details on
          what we collect and how it's used and protected.</p>
        </QA>

        <QA q="My question isn't answered here.">
          <p>Reach out through our <Link to="/contact" className="underline">Contact &amp; Feedback</Link> page
          and a member of the programme team will get back to you.</p>
        </QA>
      </section>
    </StaticPageLayout>
  );
}
