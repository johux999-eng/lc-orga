export default function TasksLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-lc-border" />
        <div className="space-y-1.5">
          <div className="h-5 w-16 bg-lc-border rounded" />
          <div className="h-3.5 w-32 bg-lc-border/60 rounded" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-9 bg-lc-hover rounded-lg" />
        <div className="h-9 w-28 bg-lc-hover rounded-lg" />
      </div>

      {/* Task rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white border border-lc-border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-lc-hover rounded w-3/4" />
              <div className="h-3 bg-lc-border/60 rounded w-1/3" />
            </div>
            <div className="h-5 w-16 bg-lc-hover rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
