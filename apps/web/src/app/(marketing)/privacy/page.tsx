import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="May 20, 2026">
      <p>
        WaAI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy. This policy explains how we
        collect, use, and protect information when you use our WhatsApp AI assistant platform.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-4">Information we collect</h2>
      <p>
        We collect account information (name, email, business details), conversation metadata required to
        operate the service, and usage analytics to improve product quality. Message content is processed
        only to deliver AI-assisted responses you configure.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-4">How we use data</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Provide and secure the WaAI platform</li>
        <li>Authenticate users and manage team access</li>
        <li>Improve AI accuracy with your approved FAQ and catalog data</li>
        <li>Send transactional emails (invites, billing, security alerts)</li>
      </ul>
      <h2 className="text-lg font-semibold text-gray-900 pt-4">Your rights</h2>
      <p>
        You may request access, correction, or deletion of personal data by contacting{" "}
        <a href="mailto:privacy@waai.app" className="text-brand-600 hover:underline">
          privacy@waai.app
        </a>
        . Enterprise customers may execute a Data Processing Agreement (DPA) on request.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-4">Security</h2>
      <p>
        We use encryption in transit (TLS), role-based access controls, and audit logging. Production
        environments follow least-privilege principles and regular security reviews.
      </p>
    </LegalPage>
  );
}
