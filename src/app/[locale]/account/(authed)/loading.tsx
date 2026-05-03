export default function Loading() {
  return (
    <div className="space-y-12" aria-busy="true" aria-live="polite">
      <div className="h-16 w-3/4 max-w-md bg-secondary/20 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-48 bg-secondary/20 animate-pulse" />
        <div className="h-48 bg-secondary/20 animate-pulse" />
      </div>
    </div>
  );
}
