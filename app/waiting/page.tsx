import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Scale, Clock } from 'lucide-react'
import { signOut } from '@/lib/actions'

export default async function WaitingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Already approved → go to app
  const { data: profile } = await supabase
    .from('profiles')
    .select('approved, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (profile.approved) redirect('/')

  return (
    <div className="min-h-screen bg-[#080a12] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-6">
          <Clock size={22} className="text-amber-400" />
        </div>

        <h1 className="text-xl font-bold text-slate-100 mb-2">Zugang wird geprüft</h1>
        <p className="text-slate-400 text-sm mb-1">
          Hallo{profile.full_name ? ` ${profile.full_name}` : ''},
        </p>
        <p className="text-slate-400 text-sm mb-8">
          dein Konto wurde angelegt. Ein Chair muss deinen Zugang noch freischalten.
          Bitte warte kurz — du wirst informiert, sobald du loslegen kannst.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Scale size={14} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-100 tracking-tight">LC Orga</p>
            <p className="text-xs text-slate-500">EBS Law Congress</p>
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Abmelden
          </button>
        </form>
      </div>
    </div>
  )
}
