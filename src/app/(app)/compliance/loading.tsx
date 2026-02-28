export default function ComplianceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-52 skeleton mb-2" />
          <div className="h-3 w-64 skeleton" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-surface-border flex items-center justify-center">
          <div className="h-40 w-40 skeleton rounded-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-surface-border">
            <div className="h-3 w-20 skeleton mb-3" />
            <div className="h-7 w-12 skeleton mb-2" />
            <div className="h-2 w-28 skeleton" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-surface-border">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 skeleton rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-3/4 skeleton mb-2" />
                <div className="h-3 w-full skeleton mb-1" />
                <div className="h-3 w-2/3 skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
