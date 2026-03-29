import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { StatusBadge } from '@/components/StatusBadge'
import type { Profile, Task } from '@/lib/types'
import {
  ROLE_LABELS,
  TEAM_LABELS,
  getInitials,
  formatDate,
  computeStats,
  getRateColor,
  getRateBarColor,
} from '@/lib/utils'
import { User } from 'lucide-react'

export const revalidate = 0

export default async function MePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!currentProfile) redirect('/onboarding')

  // Tasks — role-based visibility
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
    tasksQuery = tasksQuery.eq('assigned_to', user.id)
  } else if (currentProfile.role === 'head') {
    tasksQuery = tasksQuery.eq('team', currentProfile.team)
  }
  // chair: no filter → all tasks

  const { data: tasks } = await tasksQuery

  const myTasks = (tasks ?? []) as Task[]
  const [myStats] = computeStats([currentProfile], myTasks)

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center">
            <User size={16} className="text-blue-400" />
          </div>
          <h1 className="text-lg font-bold text-slate-100">Mein Profil</h1>
        </div>

        {/* Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg font-bold shrink-0">
              {getInitials(currentProfile.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-100">{currentProfile.full_name ?? '—'}</h2>
              <p className="text-sm text-slate-400">
                {currentProfile.role ? ROLE_LABELS[currentProfile.role] : ''}
                {currentProfile.team ? ` · ${TEAM_LABELS[currentProfile.team]}` : ''}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Erledigungs-Quote</span>
              <span className={`text-sm font-bold ${getRateColor(myStats?.rate ?? 0)}`}>
                {myStats?.rate ?? 0}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getRateBarColor(myStats?.rate ?? 0)}`}
                style={{ width: `${myStats?.rate ?? 0}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <div className="text-center">
                <p className="text-slate-400 font-semibold">{myStats?.open ?? 0}</p>
                <p className="text-slate-600">Offen</p>
              </div>
              <div className="text-center">
                <p className={`font-semibold ${(myStats?.pending ?? 0) > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {myStats?.pending ?? 0}
                </p>
                <p className="text-slate-600">Prüfung</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-400 font-semibold">{myStats?.done ?? 0}</p>
                <p className="text-slate-600">Erledigt</p>
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-semibold">{myStats?.total ?? 0}</p>
                <p className="text-slate-600">Gesamt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task list */}
        <h2 className="text-sm font-semibold text-slate-400 mb-3">
          Meine Tasks ({myTasks.length})
        </h2>

        {myTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm bg-slate-900/50 rounded-xl border border-slate-800">
            Noch keine Tasks zugewiesen.
          </div>
        ) : (
          <div className="space-y-2">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 leading-snug truncate">
                    {task.title}
                  </p>
                  <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500">
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
    </AppShell>
  )
}
