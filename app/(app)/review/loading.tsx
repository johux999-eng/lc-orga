export default function ReviewLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-slate-800" />
        <div className="space-y-1.5">
          <div className="h-5 w-28 bg-slate-800 rounded" />
          <div className="h-3.5 w-40 bg-slate-800/60 rounded" />
        </div>
      </div>

      {/* Task cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
              </div>
              <div className="h-5 w-20 bg-slate-800 rounded-full shrink-0" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-slate-800 rounded-lg" />
              <div className="h-8 flex-1 bg-slate-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
