import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getCurrentProfile } from '@/lib/auth'
import { DashboardTable } from '@/components/DashboardTable'
import { computeStats, ROLE_LABELS, TEAM_LABELS } from '@/lib/utils'
import type { Profile, Task } from '@/lib/types'
import { LayoutDashboard, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export const revalidate = 0

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const currentProfile = await getCurrentProfile()
  if (!currentProfile) redirect('/onboarding')

  const supabase = await createClient()

  const [profilesResult, tasksResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, team, role, created_at')
      .order('full_name'),
    supabase
      .from('tasks')
      .select('id, assigned_to, co_assignees, assigned_group, status, deadline, submitted_by'),
  ])

  const allProfiles = (profilesResult.data ?? []) as Profile[]
  const allTasks = (tasksResult.data ?? []) as Task[]

  const stats = computeStats(allProfiles, allTasks)

  const totalOpen = allTasks.filter((t) => t.status === 'open').length
  const totalPending = allTasks.filter((t) => t.status === 'pending_review').length
  const totalDone = allTasks.filter((t) => t.status === 'done').length
  const totalAll = allTasks.length
  const globalRate = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-lc-navy/10 flex items-center justify-center">
          <LayoutDashboard size={16} className="text-lc-navy" />
        </div>
        <div>
          <h1 className="text-xl font-medium text-lc-ink leading-tight">Dashboard</h1>
          <p className="text-[13px] text-lc-faint">
            {currentProfile.full_name} · {currentProfile.role ? ROLE_LABELS[currentProfile.role] : ''}
            {currentProfile.team ? ` · ${TEAM_LABELS[currentProfile.team]}` : ''}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          icon={<Clock size={15} className="text-lc-muted" />}
          label="Offen"
          value={totalOpen}
          color="text-lc-secondary"
          bg="bg-white"
        />
        <SummaryCard
          icon={<AlertCircle size={15} className="text-amber-500" />}
          label="Zur Prüfung"
          value={totalPending}
          color="text-amber-600"
          bg="bg-amber-50"
          borderColor="border-amber-100"
        />
        <SummaryCard
          icon={<CheckCircle size={15} className="text-emerald-600" />}
          label="Erledigt"
          value={totalDone}
          color="text-emerald-700"
          bg="bg-emerald-50"
          borderColor="border-emerald-100"
        />
        <SummaryCard
          icon={
            <span className={`text-sm font-bold ${globalRate >= 80 ? 'text-emerald-600' : globalRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {globalRate}%
            </span>
          }
          label="Gesamt-Quote"
          value={`${totalDone}/${totalAll}`}
          color={globalRate >= 80 ? 'text-emerald-700' : globalRate >= 50 ? 'text-amber-600' : 'text-red-600'}
          bg="bg-lc-navy/5"
          borderColor="border-lc-navy/10"
        />
      </div>

      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-didot text-[12px] font-bold text-lc-muted uppercase tracking-wider">
          Alle Mitglieder
        </h2>
        <span className="text-[11px] text-lc-faint">({allProfiles.length})</span>
      </div>

      <DashboardTable stats={stats} currentUserId={user.id} />
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  bg,
  borderColor = 'border-lc-border',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  bg: string
  borderColor?: string
}) {
  return (
    <div className={`${bg} border ${borderColor} rounded-xl p-3.5 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-lc-faint">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}
