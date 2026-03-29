import type { TaskStatus, Team, Role, Task, Profile, UserStats } from './types'

export const TEAM_LABELS: Record<Team, string> = {
  'Sponsoring': 'Sponsoring',
  'Speaker': 'Speaker',
  'Public Relations': 'Public Relations',
  'Technik/Mobility': 'Technik/Mobility',
  'Event': 'Event',
  'Chairs': 'Chairs',
}

export const ROLE_LABELS: Record<Role, string> = {
  chair: 'Chair',
  head: 'Head',
  member: 'Member',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Offen',
  pending_review: 'Zur Prüfung',
  done: 'Erledigt',
}

export const TEAMS: Team[] = [
  'Sponsoring',
  'Speaker',
  'Public Relations',
  'Technik/Mobility',
  'Event',
]

export const ROLES: Role[] = ['chair', 'head', 'member']

export function isOverdue(task: Pick<Task, 'status' | 'deadline'>): boolean {
  if (task.status !== 'open') return false
  if (!task.deadline) return false
  return new Date(task.deadline) < new Date()
}

export function getStatusBadgeClass(task: Pick<Task, 'status' | 'deadline'>): string {
  if (task.status === 'done') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (task.status === 'pending_review') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  if (isOverdue(task)) return 'bg-red-500/10 text-red-400 border-red-500/20'
  return 'bg-slate-700/50 text-slate-400 border-slate-600/30'
}

export function getStatusLabel(task: Pick<Task, 'status' | 'deadline'>): string {
  if (task.status === 'done') return 'Erledigt'
  if (task.status === 'pending_review') return 'Zur Prüfung'
  if (isOverdue(task)) return 'Überfällig'
  return 'Offen'
}

export function getRateColor(rate: number): string {
  if (rate >= 80) return 'text-emerald-400'
  if (rate >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function getRateBarColor(rate: number): string {
  if (rate >= 80) return 'bg-emerald-500'
  if (rate >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function computeStats(profiles: Profile[], tasks: Task[]): UserStats[] {
  return profiles.map((profile) => {
    const profileTasks = tasks.filter((t) => t.assigned_to === profile.id)
    const open = profileTasks.filter((t) => t.status === 'open').length
    const overdue = profileTasks.filter((t) => isOverdue(t)).length
    const pending = profileTasks.filter((t) => t.status === 'pending_review').length
    const done = profileTasks.filter((t) => t.status === 'done').length
    const total = open + pending + done
    const rate = total > 0 ? Math.round((done / total) * 100) : 0
    return { profile, open, overdue, pending, done, total, rate }
  })
}
