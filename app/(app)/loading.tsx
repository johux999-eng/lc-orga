export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-lc-border" />
        <div className="space-y-1.5">
          <div className="h-5 w-28 bg-lc-border rounded" />
          <div className="h-3.5 w-44 bg-lc-border/60 rounded" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-lc-surface border border-lc-border rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-14 bg-lc-border rounded" />
              <div className="h-4 w-4 bg-lc-border rounded" />
            </div>
            <div className="h-8 w-10 bg-lc-border rounded" />
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="h-9 bg-lc-hover rounded-lg mb-3" />

      {/* Table rows */}
      <div className="rounded-xl border border-lc-border overflow-hidden bg-lc-surface">
        <div className="h-10 bg-lc-cream border-b border-lc-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-lc-border/60 last:border-0">
            <div className="w-7 h-7 rounded-full bg-lc-border shrink-0" />
            <div className="flex-1 h-4 bg-lc-hover rounded" />
            <div className="w-20 h-4 bg-lc-hover rounded" />
            <div className="w-8 h-4 bg-lc-hover rounded" />
            <div className="w-8 h-4 bg-lc-hover rounded" />
            <div className="w-8 h-4 bg-lc-hover rounded" />
            <div className="w-24 h-4 bg-lc-hover rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
