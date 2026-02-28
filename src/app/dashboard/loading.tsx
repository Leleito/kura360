export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-surface-border">
            <div className="h-3 w-20 bg-surface-border rounded mb-3" />
            <div className="h-6 w-24 bg-surface-border rounded mb-2" />
            <div className="h-2 w-28 bg-surface-border-light rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-surface-border">
          <div className="h-4 w-40 bg-surface-border rounded mb-6" />
          <div className="h-64 bg-surface-border-light rounded" />
        </div>
        <div className="bg-white rounded-xl p-6 border border-surface-border">
          <div className="h-4 w-32 bg-surface-border rounded mb-6" />
          <div className="h-48 w-48 mx-auto bg-surface-border-light rounded-full" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-surface-border">
        <div className="p-4 border-b border-surface-border">
          <div className="h-4 w-40 bg-surface-border rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-surface-border-light flex gap-4">
            <div className="h-3 w-20 bg-surface-border-light rounded" />
            <div className="h-3 w-40 bg-surface-border-light rounded flex-1" />
            <div className="h-3 w-24 bg-surface-border-light rounded" />
            <div className="h-3 w-16 bg-surface-border-light rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
