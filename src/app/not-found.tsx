import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-extrabold text-[#0F2A44]/10">404</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0F2A44] text-white rounded-lg text-sm font-medium hover:bg-[#1B3A5C] transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-surface-border text-text-secondary rounded-lg text-sm font-medium hover:bg-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
