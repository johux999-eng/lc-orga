import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getCurrentProfile } from '@/lib/auth'
import { AdminView } from '@/components/AdminView'
import type { Profile } from '@/lib/types'
import { ShieldCheck } from 'lucide-react'

export const revalidate = 0

export default async function AdminPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const currentProfile = await getCurrentProfile()
  if (!currentProfile) redirect('/onboarding')
  if (currentProfile.role !== 'chair') redirect('/')

  const supabase = await createClient()

  const { data: pending } = await supabase
    .from('profiles')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <ShieldCheck size={16} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 leading-tight">Freischaltungen</h1>
          <p className="text-sm text-slate-500">Neue Mitglieder freischalten</p>
        </div>
      </div>

      <AdminView pending={(pending ?? []) as Profile[]} />
    </div>
  )
}
