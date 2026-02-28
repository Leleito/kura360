"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-[#E53E3E]" />
        </div>
        <h2 className="text-lg font-bold text-[#0F2A44] mb-2">Page Error</h2>
        <p className="text-sm text-gray-500 mb-6">
          This section encountered an error. Your data is safe — try refreshing or navigate to another section.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-gray-400 mb-4">Reference: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D6B3F] text-white rounded-lg text-sm font-medium hover:bg-[#1D6B3F]/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-[#0F2A44] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
