import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
    title: "Terms of Service – DutyDocs",
    description: "The terms that govern your use of DutyDocs.",
};

export default function TermsPage() {
    return (
        <LegalPage title="Terms of Service" updated="17 July 2026">
            <LegalSection title="1. What DutyDocs is">
                <p>
                    These Terms of Service (&quot;Terms&quot;) govern your use of DutyDocs (the
                    &quot;App&quot;), operated by <strong>Chris Smith, trading as DutyDocs</strong>{" "}
                    (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By creating an account or using
                    the App, you agree to these Terms.
                </p>
                <p>
                    DutyDocs is a record-keeping tool that helps businesses organise and store health
                    and safety documentation, including risk assessments, incident reports, training
                    records, permits to work, and similar workplace safety documents.
                </p>
                <p>
                    <strong>DutyDocs is a record-keeping tool, not a source of professional health and
                    safety advice.</strong> It does not replace the judgement of a qualified health and
                    safety professional, and using the App does not guarantee legal compliance with any
                    health and safety regulation. You remain responsible for ensuring your own
                    compliance with all applicable laws and regulations.
                </p>
            </LegalSection>

            <LegalSection title="2. Accounts">
                <p>
                    You must provide accurate information when creating an account, and you are
                    responsible for keeping your login details secure. You must be legally able to
                    enter a contract in your jurisdiction to use DutyDocs. If you are using DutyDocs on
                    behalf of a business, you confirm you have authority to bind that business to these
                    Terms.
                </p>
            </LegalSection>

            <LegalSection title="3. Plans and payment">
                <p>
                    DutyDocs offers a Free plan and paid plans (where available). Paid plans are billed
                    via Stripe, and prices are shown in the App before you subscribe. You may cancel a
                    paid plan at any time; cancellation takes effect at the end of the current billing
                    period, and we do not give partial refunds for unused time unless the law requires
                    it. We may change pricing with reasonable notice to existing subscribers.
                </p>
            </LegalSection>

            <LegalSection title="4. Your content">
                <p>
                    You retain ownership of the records, documents, and data you create or upload to
                    DutyDocs, and you can export your records at any time. You are responsible for the
                    accuracy of the information you enter. You grant us a limited licence to store and
                    process your content solely to provide the App&apos;s functionality to you. Our{" "}
                    <a href="/privacy" style={{ color: "var(--color-accent)" }}>Privacy Policy</a>{" "}
                    explains how we handle personal data.
                </p>
                <p>
                    On the Free plan, records are stored locally on your device. We cannot recover
                    Free-plan data from a lost device or cleared browser storage — back up regularly or
                    upgrade to cloud sync.
                </p>
            </LegalSection>

            <LegalSection title="5. Acceptable use">
                <p>You agree not to:</p>
                <p>
                    — Use DutyDocs for any unlawful purpose<br />
                    — Attempt to access other users&apos; accounts or data without authorisation<br />
                    — Interfere with or disrupt the App&apos;s operation<br />
                    — Reverse-engineer or attempt to extract the App&apos;s source code
                </p>
            </LegalSection>

            <LegalSection title="6. Limitation of liability">
                <p>To the fullest extent permitted by law:</p>
                <p>
                    DutyDocs is provided &quot;as is&quot; without warranties of any kind, express or
                    implied. We are not liable for any indirect, incidental, or consequential losses
                    arising from your use of the App, including but not limited to loss of data, loss
                    of profit, or regulatory penalties. Our total liability to you for any claim
                    arising from your use of DutyDocs is limited to the amount you paid us in the 12
                    months prior to the claim (or £0 if you are on the Free plan).
                </p>
                <p>
                    Nothing in these Terms excludes liability that cannot be excluded under UK law,
                    such as liability for death or personal injury caused by negligence, or fraud.
                </p>
            </LegalSection>

            <LegalSection title="7. Availability">
                <p>
                    We aim to keep DutyDocs available and reliable, but we don&apos;t guarantee
                    uninterrupted access. We may carry out maintenance, updates, or occasionally
                    experience downtime. Offline features depend on your device.
                </p>
            </LegalSection>

            <LegalSection title="8. Termination">
                <p>
                    You may stop using DutyDocs and delete your account at any time; you may export
                    your data first, and we then delete it as described in the Privacy Policy. We may
                    suspend or terminate accounts that breach these Terms, or for extended non-payment
                    on paid plans.
                </p>
            </LegalSection>

            <LegalSection title="9. Changes to these Terms">
                <p>
                    We may update these Terms from time to time and will give you notice of material
                    changes by email or in the App before they take effect. Continued use of the App
                    after changes take effect constitutes acceptance of the updated Terms.
                </p>
            </LegalSection>

            <LegalSection title="10. Governing law">
                <p>
                    These Terms are governed by the laws of England and Wales. Any disputes will be
                    subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>
            </LegalSection>

            <LegalSection title="11. Contact">
                <p>
                    Questions about these Terms:{" "}
                    <a href="mailto:hello@dutydocsapp.com" style={{ color: "var(--color-accent)" }}>hello@dutydocsapp.com</a>
                </p>
            </LegalSection>
        </LegalPage>
    );
}
