import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { AdminView } from '@/components/AdminView'
import type { Profile } from '@/lib/types'
import { ShieldCheck } from 'lucide-react'

export const revalidate = 0

export default async function AdminPage() {
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
  if (currentProfile.role !== 'chair') redirect('/')

  const { data: pending } = await supabase
    .from('profiles')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: true })

  return (
    <AppShell>
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
    </AppShell>
  )
}
