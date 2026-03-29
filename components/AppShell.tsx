import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './Sidebar'
import type { Profile } from '@/lib/types'

interface Props {
  children: React.ReactNode
}

export async function AppShell({ children }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) redirect('/onboarding')

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />

      {/* Main content */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
