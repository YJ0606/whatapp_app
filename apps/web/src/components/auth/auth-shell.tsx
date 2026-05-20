import Link from "next/link";
import { CheckCircle2, MessageSquare, Shield, Zap } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}

const highlights = [
  { icon: MessageSquare, text: "AI-powered WhatsApp conversations" },
  { icon: Zap, text: "Automate bookings, orders, and FAQs" },
  { icon: Shield, text: "Enterprise-grade security & compliance" },
  { icon: CheckCircle2, text: "Trusted by 500+ growing businesses" },
];

export function AuthShell({ children, title, subtitle, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-brand-900">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#25D366_0%,transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">WaAI</span>
          </Link>

          <div>
            <p className="text-brand-300 text-sm font-semibold uppercase tracking-wider mb-3">
              Enterprise WhatsApp AI
            </p>
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
              Automate customer conversations at scale
            </h2>
            <p className="text-gray-300 text-base leading-relaxed max-w-md">
              Manage FAQs, bookings, orders, and team workflows from one secure workspace.
            </p>
            <ul className="mt-8 space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-gray-200 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-brand-400" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} WaAI. SOC 2 ready · GDPR compliant
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">WaAI</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm shadow-gray-200/50">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
            <p className="text-gray-500 text-sm mb-6">{subtitle}</p>
            {children}
          </div>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
