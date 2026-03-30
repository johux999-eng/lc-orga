export default function TasksLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-slate-800" />
        <div className="space-y-1.5">
          <div className="h-5 w-16 bg-slate-800 rounded" />
          <div className="h-3.5 w-32 bg-slate-800/60 rounded" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-9 bg-slate-800/50 rounded-lg" />
        <div className="h-9 w-28 bg-slate-800/50 rounded-lg" />
      </div>

      {/* Task rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-1/3" />
            </div>
            <div className="h-5 w-16 bg-slate-800 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
