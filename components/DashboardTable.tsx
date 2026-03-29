'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { UserStats } from '@/lib/types'
import { TEAM_LABELS, ROLE_LABELS, getRateColor, getRateBarColor } from '@/lib/utils'

interface Props {
  stats: UserStats[]
  currentUserId: string
}

export function DashboardTable({ stats, currentUserId }: Props) {
  const [search, setSearch] = useState('')

  const filtered = stats.filter(
    (s) =>
      s.profile.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      (s.profile.team && TEAM_LABELS[s.profile.team].toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Name oder Team…"
          className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800"
        />
      </div>

      {/* Table — desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Team
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Offen
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Prüfung
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Erledigt
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quote
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map(({ profile, open, overdue, pending, done, total, rate }) => (
              <tr
                key={profile.id}
                className={`hover:bg-slate-800/30 transition-colors ${
                  profile.id === currentUserId ? 'bg-blue-600/5' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                      {profile.full_name?.slice(0, 2).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-100">
                        {profile.full_name ?? '—'}
                      </span>
                      {profile.id === currentUserId && (
                        <span className="ml-1.5 text-[10px] text-blue-400 font-medium">Du</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-slate-300">
                      {profile.team ? TEAM_LABELS[profile.team] : '—'}
                    </span>
                    <span className="ml-1.5 text-[10px] text-slate-500">
                      {profile.role ? ROLE_LABELS[profile.role] : ''}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {overdue > 0 ? (
                    <span className="text-red-400 font-medium">{open}</span>
                  ) : (
                    <span className="text-slate-400">{open}</span>
                  )}
                  {overdue > 0 && (
                    <span className="ml-1 text-xs text-red-400/70">({overdue} überfällig)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {pending > 0 ? (
                    <span className="text-amber-400 font-medium">{pending}</span>
                  ) : (
                    <span className="text-slate-500">{pending}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-emerald-400 font-medium">{done}</span>
                  <span className="text-slate-600 text-xs ml-0.5">/{total}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getRateBarColor(rate)}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold tabular-nums w-10 text-right ${getRateColor(rate)}`}>
                      {rate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-slate-500 text-sm">Keine Einträge gefunden.</p>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="sm:hidden space-y-2">
        {filtered.map(({ profile, open, overdue, pending, done, total, rate }) => (
          <div
            key={profile.id}
            className={`rounded-xl border p-4 space-y-3 ${
              profile.id === currentUserId
                ? 'bg-blue-600/5 border-blue-600/20'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                  {profile.full_name?.slice(0, 2).toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {profile.full_name ?? '—'}
                    {profile.id === currentUserId && (
                      <span className="ml-1.5 text-[10px] text-blue-400">Du</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profile.role ? ROLE_LABELS[profile.role] : ''}
                    {profile.team ? ` · ${TEAM_LABELS[profile.team]}` : ''}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${getRateColor(rate)}`}>{rate}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${getRateBarColor(rate)}`}
                style={{ width: `${rate}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className={overdue > 0 ? 'text-red-400 font-medium' : 'text-slate-400'}>
                  {open}
                </span>{' '}
                <span className="text-slate-600">offen</span>
              </div>
              <div>
                <span className={pending > 0 ? 'text-amber-400 font-medium' : 'text-slate-500'}>
                  {pending}
                </span>{' '}
                <span className="text-slate-600">prüfung</span>
              </div>
              <div>
                <span className="text-emerald-400 font-medium">{done}</span>
                <span className="text-slate-600">/{total} erledigt</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-10 text-slate-500 text-sm">Keine Einträge gefunden.</p>
        )}
      </div>
    </div>
  )
}
