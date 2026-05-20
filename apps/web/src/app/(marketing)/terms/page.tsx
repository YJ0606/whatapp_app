import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="May 20, 2026">
      <p>
        By creating a WaAI account or using our services, you agree to these Terms of Service. If you do
        not agree, do not use the platform.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-4">Service description</h2>
      <p>
        WaAI provides software to automate WhatsApp Business conversations, including FAQ handling,
        bookings, orders, and team collaboration features. Availability and features may vary by plan.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-4">Acceptable use</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Comply with WhatsApp Business and Meta platform policies</li>
        <li>Do not send spam, unlawful content, or misleading messages</li>
        <li>Maintain accurate business information shown to end customers</li>
        <li>Protect account credentials and notify us of unauthorized access</li>
      </ul>
      <h2 className="text-lg font-semibold text-gray-900 pt-4">Billing & trials</h2>
      <p>
        Free trials convert to paid plans unless cancelled before the trial ends. Fees are billed according
        to your selected plan. Refunds follow our published billing policy.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-4">Limitation of liability</h2>
      <p>
        WaAI is provided &quot;as is&quot; to the maximum extent permitted by law. We are not liable for
        indirect damages arising from use of the service. Contact{" "}
        <a href="mailto:legal@waai.app" className="text-brand-600 hover:underline">
          legal@waai.app
        </a>{" "}
        for enterprise agreements.
      </p>
    </LegalPage>
  );
}
