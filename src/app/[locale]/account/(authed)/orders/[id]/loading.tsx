export default function Loading() {
  return (
    <div className="max-w-3xl space-y-12" aria-busy="true" aria-live="polite">
      <div className="h-12 w-1/2 bg-secondary/20 animate-pulse" />
      <div className="space-y-3">
        <div className="h-3 w-32 bg-secondary/20 animate-pulse" />
        <div className="h-8 w-48 bg-secondary/20 animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-32 bg-secondary/20 animate-pulse" />
        <div className="h-24 w-full bg-secondary/20 animate-pulse" />
        <div className="h-24 w-full bg-secondary/20 animate-pulse" />
      </div>
    </div>
  );
}
