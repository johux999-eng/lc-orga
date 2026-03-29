import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { DashboardTable } from '@/components/DashboardTable'
import { computeStats, ROLE_LABELS, TEAM_LABELS } from '@/lib/utils'
import type { Profile, Task } from '@/lib/types'
import { LayoutDashboard, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export const revalidate = 0

export default async function DashboardPage() {
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

  // Fetch profiles visible to this user (RLS handles filtering)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, team, role, created_at')
    .order('full_name')

  // Fetch tasks for stats
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, assigned_to, status, deadline')

  const allProfiles = (profiles ?? []) as Profile[]
  const allTasks = (tasks ?? []) as Task[]

  const stats = computeStats(allProfiles, allTasks)

  // Summary cards
  const totalOpen = allTasks.filter((t) => t.status === 'open').length
  const totalPending = allTasks.filter((t) => t.status === 'pending_review').length
  const totalDone = allTasks.filter((t) => t.status === 'done').length
  const totalAll = allTasks.length
  const globalRate = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center">
            <LayoutDashboard size={16} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-tight">Dashboard</h1>
            <p className="text-sm text-slate-500">
              {currentProfile.full_name} · {currentProfile.role ? ROLE_LABELS[currentProfile.role] : ''}
              {currentProfile.team ? ` · ${TEAM_LABELS[currentProfile.team]}` : ''}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <SummaryCard
            icon={<Clock size={16} className="text-slate-400" />}
            label="Offen"
            value={totalOpen}
            color="text-slate-300"
            bg="bg-slate-800/50"
          />
          <SummaryCard
            icon={<AlertCircle size={16} className="text-amber-400" />}
            label="Zur Prüfung"
            value={totalPending}
            color="text-amber-300"
            bg="bg-amber-500/5"
          />
          <SummaryCard
            icon={<CheckCircle size={16} className="text-emerald-400" />}
            label="Erledigt"
            value={totalDone}
            color="text-emerald-300"
            bg="bg-emerald-500/5"
          />
          <SummaryCard
            icon={
              <span className={`text-base font-bold ${globalRate >= 80 ? 'text-emerald-400' : globalRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {globalRate}%
              </span>
            }
            label="Gesamt-Quote"
            value={`${totalDone}/${totalAll}`}
            color={globalRate >= 80 ? 'text-emerald-300' : globalRate >= 50 ? 'text-amber-300' : 'text-red-300'}
            bg="bg-blue-500/5"
          />
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-slate-300">
            {currentProfile.role === 'chair'
              ? 'Alle Organisator:innen'
              : currentProfile.role === 'head'
              ? 'Dein Team'
              : 'Deine Übersicht'}
          </h2>
          <span className="text-xs text-slate-600">({allProfiles.length})</span>
        </div>

        <DashboardTable stats={stats} currentUserId={user.id} />
      </div>
    </AppShell>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  bg: string
}) {
  return (
    <div className={`${bg} border border-slate-800 rounded-xl p-3.5 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}
