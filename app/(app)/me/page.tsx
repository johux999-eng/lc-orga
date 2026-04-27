import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getCurrentProfile } from '@/lib/auth'
import { StatusBadge } from '@/components/StatusBadge'
import type { Task } from '@/lib/types'
import {
  ROLE_LABELS,
  TEAM_LABELS,
  ASSIGNEE_GROUPS,
  getInitials,
  formatDate,
  computeStats,
  getRateColor,
  getRateBarColor,
  isProfileInGroup,
  isTaskVisibleForProfile,
} from '@/lib/utils'
import { User } from 'lucide-react'

export const revalidate = 0

export default async function MePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const currentProfile = await getCurrentProfile()
  if (!currentProfile) redirect('/onboarding')

  const supabase = await createClient()

  let tasksQuery = supabase
    .from('tasks')
    .select(
      `
      *,
      assigned_profile:profiles!assigned_to(id, full_name, role, team),
      created_profile:profiles!created_by(id, full_name)
    `
    )
    .order('created_at', { ascending: false })

  if (currentProfile.role === 'member') {
    const matchingGroups = ASSIGNEE_GROUPS.filter((g) => isProfileInGroup(g, currentProfile))
    const orParts = [
      `assigned_to.eq.${user.id}`,
      `co_assignees.cs.{${user.id}}`,
      ...(matchingGroups.length > 0 ? [`assigned_group.in.(${matchingGroups.join(',')})`] : []),
    ]
    tasksQuery = tasksQuery.or(orParts.join(','))
  } else if (currentProfile.role === 'head') {
    tasksQuery = tasksQuery.eq('team', currentProfile.team)
  }

  const { data: tasks } = await tasksQuery

  const myTasks = (tasks ?? []).filter((t) =>
    isTaskVisibleForProfile(t as Task, { ...currentProfile, id: user.id })
  ) as Task[]
  const [myStats] = computeStats([currentProfile], myTasks)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-lc-navy/10 flex items-center justify-center">
          <User size={16} className="text-lc-navy" />
        </div>
        <h1 className="text-xl font-medium text-lc-ink">Mein Profil</h1>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-lc-border rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-lc-navy/10 text-lc-navy flex items-center justify-center text-lg font-bold shrink-0">
            {getInitials(currentProfile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-lc-ink">{currentProfile.full_name ?? '—'}</h2>
            <p className="text-[13px] text-lc-muted">
              {currentProfile.role ? ROLE_LABELS[currentProfile.role] : ''}
              {currentProfile.team ? ` · ${TEAM_LABELS[currentProfile.team]}` : ''}
            </p>
            <p className="text-[11px] text-lc-faint mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-lc-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-lc-faint">Erledigungs-Quote</span>
            <span className={`text-[13px] font-bold ${getRateColor(myStats?.rate ?? 0)}`}>
              {myStats?.rate ?? 0}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-lc-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getRateBarColor(myStats?.rate ?? 0)}`}
              style={{ width: `${myStats?.rate ?? 0}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-[11px]">
            <div className="text-center">
              <p className="text-lc-muted font-semibold">{myStats?.open ?? 0}</p>
              <p className="text-lc-faint">Offen</p>
            </div>
            <div className="text-center">
              <p className={`font-semibold ${(myStats?.pending ?? 0) > 0 ? 'text-amber-600' : 'text-lc-muted'}`}>
                {myStats?.pending ?? 0}
              </p>
              <p className="text-lc-faint">Prüfung</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-600 font-semibold">{myStats?.done ?? 0}</p>
              <p className="text-lc-faint">Erledigt</p>
            </div>
            <div className="text-center">
              <p className="text-lc-secondary font-semibold">{myStats?.total ?? 0}</p>
              <p className="text-lc-faint">Gesamt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task list */}
      <h2 className="font-didot text-[12px] font-bold text-lc-muted uppercase tracking-wider mb-3">
        Meine Tasks ({myTasks.length})
      </h2>

      {myTasks.length === 0 ? (
        <div className="text-center py-12 text-lc-faint text-[13px] bg-white rounded-xl border border-lc-border">
          Noch keine Tasks zugewiesen.
        </div>
      ) : (
        <div className="space-y-2">
          {myTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-lc-border rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-lc-ink leading-snug truncate">
                  {task.title}
                </p>
                <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-lc-faint">
                  <span>{formatDate(task.deadline)}</span>
                  {task.proof_url && (
                    <span className="italic truncate">✓ {task.proof_url}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge task={task} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
