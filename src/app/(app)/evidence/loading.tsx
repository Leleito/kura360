export default function EvidenceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-40 skeleton mb-2" />
          <div className="h-3 w-60 skeleton" />
        </div>
        <div className="h-9 w-36 skeleton rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-surface-border">
            <div className="h-3 w-20 skeleton mb-3" />
            <div className="h-7 w-16 skeleton mb-2" />
            <div className="h-2 w-28 skeleton" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-surface-border overflow-hidden">
            <div className="h-36 skeleton" />
            <div className="p-3">
              <div className="h-4 w-3/4 skeleton mb-2" />
              <div className="h-3 w-1/2 skeleton mb-2" />
              <div className="h-3 w-full skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
