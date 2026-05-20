import Link from "next/link";

interface LegalPageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-lg text-gray-900">WaAI</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: {updated}</p>
        <div className="prose prose-gray max-w-none text-gray-700 space-y-4 text-sm leading-relaxed">
          {children}
        </div>
      </article>
    </main>
  );
}
