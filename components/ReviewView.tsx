'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { Task, Profile } from '@/lib/types'
import { TEAM_LABELS, ROLE_LABELS, formatDate } from '@/lib/utils'
import { approveTask, rejectTask } from '@/lib/actions'
import { StatusBadge } from './StatusBadge'

function RejectModal({
  task,
  onClose,
}: {
  task: Task
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleReject() {
    setError(null)
    startTransition(async () => {
      try {
        await rejectTask(task.id)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Zurückweisen')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-lc-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-lc-border shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-lc-border">
          <h2 className="text-[15px] font-semibold text-lc-ink">Task zurückweisen</h2>
          <button onClick={onClose} className="text-lc-faint hover:text-lc-ink text-xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-lc-cream rounded-lg p-3 border border-lc-border">
            <p className="text-[13px] font-medium text-lc-ink">{task.title}</p>
            <p className="text-[11px] text-lc-faint mt-0.5">
              {task.assigned_profile?.full_name} · {task.assigned_profile?.role ? ROLE_LABELS[task.assigned_profile.role] : ''}
            </p>
          </div>
          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-[13px] font-medium text-lc-muted border border-lc-border hover:bg-lc-hover transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleReject}
              disabled={isPending}
              className="flex-1 py-2 rounded-lg text-[13px] font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Zurückweisen…' : 'Zurückweisen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  tasks: Task[]
  currentProfile: Profile
}

export function ReviewView({ tasks, currentProfile }: Props) {
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectTask_, setRejectTask] = useState<Task | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  function handleApprove(task: Task) {
    setApprovingId(task.id)
    setErrors((prev) => ({ ...prev, [task.id]: '' }))
    startTransition(async () => {
      try {
        await approveTask(task.id)
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [task.id]: err instanceof Error ? err.message : 'Fehler',
        }))
      } finally {
        setApprovingId(null)
      }
    })
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
          <CheckCircle size={24} className="text-emerald-600" />
        </div>
        <p className="text-lc-secondary font-medium">Keine offenen Reviews</p>
        <p className="text-lc-faint text-[13px] mt-1">Alle Tasks sind genehmigt.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-lc-border rounded-xl p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-lc-ink">{task.title}</h3>
                  <StatusBadge task={task} />
                </div>
                {task.description && (
                  <p className="text-[13px] text-lc-muted leading-relaxed">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-[11px] text-lc-faint">
                  <span>
                    <span className="text-lc-secondary font-medium">
                      {task.assigned_profile?.full_name ?? '—'}
                    </span>{' '}
                    ({task.assigned_profile?.role ? ROLE_LABELS[task.assigned_profile.role] : '?'}
                    {task.assigned_profile?.team
                      ? ` · ${TEAM_LABELS[task.assigned_profile.team]}`
                      : ''}
                    )
                  </span>
                  <span>Fällig: {formatDate(task.deadline)}</span>
                  {task.proof_url && (
                    <span className="italic text-lc-muted">✓ {task.proof_url}</span>
                  )}
                </div>
                {errors[task.id] && (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                    <AlertCircle size={11} />
                    {errors[task.id]}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setRejectTask(task)}
                  disabled={isPending && approvingId === task.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  <XCircle size={14} />
                  Ablehnen
                </button>
                <button
                  onClick={() => handleApprove(task)}
                  disabled={isPending && approvingId === task.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle size={14} />
                  {approvingId === task.id ? 'Lädt…' : 'Genehmigen'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rejectTask_ && (
        <RejectModal task={rejectTask_} onClose={() => setRejectTask(null)} />
      )}
    </>
  )
}
