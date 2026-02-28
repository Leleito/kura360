export default function AgentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-44 skeleton mb-2" />
          <div className="h-3 w-56 skeleton" />
        </div>
        <div className="h-9 w-32 skeleton rounded-lg" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-surface-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 skeleton rounded-full" />
              <div>
                <div className="h-4 w-28 skeleton mb-1" />
                <div className="h-3 w-20 skeleton" />
              </div>
            </div>
            <div className="h-3 w-full skeleton mb-2" />
            <div className="h-3 w-2/3 skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
