export default function HelpLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="h-12 bg-gray-200 rounded-xl" />
      <div className="h-10 bg-gray-200 rounded-lg w-64" />
      <div className="h-40 bg-gray-200 rounded-xl" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-xl" />
      ))}
    </div>
  );
}
