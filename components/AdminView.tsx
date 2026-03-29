'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Users } from 'lucide-react'
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
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle size={24} className="text-emerald-400" />
        </div>
        <p className="text-slate-300 font-medium">Keine ausstehenden Freischaltungen</p>
        <p className="text-slate-500 text-sm mt-1">Alle Mitglieder sind freigeschaltet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 mb-4">
        <span className="text-slate-300 font-medium">{pending.length}</span> ausstehend
      </p>
      {pending.map((profile) => (
        <div
          key={profile.id}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {profile.full_name ?? '—'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {profile.role ? ROLE_LABELS[profile.role] : '?'}
              {profile.team ? ` · ${TEAM_LABELS[profile.team]}` : ''}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {errors[profile.id] && (
              <p className="text-xs text-red-400 mb-1">{errors[profile.id]}</p>
            )}
            <button
              onClick={() => handleApprove(profile.id)}
              disabled={isPending && approvingId === profile.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
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
