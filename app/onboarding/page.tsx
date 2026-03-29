'use client'

import { useState, useTransition } from 'react'
import { Scale, User, Users, Briefcase } from 'lucide-react'
import { completeOnboarding } from '@/lib/actions'
import { TEAM_LABELS, ROLE_LABELS, TEAMS, ROLES } from '@/lib/utils'
import type { Role } from '@/lib/types'

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<Role | ''>('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await completeOnboarding(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#080a12] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-600/30 mb-4">
            <Scale size={22} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Willkommen!</h1>
          <p className="text-slate-500 text-sm mt-1">
            Richte dein Profil ein — einmalig.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
                <User size={12} />
                Vollständiger Name *
              </label>
              <input
                name="full_name"
                required
                placeholder="Max Mustermann"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/70"
              />
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
                <Briefcase size={12} />
                Rolle *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <label
                    key={r}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border cursor-pointer transition-all ${
                      role === r
                        ? 'bg-blue-600/15 border-blue-500/40 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                      required
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">{ROLE_LABELS[r]}</span>
                    <span className="text-[10px] text-center leading-tight opacity-70">
                      {r === 'chair' ? 'Gesamtleitung' : r === 'head' ? 'Teamleitung' : 'Organisator'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Team — hidden for chair */}
            {role === 'chair' ? (
              <input type="hidden" name="team" value="Chairs" />
            ) : (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
                  <Users size={12} />
                  Team *
                </label>
                <select
                  name="team"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500/70"
                >
                  <option value="" disabled>
                    — Team auswählen —
                  </option>
                  {TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {TEAM_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || !role}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 transition-colors mt-2"
            >
              {isPending ? 'Speichere…' : 'Profil speichern & loslegen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
