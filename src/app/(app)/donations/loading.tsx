export default function DonationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-44 skeleton mb-2" />
          <div className="h-3 w-52 skeleton" />
        </div>
        <div className="h-9 w-36 skeleton rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-surface-border">
            <div className="h-3 w-20 skeleton mb-3" />
            <div className="h-7 w-28 skeleton mb-2" />
            <div className="h-2 w-32 skeleton" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl border border-surface-border">
          <div className="p-4 border-b border-surface-border flex gap-3">
            <div className="h-9 w-48 skeleton rounded-lg" />
            <div className="h-9 w-24 skeleton rounded-lg" />
            <div className="h-9 w-24 skeleton rounded-lg" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-surface-border-light flex items-center gap-4">
              <div className="h-8 w-8 skeleton rounded-full" />
              <div className="h-3 w-28 skeleton flex-1" />
              <div className="h-3 w-20 skeleton" />
              <div className="h-5 w-14 skeleton rounded-full" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-4 border border-surface-border">
          <div className="h-4 w-24 skeleton mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-8 w-8 skeleton rounded-full" />
              <div className="flex-1">
                <div className="h-3 w-24 skeleton mb-1" />
                <div className="h-2 w-16 skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
