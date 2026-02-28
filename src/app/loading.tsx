export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-surface-border border-t-[#0F2A44] animate-spin" />
        </div>
        <p className="text-sm font-medium text-text-secondary animate-pulse">
          Loading KURA360...
        </p>
      </div>
    </div>
  );
}
