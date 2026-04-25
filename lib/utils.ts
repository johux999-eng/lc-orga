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
  'Chairs',
]

export const ROLES: Role[] = ['chair', 'head', 'member']

export const ASSIGNEE_GROUPS: string[] = [
  'heads_sponsoring',
  'heads_speaker',
  'heads_pr',
  'heads_technik',
  'heads_event',
  'heads_all',
  'members_sponsoring',
  'members_speaker',
  'members_pr',
  'members_technik',
  'members_event',
  'members_all',
  'all',
]

export const GROUP_LABELS: Record<string, string> = {
  heads_sponsoring: 'Heads Sponsoring',
  heads_speaker: 'Heads Speaker',
  heads_pr: 'Heads Public Relations',
  heads_technik: 'Heads Technik/Mobility',
  heads_event: 'Heads Event',
  heads_all: 'Alle Heads',
  members_sponsoring: 'Members Sponsoring',
  members_speaker: 'Members Speaker',
  members_pr: 'Members Public Relations',
  members_technik: 'Members Technik/Mobility',
  members_event: 'Members Event',
  members_all: 'Alle Members',
  all: 'Alle',
}

const GROUP_CRITERIA: Record<string, { role?: Role; team?: Team }> = {
  heads_sponsoring: { role: 'head', team: 'Sponsoring' },
  heads_speaker: { role: 'head', team: 'Speaker' },
  heads_pr: { role: 'head', team: 'Public Relations' },
  heads_technik: { role: 'head', team: 'Technik/Mobility' },
  heads_event: { role: 'head', team: 'Event' },
  heads_all: { role: 'head' },
  members_sponsoring: { role: 'member', team: 'Sponsoring' },
  members_speaker: { role: 'member', team: 'Speaker' },
  members_pr: { role: 'member', team: 'Public Relations' },
  members_technik: { role: 'member', team: 'Technik/Mobility' },
  members_event: { role: 'member', team: 'Event' },
  members_all: { role: 'member' },
  all: {},
}

export function isProfileInGroup(
  group: string,
  profile: { role: Role | null; team: Team | null }
): boolean {
  const criteria = GROUP_CRITERIA[group]
  if (!criteria) return false
  if (criteria.role && profile.role !== criteria.role) return false
  if (criteria.team && profile.team !== criteria.team) return false
  return true
}

function isHeadGroup(group: string): boolean {
  return group.startsWith('heads_')
}

export function isTaskVisibleForProfile(
  task: Pick<Task, 'assigned_to' | 'co_assignees' | 'assigned_group' | 'status' | 'submitted_by'>,
  profile: { id: string; role: Role | null; team: Team | null }
): boolean {
  if (task.assigned_to === profile.id || (task.co_assignees ?? []).includes(profile.id)) {
    return true
  }
  if (!task.assigned_group) return false
  if (!isProfileInGroup(task.assigned_group, profile)) return false
  if (task.status === 'open') return true
  // pending_review / done group tasks
  if (isHeadGroup(task.assigned_group)) return true
  return task.submitted_by === profile.id
}

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
    const profileTasks = tasks.filter((t) => isTaskVisibleForProfile(t, profile))
    const open = profileTasks.filter((t) => t.status === 'open').length
    const overdue = profileTasks.filter((t) => isOverdue(t)).length
    const pending = profileTasks.filter((t) => t.status === 'pending_review').length
    const done = profileTasks.filter((t) => t.status === 'done').length
    const total = open + pending + done
    const rate = total > 0 ? Math.round((done / total) * 100) : 0
    return { profile, open, overdue, pending, done, total, rate }
  })
}
