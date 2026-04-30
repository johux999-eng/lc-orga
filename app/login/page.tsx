'use client'

import { useState, useTransition } from 'react'
import { Scale, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    })
  }

  return (
    <div className="min-h-screen bg-lc-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-lc-navy/20 bg-lc-surface mb-5 shadow-sm">
            <Scale size={22} className="text-lc-navy" strokeWidth={1.5} />
          </div>
          <h1 className="font-didot text-2xl font-bold text-lc-navy tracking-tight uppercase">
            LC Orga
          </h1>
          <p className="text-[11px] text-lc-faint mt-1.5 tracking-[0.12em] uppercase">
            EBS Law Congress · Task Management
          </p>
        </div>

        {!sent ? (
          <div className="bg-lc-surface border border-lc-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[15px] font-semibold text-lc-ink mb-1">Anmelden</h2>
            <p className="text-[13px] text-lc-faint mb-5">
              Gib deine E-Mail ein — wir schicken dir einen Magic Link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lc-faint" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="deine@email.de"
                  className="w-full pl-9 pr-4 py-2.5 bg-lc-cream border border-lc-border-strong rounded-lg text-[13px] text-lc-ink placeholder-lc-faint focus:outline-none focus:border-lc-blue transition-colors"
                />
              </div>
              {error && (
                <p className="text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isPending || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-lc-navy text-white hover:bg-[#0d2491] disabled:opacity-60 transition-colors"
              >
                {isPending ? (
                  'Sende…'
                ) : (
                  <>
                    Magic Link senden
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-lc-surface border border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 mb-4">
              <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-[15px] font-semibold text-lc-ink mb-2">Check deine Mails!</h2>
            <p className="text-[13px] text-lc-muted leading-relaxed">
              Wir haben einen Magic Link an{' '}
              <span className="text-lc-ink font-medium">{email}</span> gesendet.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-[12px] text-lc-faint hover:text-lc-secondary transition-colors"
            >
              Andere E-Mail verwenden
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
