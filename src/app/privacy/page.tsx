import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
    title: "Privacy Policy – DutyDocs",
    description: "How DutyDocs collects, uses, and protects your data.",
};

export default function PrivacyPage() {
    return (
        <LegalPage title="Privacy Policy" updated="13 July 2026">
            <LegalSection title="1. Who we are">
                <p>
                    DutyDocs (&quot;we&quot;, &quot;us&quot;) provides health &amp; safety record-keeping software
                    at dutydocsapp.com and through our mobile apps. DutyDocs is operated by{" "}
                    <strong>[Company Name] ([Company Number])</strong>, registered at{" "}
                    <strong>[Registered Address]</strong>. For anything in this policy, contact us at{" "}
                    <a href="mailto:hello@dutydocsapp.com" style={{ color: "var(--color-accent)" }}>hello@dutydocsapp.com</a>.
                </p>
            </LegalSection>

            <LegalSection title="2. What we collect">
                <p>
                    <strong>Account data</strong> — your email address and password (stored as a secure
                    hash), and your name if you provide it.
                </p>
                <p>
                    <strong>Safety records you create</strong> — risk assessments, incident reports,
                    training records, and other documents you enter into DutyDocs. These may contain
                    personal data about your employees or colleagues (for example, the name of a person
                    involved in an incident).
                </p>
                <p>
                    <strong>Billing data</strong> — payments are processed by Stripe. We never see or
                    store your card number; we hold only your subscription status and invoice history.
                </p>
                <p>
                    <strong>Technical basics</strong> — standard logs (IP address, browser type) needed to
                    run and secure the service. We do not use advertising trackers.
                </p>
            </LegalSection>

            <LegalSection title="3. How we use your data">
                <p>
                    Solely to provide the service: authenticating you, storing and syncing your records,
                    processing subscription payments, responding to support requests, and sending
                    essential service emails (such as password resets). We do not sell your data or use
                    it for advertising.
                </p>
            </LegalSection>

            <LegalSection title="4. Your employees' data">
                <p>
                    Records you create may include personal data about people in your organisation. For
                    that data, <strong>you are the data controller</strong> and we act as your data
                    processor — we store and process it only on your instructions and never use it for
                    our own purposes. You are responsible for having a lawful basis to record it.
                </p>
            </LegalSection>

            <LegalSection title="5. Where your data lives">
                <p>
                    Cloud-synced data is stored with Supabase, encrypted in transit and at rest. On the
                    free plan, your records are stored locally on your own device and do not leave it
                    unless you upgrade to cloud sync — which also means we cannot recover them if your
                    device is lost or its storage is cleared.
                </p>
            </LegalSection>

            <LegalSection title="6. Who we share it with">
                <p>
                    Only our service providers, and only to run DutyDocs: Supabase (database and
                    authentication) and Stripe (payments). We will disclose data if the law requires it.
                    There are no other recipients.
                </p>
            </LegalSection>

            <LegalSection title="7. How long we keep it">
                <p>
                    For as long as your account is active. If you delete your account, we delete your
                    account data and cloud-stored records within 30 days, except where we must keep
                    invoicing records for tax law.
                </p>
            </LegalSection>

            <LegalSection title="8. Your rights">
                <p>
                    Under UK GDPR you can ask us to access, correct, delete, or export your personal
                    data, and you can object to or restrict our processing of it. Email{" "}
                    <a href="mailto:hello@dutydocsapp.com" style={{ color: "var(--color-accent)" }}>hello@dutydocsapp.com</a>{" "}
                    and we will respond within one month. You also have the right to complain to the
                    Information Commissioner&apos;s Office (ico.org.uk).
                </p>
            </LegalSection>

            <LegalSection title="9. Cookies and local storage">
                <p>
                    We use only what is essential to keep you signed in and to store your records for
                    offline use. No analytics or advertising cookies are set.
                </p>
            </LegalSection>

            <LegalSection title="10. Changes">
                <p>
                    If we make material changes to this policy we will notify you by email or in the app
                    before they take effect.
                </p>
            </LegalSection>
        </LegalPage>
    );
}
