'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Role, Team } from '@/lib/types'
import { isProfileInGroup } from '@/lib/utils'

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signInWithMagicLink(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
    },
  })
  if (error) throw new Error(error.message)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const full_name = (formData.get('full_name') as string).trim()
  const role = formData.get('role') as Role
  const team = formData.get('team') as Team

  if (!full_name || !role || !team) throw new Error('Name, Rolle und Team sind erforderlich')

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name,
    role,
    team,
  })

  if (error) throw new Error(error.message)
  redirect('/waiting')
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team')
    .eq('id', user.id)
    .single()

  if (!profile || !['head', 'chair'].includes(profile.role)) {
    throw new Error('Nur Heads und Chairs können Tasks erstellen')
  }

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const team = formData.get('team') as Team
  const deadline = (formData.get('deadline') as string | null) || null
  const assign_mode = (formData.get('assign_mode') as string) || 'persons'

  if (!title || !team || !deadline) {
    throw new Error('Titel, Team und Deadline sind erforderlich')
  }

  let assigned_to: string | null = null
  let co_assignees: string[] = []
  let assigned_group: string | null = null

  if (assign_mode === 'group') {
    assigned_group = (formData.get('assigned_group') as string | null)?.trim() || null
    if (!assigned_group) throw new Error('Gruppe ist erforderlich')
  } else {
    const assignees = (formData.getAll('assigned_to') as string[]).filter(Boolean)
    if (!assignees.length) throw new Error('Zuweisung ist erforderlich')
    assigned_to = assignees[0]
    co_assignees = assignees.slice(1)
  }

  const { error } = await supabase.from('tasks').insert({
    title,
    description,
    assigned_to,
    co_assignees,
    assigned_group,
    team,
    deadline,
    created_by: user.id,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/tasks')
}

export async function submitTask(taskId: string, proofUrl?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const [{ data: task }, { data: submitterProfile }] = await Promise.all([
    supabase
      .from('tasks')
      .select('assigned_to, co_assignees, assigned_group')
      .eq('id', taskId)
      .single(),
    supabase
      .from('profiles')
      .select('role, team')
      .eq('id', user.id)
      .single(),
  ])

  if (!task) throw new Error('Task nicht gefunden')
  if (!submitterProfile) throw new Error('Profil nicht gefunden')

  const coAssignees = (task.co_assignees as string[]) ?? []
  const isAssigned =
    task.assigned_to === user.id ||
    coAssignees.includes(user.id) ||
    (task.assigned_group ? isProfileInGroup(task.assigned_group, submitterProfile) : false)

  if (!isAssigned) throw new Error('Nicht berechtigt')

  const assigneeRole = submitterProfile.role
  const newStatus = assigneeRole === 'chair' ? 'done' : 'pending_review'
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('tasks')
    .update({
      status: newStatus,
      proof_url: proofUrl || null,
      submitted_at: now,
      ...(newStatus === 'done' ? { reviewed_by: user.id, completed_at: now } : {}),
    })
    .eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath('/tasks')
  revalidatePath('/me')
  revalidatePath('/review')
  revalidatePath('/')
}

export async function approveTask(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const { data: approver } = await supabase
    .from('profiles')
    .select('role, team')
    .eq('id', user.id)
    .single()

  if (!approver || !['head', 'chair'].includes(approver.role)) {
    throw new Error('Nicht berechtigt')
  }

  // Fetch task + assignee info
  const { data: task } = await supabase
    .from('tasks')
    .select('id, assigned_profile:profiles!assigned_to(role, team)')
    .eq('id', taskId)
    .eq('status', 'pending_review')
    .single()

  if (!task) throw new Error('Task nicht gefunden oder nicht zur Prüfung')

  const assignee = task.assigned_profile as unknown as { role: string; team: string } | null
  if (!assignee) throw new Error('Kein Assignee gefunden')

  // Validate approval rights
  if (approver.role === 'head') {
    if (assignee.role !== 'member' || assignee.team !== approver.team) {
      throw new Error('Als Head kannst du nur Member-Tasks deines Teams genehmigen')
    }
  }
  // Chair can approve any head task (role=head) — RLS handles visibility

  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'done',
      reviewed_by: user.id,
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath('/review')
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function rejectTask(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const { data: approver } = await supabase
    .from('profiles')
    .select('role, team')
    .eq('id', user.id)
    .single()

  if (!approver || !['head', 'chair'].includes(approver.role)) {
    throw new Error('Nicht berechtigt')
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'open' })
    .eq('id', taskId)
    .eq('status', 'pending_review')

  if (error) throw new Error(error.message)

  revalidatePath('/review')
  revalidatePath('/tasks')
  revalidatePath('/')
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function approveUser(userId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!actor || actor.role !== 'chair') throw new Error('Nur Chairs können User freischalten')

  const { error } = await supabase
    .from('profiles')
    .update({ approved: true })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

// ── Chair-only task management ────────────────────────────────────────────────

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!actor || actor.role !== 'chair') throw new Error('Nur Chairs können Tasks bearbeiten')

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const deadline = (formData.get('deadline') as string | null) || null

  if (!title || !deadline) throw new Error('Titel und Deadline sind erforderlich')

  const { error } = await supabase
    .from('tasks')
    .update({ title, description, deadline })
    .eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath('/tasks')
  revalidatePath('/me')
  revalidatePath('/review')
  revalidatePath('/')
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!actor || actor.role !== 'chair') throw new Error('Nur Chairs können Tasks löschen')

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath('/tasks')
  revalidatePath('/me')
  revalidatePath('/review')
  revalidatePath('/')
}

export async function reassignTask(taskId: string, assignees: string[], group: string | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht authentifiziert')

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!actor || actor.role !== 'chair') throw new Error('Nur Chairs können Tasks neu zuweisen')

  const assigned_to = group ? null : (assignees[0] ?? null)
  const co_assignees = group ? [] : assignees.slice(1)
  const assigned_group = group || null

  const { error } = await supabase
    .from('tasks')
    .update({ assigned_to, co_assignees, assigned_group })
    .eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath('/tasks')
  revalidatePath('/me')
  revalidatePath('/')
}
