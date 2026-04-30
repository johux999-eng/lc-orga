'use client'

import { useState, useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { ROLE_LABELS, TEAM_LABELS, getInitials } from '@/lib/utils'
import { approveUser } from '@/lib/actions'

export function AdminView({ pending }: { pending: Profile[] }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [approvingId, setApprovingId] = useState<string | null>(null)

  function handleApprove(userId: string) {
    setApprovingId(userId)
    setErrors((prev) => ({ ...prev, [userId]: '' }))
    startTransition(async () => {
      try {
        await approveUser(userId)
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [userId]: err instanceof Error ? err.message : 'Fehler',
        }))
      } finally {
        setApprovingId(null)
      }
    })
  }

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center mb-4">
          <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-lc-secondary font-medium">Keine ausstehenden Freischaltungen</p>
        <p className="text-lc-faint text-[13px] mt-1">Alle Mitglieder sind freigeschaltet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[12px] text-lc-faint mb-4">
        <span className="text-lc-ink font-medium">{pending.length}</span> ausstehend
      </p>
      {pending.map((profile) => (
        <div
          key={profile.id}
          className="bg-lc-surface border border-lc-border rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-lc-navy/10 flex items-center justify-center text-[11px] font-semibold text-lc-navy shrink-0">
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-lc-ink truncate">
              {profile.full_name ?? '—'}
            </p>
            <p className="text-[11px] text-lc-faint truncate">
              {profile.role ? ROLE_LABELS[profile.role] : '?'}
              {profile.team ? ` · ${TEAM_LABELS[profile.team]}` : ''}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {errors[profile.id] && (
              <p className="text-[11px] text-red-600 mb-1">{errors[profile.id]}</p>
            )}
            <button
              onClick={() => handleApprove(profile.id)}
              disabled={isPending && approvingId === profile.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 disabled:opacity-50 transition-colors"
            >
              <CheckCircle size={12} />
              {approvingId === profile.id ? 'Freischalten…' : 'Freischalten'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
