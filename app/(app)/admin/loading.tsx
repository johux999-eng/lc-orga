export default function AdminLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-slate-800" />
        <div className="space-y-1.5">
          <div className="h-5 w-36 bg-slate-800 rounded" />
          <div className="h-3.5 w-44 bg-slate-800/60 rounded" />
        </div>
      </div>

      {/* User cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-slate-800 rounded" />
              <div className="h-3 w-24 bg-slate-800/60 rounded" />
            </div>
            <div className="h-8 w-28 bg-slate-800 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
