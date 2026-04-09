'use client'

import { useState, useTransition } from 'react'
import { Plus, Search, Pencil, Trash2, UserCheck, CheckCircle, XCircle } from 'lucide-react'
import type { Task, Profile, TaskStatus, Team } from '@/lib/types'
import {
  TEAM_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  TEAMS,
  ASSIGNEE_GROUPS,
  GROUP_LABELS,
  isProfileInGroup,
  formatDate,
} from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import {
  createTask,
  submitTask,
  updateTask,
  deleteTask,
  reassignTask,
  approveTask,
  rejectTask,
} from '@/lib/actions'

// ── Edit Task Modal ────────────────────────────────────────────────────────────

function EditTaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateTask(task.id, formData)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Bearbeiten')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">Task bearbeiten</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Titel *</label>
            <input
              name="title"
              required
              defaultValue={task.title}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Beschreibung</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={task.description ?? ''}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500/70 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Fällig am *</label>
            <input
              name="deadline"
              type="date"
              required
              defaultValue={task.deadline ?? ''}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500/70 [color-scheme:dark]"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors">
              Abbrechen
            </button>
            <button type="submit" disabled={isPending} className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 transition-colors">
              {isPending ? 'Speichern…' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete Modal ───────────────────────────────────────────────────────────────

function DeleteModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      try {
        await deleteTask(task.id)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Löschen')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">Task löschen</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-lg">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-200">{task.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {task.assigned_profile?.full_name ?? '—'} · {formatDate(task.deadline)}
            </p>
          </div>
          <p className="text-sm text-slate-400">Dieser Task wird unwiderruflich gelöscht.</p>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors">
              Abbrechen
            </button>
            <button onClick={handleDelete} disabled={isPending} className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 transition-colors">
              {isPending ? 'Löschen…' : 'Löschen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reassign Modal ─────────────────────────────────────────────────────────────

function ReassignModal({
  task,
  profiles,
  onClose,
}: {
  task: Task
  profiles: Profile[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [assignMode, setAssignMode] = useState<'persons' | 'group'>(
    task.assigned_group ? 'group' : 'persons'
  )
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(
    task.assigned_to ? [task.assigned_to, ...(task.co_assignees ?? [])] : (task.co_assignees ?? [])
  )
  const [selectedGroup, setSelectedGroup] = useState(task.assigned_group ?? '')

  function togglePerson(id: string) {
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleReassign() {
    if (assignMode === 'persons' && selectedPersonIds.length === 0) {
      setError('Bitte mindestens eine Person auswählen')
      return
    }
    if (assignMode === 'group' && !selectedGroup) {
      setError('Bitte eine Gruppe auswählen')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await reassignTask(
          task.id,
          assignMode === 'persons' ? selectedPersonIds : [],
          assignMode === 'group' ? selectedGroup : null
        )
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Zuweisen')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">Neu zuweisen</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-lg">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-200">{task.title}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Zuweisen an *</label>
            <div className="flex gap-1 mb-2 p-0.5 bg-slate-800 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setAssignMode('persons')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  assignMode === 'persons' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Person(en)
              </button>
              <button
                type="button"
                onClick={() => setAssignMode('group')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  assignMode === 'group' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gruppe
              </button>
            </div>
            {assignMode === 'persons' ? (
              <div className="max-h-48 overflow-y-auto border border-slate-700 rounded-lg divide-y divide-slate-800">
                {profiles.map((p) => (
                  <label key={p.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPersonIds.includes(p.id)}
                      onChange={() => togglePerson(p.id)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-slate-200">
                      {p.full_name}
                      <span className="text-xs text-slate-500 ml-1">
                        ({p.role ? ROLE_LABELS[p.role] : '?'}{p.team ? ` · ${TEAM_LABELS[p.team]}` : ''})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500/70"
              >
                <option value="">— Gruppe wählen —</option>
                {ASSIGNEE_GROUPS.map((g) => (
                  <option key={g} value={g}>{GROUP_LABELS[g]}</option>
                ))}
              </select>
            )}
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors">
              Abbrechen
            </button>
            <button
              onClick={handleReassign}
              disabled={isPending}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Zuweisen…' : 'Zuweisen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Create Task Modal ──────────────────────────────────────────────────────────

function CreateTaskModal({
  profiles,
  currentProfile,
  onClose,
}: {
  profiles: Profile[]
  currentProfile: Profile
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | ''>(
    currentProfile.role === 'head' ? (currentProfile.team ?? '') : ''
  )
  const [assignMode, setAssignMode] = useState<'persons' | 'group'>('persons')

  const assignableProfiles = profiles.filter((p) => {
    if (currentProfile.role === 'head') return p.team === currentProfile.team
    return true
  })

  // Heads can only assign groups that contain members of their own team
  const availableGroups = ASSIGNEE_GROUPS.filter((g) => {
    if (currentProfile.role === 'head') {
      return isProfileInGroup(g, { role: 'member', team: currentProfile.team })
    }
    return true
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    if (assignMode === 'persons') {
      const assignees = formData.getAll('assigned_to')
      if (!assignees.length) {
        setError('Bitte mindestens eine Person auswählen')
        return
      }
    } else {
      if (!formData.get('assigned_group')) {
        setError('Bitte eine Gruppe auswählen')
        return
      }
    }
    startTransition(async () => {
      try {
        await createTask(formData)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">Neuen Task erstellen</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors text-lg leading-none">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Titel *</label>
            <input
              name="title"
              required
              placeholder="Task-Titel…"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Beschreibung</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Optionale Details…"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/70 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Team *</label>
              {currentProfile.role === 'head' ? (
                <>
                  <input type="hidden" name="team" value={currentProfile.team ?? ''} />
                  <div className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-400">
                    {currentProfile.team ? TEAM_LABELS[currentProfile.team] : '—'}
                  </div>
                </>
              ) : (
                <select
                  name="team"
                  required
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value as Team)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500/70"
                >
                  <option value="">— Team wählen —</option>
                  {TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {TEAM_LABELS[t]}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Fällig am *</label>
              <input
                name="deadline"
                type="date"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500/70 [color-scheme:dark]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Zuweisen an *</label>
            <div className="flex gap-1 mb-2 p-0.5 bg-slate-800 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setAssignMode('persons')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  assignMode === 'persons' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Person(en)
              </button>
              <button
                type="button"
                onClick={() => setAssignMode('group')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  assignMode === 'group' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gruppe
              </button>
            </div>
            <input type="hidden" name="assign_mode" value={assignMode} />
            {assignMode === 'persons' ? (
              <div className="max-h-48 overflow-y-auto border border-slate-700 rounded-lg divide-y divide-slate-800">
                {assignableProfiles.map((p) => (
                  <label key={p.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800/70 cursor-pointer">
                    <input
                      type="checkbox"
                      name="assigned_to"
                      value={p.id}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-slate-200">
                      {p.full_name}
                      <span className="text-xs text-slate-500 ml-1">
                        ({p.role ? ROLE_LABELS[p.role] : '?'}{p.team ? ` · ${TEAM_LABELS[p.team]}` : ''})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <select
                name="assigned_group"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500/70"
              >
                <option value="">— Gruppe wählen —</option>
                {availableGroups.map((g) => (
                  <option key={g} value={g}>{GROUP_LABELS[g]}</option>
                ))}
              </select>
            )}
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Erstelle…' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Submit Modal ───────────────────────────────────────────────────────────────

function SubmitModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [proofUrl, setProofUrl] = useState('')

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      try {
        await submitTask(task.id, proofUrl || undefined)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Einreichen')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">Task einreichen</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors text-lg">
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-200">{task.title}</p>
            {task.description && (
              <p className="text-xs text-slate-500 mt-1">{task.description}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Anmerkung zur Erledigung <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="z.B. Mail an Sponsor X gesendet, Bestätigung erhalten…"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/70 resize-none"
            />
            <p className="text-xs text-slate-600 text-right mt-1">{proofUrl.length}/500</p>
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Einreichen…' : 'Einreichen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main TasksView ─────────────────────────────────────────────────────────────

interface Props {
  tasks: Task[]
  profiles: Profile[]
  currentProfile: Profile
}

export function TasksView({ tasks, profiles, currentProfile }: Props) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterTeam, setFilterTeam] = useState<Team | 'all'>('all')
  const [filterMine, setFilterMine] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitTask_, setSubmitTask] = useState<Task | null>(null)
  const [editTask_, setEditTask] = useState<Task | null>(null)
  const [deleteTask_, setDeleteTask] = useState<Task | null>(null)
  const [reassignTask_, setReassignTask] = useState<Task | null>(null)

  const canCreate = currentProfile.role === 'chair' || currentProfile.role === 'head'
  const isChair = currentProfile.role === 'chair'

  const filtered = tasks.filter((t) => {
    if (filterMine) {
      const isAssignedToMe =
        t.assigned_to === currentProfile.id ||
        (t.co_assignees ?? []).includes(currentProfile.id) ||
        (t.assigned_group ? isProfileInGroup(t.assigned_group, currentProfile) : false)
      if (!isAssignedToMe) return false
    }
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterTeam !== 'all' && t.team !== filterTeam) return false
    if (search) {
      const q = search.toLowerCase()
      const groupLabel = t.assigned_group ? (GROUP_LABELS[t.assigned_group] ?? t.assigned_group) : ''
      if (
        !t.title.toLowerCase().includes(q) &&
        !t.assigned_profile?.full_name?.toLowerCase().includes(q) &&
        !groupLabel.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  return (
    <>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche…"
            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">Alle Status</option>
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          {isChair && (
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value as Team | 'all')}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
            >
              <option value="all">Alle Teams</option>
              {TEAMS.map((t) => (
                <option key={t} value={t}>
                  {TEAM_LABELS[t]}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setFilterMine((v) => !v)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              filterMine
                ? 'bg-blue-600/20 text-blue-400 border-blue-600/30'
                : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-slate-200'
            }`}
          >
            Meine Tasks
          </button>

          {canCreate && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              <Plus size={14} />
              Neuer Task
            </button>
          )}
        </div>
      </div>

      {/* Tasks — desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">
                Titel
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Zugewiesen an
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Fällig
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Aktion
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((task) => (
              <TaskTableRow
                key={task.id}
                task={task}
                currentProfile={currentProfile}
                onSubmit={() => setSubmitTask(task)}
                onEdit={() => setEditTask(task)}
                onDelete={() => setDeleteTask(task)}
                onReassign={() => setReassignTask(task)}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-slate-500 text-sm">
            Keine Tasks gefunden.
          </p>
        )}
      </div>

      {/* Tasks — mobile cards */}
      <div className="sm:hidden space-y-2">
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            currentProfile={currentProfile}
            onSubmit={() => setSubmitTask(task)}
            onEdit={() => setEditTask(task)}
            onDelete={() => setDeleteTask(task)}
            onReassign={() => setReassignTask(task)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-10 text-slate-500 text-sm">Keine Tasks gefunden.</p>
        )}
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="mt-3 text-xs text-slate-600 text-right">
          {filtered.length} von {tasks.length} Tasks
        </p>
      )}

      {/* Modals */}
      {createOpen && (
        <CreateTaskModal
          profiles={profiles}
          currentProfile={currentProfile}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {submitTask_ && (
        <SubmitModal task={submitTask_} onClose={() => setSubmitTask(null)} />
      )}
      {editTask_ && (
        <EditTaskModal task={editTask_} onClose={() => setEditTask(null)} />
      )}
      {deleteTask_ && (
        <DeleteModal task={deleteTask_} onClose={() => setDeleteTask(null)} />
      )}
      {reassignTask_ && (
        <ReassignModal
          task={reassignTask_}
          profiles={profiles}
          onClose={() => setReassignTask(null)}
        />
      )}
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TaskTableRow({
  task,
  currentProfile,
  onSubmit,
  onEdit,
  onDelete,
  onReassign,
}: {
  task: Task
  currentProfile: Profile
  onSubmit: () => void
  onEdit: () => void
  onDelete: () => void
  onReassign: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<'approve' | 'reject' | null>(null)

  const isChair = currentProfile.role === 'chair'
  const isAssignedToMe =
    task.assigned_to === currentProfile.id ||
    (task.co_assignees ?? []).includes(currentProfile.id) ||
    (task.assigned_group ? isProfileInGroup(task.assigned_group, currentProfile) : false)
  const canSubmit = isAssignedToMe && task.status === 'open'
  const canReview =
    task.status === 'pending_review' &&
    (isChair ||
      (currentProfile.role === 'head' &&
        task.team === currentProfile.team &&
        task.assigned_profile?.role === 'member'))

  function handleApprove() {
    setActionId('approve')
    startTransition(async () => {
      await approveTask(task.id).catch(() => {})
      setActionId(null)
    })
  }

  function handleReject() {
    setActionId('reject')
    startTransition(async () => {
      await rejectTask(task.id).catch(() => {})
      setActionId(null)
    })
  }

  return (
    <tr className="hover:bg-slate-800/20 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-slate-200 leading-snug">{task.title}</p>
          {task.description && (
            <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{task.description}</p>
          )}
          {task.proof_url && (
            <p className="text-xs text-slate-500 italic truncate max-w-xs mt-0.5">✓ {task.proof_url}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {task.assigned_group ? (
          <span className="text-slate-300">{GROUP_LABELS[task.assigned_group] ?? task.assigned_group}</span>
        ) : (
          <div>
            <span className="text-slate-300">{task.assigned_profile?.full_name ?? '—'}</span>
            {(task.co_assignees ?? []).length > 0 && (
              <span className="ml-1 text-xs text-slate-500">+{task.co_assignees.length}</span>
            )}
            {task.assigned_profile?.role && (
              <span className="ml-1 text-xs text-slate-600">
                {ROLE_LABELS[task.assigned_profile.role]}
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-slate-400">{formatDate(task.deadline)}</td>
      <td className="px-4 py-3">
        <StatusBadge task={task} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {canSubmit && (
            <button
              onClick={onSubmit}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/20 hover:bg-blue-600/30 transition-colors"
            >
              Einreichen
            </button>
          )}
          {canReview && (
            <>
              <button
                onClick={handleApprove}
                disabled={isPending}
                title="Genehmigen"
                className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-50 transition-colors"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                title="Zurückweisen"
                className="p-1.5 rounded-md text-red-400 hover:bg-red-400/10 disabled:opacity-50 transition-colors"
              >
                <XCircle size={14} />
              </button>
            </>
          )}
          {isChair && (
            <>
              <button
                onClick={onReassign}
                title="Neu zuweisen"
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 transition-colors"
              >
                <UserCheck size={14} />
              </button>
              <button
                onClick={onEdit}
                title="Bearbeiten"
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={onDelete}
                title="Löschen"
                className="p-1.5 rounded-md text-red-400/60 hover:bg-red-400/10 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

function TaskCard({
  task,
  currentProfile,
  onSubmit,
  onEdit,
  onDelete,
  onReassign,
}: {
  task: Task
  currentProfile: Profile
  onSubmit: () => void
  onEdit: () => void
  onDelete: () => void
  onReassign: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const isChair = currentProfile.role === 'chair'
  const isAssignedToMe =
    task.assigned_to === currentProfile.id ||
    (task.co_assignees ?? []).includes(currentProfile.id) ||
    (task.assigned_group ? isProfileInGroup(task.assigned_group, currentProfile) : false)
  const canSubmit = isAssignedToMe && task.status === 'open'
  const canReview =
    task.status === 'pending_review' &&
    (isChair ||
      (currentProfile.role === 'head' &&
        task.team === currentProfile.team &&
        task.assigned_profile?.role === 'member'))

  function handleApprove() {
    startTransition(async () => {
      await approveTask(task.id).catch(() => {})
    })
  }

  function handleReject() {
    startTransition(async () => {
      await rejectTask(task.id).catch(() => {})
    })
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-100 leading-snug">{task.title}</p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
          )}
          {task.proof_url && (
            <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-2">✓ {task.proof_url}</p>
          )}
        </div>
        <StatusBadge task={task} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {task.assigned_group
            ? GROUP_LABELS[task.assigned_group] ?? task.assigned_group
            : task.assigned_profile?.full_name ?? '—'}
          {!task.assigned_group && (task.co_assignees ?? []).length > 0 && (
            <span className="ml-0.5">+{task.co_assignees.length}</span>
          )}
          {' · '}{formatDate(task.deadline)}
        </span>
        <div className="flex items-center gap-1.5">
          {canSubmit && (
            <button
              onClick={onSubmit}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600 text-white"
            >
              Einreichen
            </button>
          )}
          {canReview && (
            <>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-50 transition-colors"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="p-1.5 rounded-md text-red-400 hover:bg-red-400/10 disabled:opacity-50 transition-colors"
              >
                <XCircle size={14} />
              </button>
            </>
          )}
          {isChair && (
            <>
              <button onClick={onReassign} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 transition-colors">
                <UserCheck size={14} />
              </button>
              <button onClick={onEdit} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-md text-red-400/60 hover:bg-red-400/10 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
