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
    <div className="min-h-screen bg-[#080a12] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-600/30 mb-4">
            <Scale size={22} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">LC Orga</h1>
          <p className="text-slate-500 text-sm mt-1">EBS Law Congress · Task Management</p>
        </div>

        {!sent ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-slate-200 mb-1">Anmelden</h2>
            <p className="text-sm text-slate-500 mb-5">
              Gib deine E-Mail ein — wir schicken dir einen Magic Link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="deine@email.de"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/70 transition-colors"
                />
              </div>
              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isPending || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
              >
                {isPending ? (
                  'Sende…'
                ) : (
                  <>
                    Magic Link senden
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 mb-4">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-200 mb-2">Check deine Mails!</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Wir haben einen Magic Link an{' '}
              <span className="text-slate-200 font-medium">{email}</span> gesendet.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Andere E-Mail verwenden
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
