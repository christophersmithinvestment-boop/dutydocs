import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
    title: "Terms of Service – DutyDocs",
    description: "The terms that govern your use of DutyDocs.",
};

export default function TermsPage() {
    return (
        <LegalPage title="Terms of Service" updated="13 July 2026">
            <LegalSection title="1. The agreement">
                <p>
                    These terms are a contract between you and <strong>[Company Name] ([Company
                    Number])</strong>, registered at <strong>[Registered Address]</strong>{" "}
                    (&quot;DutyDocs&quot;, &quot;we&quot;). By creating an account you agree to them. If
                    you are using DutyDocs on behalf of a business, you confirm you have authority to
                    bind that business.
                </p>
            </LegalSection>

            <LegalSection title="2. What DutyDocs is">
                <p>
                    DutyDocs is a record-keeping and documentation tool for workplace health &amp; safety:
                    risk assessments, incident reports, training records, permits, and similar documents.
                </p>
            </LegalSection>

            <LegalSection title="3. What DutyDocs is not">
                <p>
                    <strong>DutyDocs is not legal, regulatory, or professional health &amp; safety
                    advice, and using it does not by itself make you compliant with health &amp; safety
                    law.</strong> Templates, checklists, and scoring tools are starting points that you
                    must adapt to your own workplace. Responsibility for the accuracy and adequacy of
                    your assessments, and for complying with the law (including the Health and Safety at
                    Work etc. Act 1974 and RIDDOR reporting duties), stays with you and your competent
                    persons.
                </p>
            </LegalSection>

            <LegalSection title="4. Your account and acceptable use">
                <p>
                    Keep your login credentials confidential; you are responsible for activity under your
                    account. You must not use DutyDocs to store unlawful content, attempt to break or
                    overload the service, or resell it without our written agreement.
                </p>
            </LegalSection>

            <LegalSection title="5. Your data">
                <p>
                    Your records belong to you. You grant us the limited licence needed to host, process,
                    back up, and display them to you and your team. You are responsible for the accuracy
                    of what you record and for your lawful basis to record personal data about others.
                    Our <a href="/privacy" style={{ color: "var(--color-accent)" }}>Privacy Policy</a>{" "}
                    explains how we handle data. You can export your records at any time.
                </p>
                <p>
                    On the free plan, records are stored locally on your device. We cannot recover
                    free-plan data from a lost device or cleared browser storage — back up regularly or
                    use cloud sync.
                </p>
            </LegalSection>

            <LegalSection title="6. Plans and billing">
                <p>
                    The free plan has usage limits shown at sign-up. Paid subscriptions are billed in
                    advance (monthly, via Stripe) and renew automatically. You can cancel at any time and
                    keep access until the end of the paid period; we do not give partial refunds for
                    unused time unless the law requires it. We will give you at least 30 days&apos;
                    notice by email before any price increase takes effect.
                </p>
            </LegalSection>

            <LegalSection title="7. Availability">
                <p>
                    We work to keep DutyDocs available and your data safe, but we do not guarantee
                    uninterrupted or error-free service, and maintenance windows may occur. Offline
                    features depend on your device.
                </p>
            </LegalSection>

            <LegalSection title="8. Liability">
                <p>
                    Nothing in these terms excludes liability that cannot be excluded under the law of
                    England and Wales (including for death or personal injury caused by our negligence,
                    or fraud). Subject to that: we are not liable for indirect or consequential losses,
                    loss of profits, or regulatory penalties arising from your use of the service, and
                    our total liability in any 12-month period is capped at the amount you paid us in
                    that period.
                </p>
            </LegalSection>

            <LegalSection title="9. Ending the agreement">
                <p>
                    You can close your account at any time from Settings or by emailing us. We may
                    suspend or terminate accounts that break these terms, giving notice where reasonable.
                    On closure, you may export your data; we then delete it as described in the Privacy
                    Policy.
                </p>
            </LegalSection>

            <LegalSection title="10. General">
                <p>
                    We may update these terms and will give you notice of material changes before they
                    take effect; continuing to use DutyDocs after that constitutes acceptance. These
                    terms are governed by the law of England and Wales, and the courts of England and
                    Wales have exclusive jurisdiction. Questions:{" "}
                    <a href="mailto:hello@dutydocsapp.com" style={{ color: "var(--color-accent)" }}>hello@dutydocsapp.com</a>.
                </p>
            </LegalSection>
        </LegalPage>
    );
}
