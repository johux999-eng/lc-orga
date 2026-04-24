import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getCurrentProfile } from '@/lib/auth'
import { ReviewView } from '@/components/ReviewView'
import type { Task } from '@/lib/types'
import { ClipboardList } from 'lucide-react'
import { isProfileInGroup } from '@/lib/utils'

export const revalidate = 0

export default async function ReviewPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const currentProfile = await getCurrentProfile()
  if (!currentProfile) redirect('/onboarding')
  if (!currentProfile.role || !['head', 'chair'].includes(currentProfile.role)) {
    redirect('/')
  }

  const supabase = await createClient()

  const { data: allPending } = await supabase
    .from('tasks')
    .select(
      `
      *,
      assigned_profile:profiles!assigned_to(id, full_name, role, team),
      created_profile:profiles!created_by(id, full_name)
    `
    )
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  const tasks = ((allPending ?? []) as Task[]).filter((task) => {
    const assignee = task.assigned_profile
    if (currentProfile.role === 'head') {
      if (assignee) {
        return assignee.role === 'member' && assignee.team === currentProfile.team
      }
      if (task.assigned_group) {
        return isProfileInGroup(task.assigned_group, { role: 'member', team: currentProfile.team })
      }
      return false
    }
    if (currentProfile.role === 'chair') {
      return true
    }
    return false
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <ClipboardList size={16} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-tight">Review Queue</h1>
            <p className="text-sm text-slate-500">
              {currentProfile.role === 'head'
                ? 'Member-Tasks deines Teams'
                : 'Alle eingereichten Tasks'}
            </p>
          </div>
        </div>
        {tasks.length > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
            {tasks.length}
          </span>
        )}
      </div>

      <ReviewView tasks={tasks} currentProfile={currentProfile} />
    </div>
  )
}
