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

  const { data: profile } = await supabase
    .from('profiles')
    .select('approved, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (profile.approved) redirect('/')

  return (
    <div className="min-h-screen bg-lc-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-amber-200 bg-amber-50 mb-6">
          <Clock size={22} className="text-amber-600" strokeWidth={1.5} />
        </div>

        <h1 className="font-didot text-2xl font-bold text-lc-navy mb-2 uppercase tracking-tight">
          Zugang wird geprüft
        </h1>
        <p className="text-lc-muted text-[13px] mb-1">
          Hallo{profile.full_name ? ` ${profile.full_name}` : ''},
        </p>
        <p className="text-lc-muted text-[13px] mb-8 leading-relaxed">
          dein Konto wurde angelegt. Ein Chair muss deinen Zugang noch freischalten.
          Bitte warte kurz — du wirst informiert, sobald du loslegen kannst.
        </p>

        <div className="bg-white border border-lc-border rounded-2xl p-5 mb-6 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full border border-lc-navy/20 flex items-center justify-center shrink-0">
            <Scale size={14} className="text-lc-navy" strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold text-lc-ink tracking-tight">LC Orga</p>
            <p className="font-didot text-[10px] text-lc-faint tracking-[0.15em] uppercase">EBS Law Congress</p>
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="text-[13px] text-lc-faint hover:text-lc-secondary transition-colors"
          >
            Abmelden
          </button>
        </form>
      </div>
    </div>
  )
}
