import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { TasksView } from '@/components/TasksView'
import type { Profile, Task } from '@/lib/types'
import { CheckSquare } from 'lucide-react'

export const revalidate = 0

export default async function TasksPage() {
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

  // Fetch tasks — role-based visibility
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

  // Fetch all profiles for assignment dropdown (create task)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, team, created_at')
    .order('full_name')

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center">
            <CheckSquare size={16} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-tight">Tasks</h1>
            <p className="text-sm text-slate-500">{(tasks ?? []).length} Tasks insgesamt</p>
          </div>
        </div>

        <TasksView
          tasks={(tasks ?? []) as Task[]}
          profiles={(profiles ?? []) as Profile[]}
          currentProfile={currentProfile}
        />
      </div>
    </AppShell>
  )
}
