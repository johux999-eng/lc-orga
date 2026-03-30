export default function MeLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-slate-800" />
        <div className="h-5 w-24 bg-slate-800 rounded" />
      </div>

      {/* Profile card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 bg-slate-800 rounded" />
            <div className="h-4 w-32 bg-slate-800/60 rounded" />
            <div className="h-3 w-48 bg-slate-800/40 rounded" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <div className="h-1.5 w-full bg-slate-700 rounded-full" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-8 bg-slate-800 rounded" />
                <div className="h-3 w-10 bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="h-4 w-28 bg-slate-800 rounded mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-1/4" />
            </div>
            <div className="h-5 w-16 bg-slate-800 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
