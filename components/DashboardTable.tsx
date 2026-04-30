'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import type { UserStats } from '@/lib/types'
import { TEAM_LABELS, ROLE_LABELS, getRateColor, getRateBarColor } from '@/lib/utils'

interface Props {
  stats: UserStats[]
  currentUserId: string
}

export function DashboardTable({ stats, currentUserId }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      stats.filter(
        (s) =>
          s.profile.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          (s.profile.team && TEAM_LABELS[s.profile.team].toLowerCase().includes(search.toLowerCase()))
      ),
    [stats, search]
  )

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lc-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Name oder Team…"
          className="w-full pl-9 pr-4 py-2 bg-lc-surface border border-lc-border rounded-lg text-[13px] text-lc-ink placeholder-lc-faint focus:outline-none focus:border-lc-blue transition-colors"
        />
      </div>

      {/* Table — desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-lc-border bg-lc-surface">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-lc-border bg-lc-cream/60">
              <th className="text-left px-4 py-3 font-didot text-[11px] font-bold text-lc-muted uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-4 py-3 font-didot text-[11px] font-bold text-lc-muted uppercase tracking-wider">
                Team
              </th>
              <th className="text-right px-4 py-3 font-didot text-[11px] font-bold text-lc-muted uppercase tracking-wider">
                Offen
              </th>
              <th className="text-right px-4 py-3 font-didot text-[11px] font-bold text-lc-muted uppercase tracking-wider">
                Prüfung
              </th>
              <th className="text-right px-4 py-3 font-didot text-[11px] font-bold text-lc-muted uppercase tracking-wider">
                Erledigt
              </th>
              <th className="text-right px-4 py-3 font-didot text-[11px] font-bold text-lc-muted uppercase tracking-wider">
                Quote
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lc-border/70">
            {filtered.map(({ profile, open, overdue, pending, done, total, rate }) => (
              <tr
                key={profile.id}
                className={`hover:bg-lc-hover/50 transition-colors ${
                  profile.id === currentUserId ? 'bg-lc-navy/[0.03]' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-lc-navy/10 flex items-center justify-center text-[10px] font-semibold text-lc-navy shrink-0">
                      {profile.full_name?.slice(0, 2).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <span className="font-medium text-lc-ink">
                        {profile.full_name ?? '—'}
                      </span>
                      {profile.id === currentUserId && (
                        <span className="ml-1.5 text-[10px] text-lc-blue font-medium">Du</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-lc-secondary">
                      {profile.team ? TEAM_LABELS[profile.team] : '—'}
                    </span>
                    <span className="ml-1.5 text-[11px] text-lc-faint">
                      {profile.role ? ROLE_LABELS[profile.role] : ''}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {overdue > 0 ? (
                    <span className="text-red-600 font-medium">{open}</span>
                  ) : (
                    <span className="text-lc-muted">{open}</span>
                  )}
                  {overdue > 0 && (
                    <span className="ml-1 text-[11px] text-red-500/80">({overdue} überfällig)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {pending > 0 ? (
                    <span className="text-amber-600 font-medium">{pending}</span>
                  ) : (
                    <span className="text-lc-faint">{pending}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-emerald-600 font-medium">{done}</span>
                  <span className="text-lc-faint text-[11px] ml-0.5">/{total}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-lc-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getRateBarColor(rate)}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className={`text-[13px] font-semibold tabular-nums w-10 text-right ${getRateColor(rate)}`}>
                      {rate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-lc-faint text-[13px]">Keine Einträge gefunden.</p>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="sm:hidden space-y-2">
        {filtered.map(({ profile, open, overdue, pending, done, total, rate }) => (
          <div
            key={profile.id}
            className={`rounded-xl border p-4 space-y-3 bg-lc-surface ${
              profile.id === currentUserId
                ? 'border-lc-navy/20'
                : 'border-lc-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-lc-navy/10 flex items-center justify-center text-[10px] font-semibold text-lc-navy">
                  {profile.full_name?.slice(0, 2).toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-lc-ink">
                    {profile.full_name ?? '—'}
                    {profile.id === currentUserId && (
                      <span className="ml-1.5 text-[10px] text-lc-blue">Du</span>
                    )}
                  </p>
                  <p className="text-[11px] text-lc-faint">
                    {profile.role ? ROLE_LABELS[profile.role] : ''}
                    {profile.team ? ` · ${TEAM_LABELS[profile.team]}` : ''}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${getRateColor(rate)}`}>{rate}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-lc-border overflow-hidden">
              <div
                className={`h-full rounded-full ${getRateBarColor(rate)}`}
                style={{ width: `${rate}%` }}
              />
            </div>
            <div className="flex gap-4 text-[11px]">
              <div>
                <span className={overdue > 0 ? 'text-red-600 font-medium' : 'text-lc-muted'}>
                  {open}
                </span>{' '}
                <span className="text-lc-faint">offen</span>
              </div>
              <div>
                <span className={pending > 0 ? 'text-amber-600 font-medium' : 'text-lc-faint'}>
                  {pending}
                </span>{' '}
                <span className="text-lc-faint">prüfung</span>
              </div>
              <div>
                <span className="text-emerald-600 font-medium">{done}</span>
                <span className="text-lc-faint">/{total} erledigt</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-10 text-lc-faint text-[13px]">Keine Einträge gefunden.</p>
        )}
      </div>
    </div>
  )
}
