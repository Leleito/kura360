export default function FinanceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-48 skeleton mb-2" />
          <div className="h-3 w-64 skeleton" />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-surface-border h-80" />
        <div className="bg-white rounded-xl p-6 border border-surface-border h-80" />
      </div>
    </div>
  );
}
