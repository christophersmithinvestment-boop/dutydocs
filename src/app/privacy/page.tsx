import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
    title: "Privacy Policy – DutyDocs",
    description: "How DutyDocs collects, uses, and protects your data.",
};

export default function PrivacyPage() {
    return (
        <LegalPage title="Privacy Policy" updated="17 July 2026">
            <LegalSection title="1. Who we are">
                <p>
                    DutyDocs (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is operated by{" "}
                    <strong>Chris Smith, trading as DutyDocs</strong>, a UK-based sole trader business,
                    who is the data controller for the personal data described in this policy. This
                    policy explains how we collect, use, and protect your personal data when you use
                    the DutyDocs app and website (dutydocsapp.com). For any questions about this policy
                    or your data, contact us at{" "}
                    <a href="mailto:hello@dutydocsapp.com" style={{ color: "var(--color-accent)" }}>hello@dutydocsapp.com</a>.
                </p>
            </LegalSection>

            <LegalSection title="2. What data we collect">
                <p>
                    <strong>Account information</strong> — name, email address, and password (stored as
                    a secure hash).
                </p>
                <p>
                    <strong>Records you create</strong> — risk assessments, incident reports, training
                    records, and similar compliance records you enter into the app.
                </p>
                <p>
                    <strong>Technical data</strong> — IP address, browser type, and device information,
                    collected automatically for security and performance.
                </p>
                <p>
                    <strong>Payment information</strong> — if you upgrade to a paid plan, payment is
                    processed by Stripe. We do not store your card details ourselves.
                </p>
            </LegalSection>

            <LegalSection title="3. How we use your data">
                <p>
                    We use your data to provide and maintain your account and the records you create,
                    send essential account emails (signup confirmation, password resets), improve the
                    app, and meet legal obligations where applicable.{" "}
                    <strong>We do not sell your data to third parties</strong>, and we do not use it
                    for advertising.
                </p>
            </LegalSection>

            <LegalSection title="4. Your employees' data">
                <p>
                    Records you create may include personal data about people in your organisation —
                    for example, the name of a person involved in an incident or holding a training
                    certificate. For that data, <strong>you are the data controller</strong> and we act
                    as your data processor: we store and process it only on your instructions and never
                    use it for our own purposes. You are responsible for having a lawful basis to
                    record it.
                </p>
            </LegalSection>

            <LegalSection title="5. Legal basis for processing (UK GDPR)">
                <p>
                    <strong>Contract</strong> — to provide the service you&apos;ve signed up for.
                </p>
                <p>
                    <strong>Legitimate interest</strong> — to maintain, secure, and improve the app.
                </p>
                <p>
                    <strong>Consent</strong> — for optional communications, where applicable.
                </p>
            </LegalSection>

            <LegalSection title="6. Data storage and security">
                <p>
                    Cloud-synced data is stored using Supabase, a secure cloud database provider,
                    encrypted in transit and at rest. On the Free plan, your records are stored locally
                    on your own device and do not leave it — which also means we cannot recover them if
                    your device is lost or its storage is cleared. We take reasonable technical
                    measures to protect your data, but no online service can guarantee absolute
                    security.
                </p>
            </LegalSection>

            <LegalSection title="7. Data retention">
                <p>
                    We retain your account and record data for as long as your account is active. If
                    you delete your account, we delete your personal data within 30 days, except where
                    we are required to retain it by law (for example, invoicing records for tax
                    purposes).
                </p>
            </LegalSection>

            <LegalSection title="8. Your rights">
                <p>
                    Under UK GDPR, you have the right to access the personal data we hold about you,
                    request correction of inaccurate data, request deletion of your data, request a
                    copy of your data in a portable format, and object to certain types of processing.
                    To exercise any of these rights, email{" "}
                    <a href="mailto:hello@dutydocsapp.com" style={{ color: "var(--color-accent)" }}>hello@dutydocsapp.com</a>{" "}
                    and we will respond within one month.
                </p>
            </LegalSection>

            <LegalSection title="9. Third-party services">
                <p>
                    We use the following third-party services, which may process your data under their
                    own privacy policies: Supabase (database and authentication), Stripe (payment
                    processing, paid plans only), and Vercel (hosting). We will disclose data if the
                    law requires it. There are no other recipients.
                </p>
            </LegalSection>

            <LegalSection title="10. Cookies and local storage">
                <p>
                    DutyDocs uses only what is essential for login sessions to function and to store
                    your records for offline use. We do not use tracking or advertising cookies.
                </p>
            </LegalSection>

            <LegalSection title="11. Children's privacy">
                <p>
                    DutyDocs is intended for business use by adults. It is not directed at, and we do
                    not knowingly collect data from, children.
                </p>
            </LegalSection>

            <LegalSection title="12. Changes and contact">
                <p>
                    We may update this policy from time to time. Material changes will be reflected on
                    this page with an updated &quot;last updated&quot; date, and we will notify you of
                    significant changes by email or in the app. Questions or data requests:{" "}
                    <a href="mailto:hello@dutydocsapp.com" style={{ color: "var(--color-accent)" }}>hello@dutydocsapp.com</a>.
                </p>
                <p>
                    You also have the right to lodge a complaint with the UK Information
                    Commissioner&apos;s Office (ICO) at ico.org.uk if you believe your data has been
                    mishandled.
                </p>
            </LegalSection>
        </LegalPage>
    );
}
