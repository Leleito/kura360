import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-dark p-6">
      <div className="text-center max-w-2xl">
        <div className="flex items-baseline justify-center gap-1 mb-4">
          <span className="text-white text-5xl font-black tracking-tight">
            KURA
          </span>
          <span className="text-green-light text-5xl font-black tracking-tight">
            360
          </span>
        </div>
        <p className="text-white/60 text-lg mb-2">
          Campaign Compliance & Operations Platform
        </p>
        <p className="text-white/40 text-sm mb-10">
          Track finances, manage agents, document evidence, and ensure
          regulatory compliance under the Election Campaign Financing Act.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-green text-white font-bold rounded-lg hover:bg-green-light transition-colors text-center"
          >
            Campaign Dashboard
          </Link>
          <Link
            href="/donations"
            className="px-8 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/20 text-center"
          >
            Donor Portal
          </Link>
        </div>

        <p className="text-white/30 text-xs mt-12">
          Sysmera Limited &middot; v0.1.0
        </p>
      </div>
    </div>
  );
}
