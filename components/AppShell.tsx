import { redirect } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { getAuthUser, getCurrentProfile } from '@/lib/auth'

interface Props {
  children: React.ReactNode
}

export async function AppShell({ children }: Props) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getCurrentProfile()
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
