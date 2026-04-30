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
    <div className="min-h-screen bg-lc-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-lc-navy/20 bg-lc-surface mb-5 shadow-sm">
            <Scale size={22} className="text-lc-navy" strokeWidth={1.5} />
          </div>
          <h1 className="font-didot text-2xl font-bold text-lc-navy tracking-tight uppercase">
            Willkommen!
          </h1>
          <p className="text-[13px] text-lc-faint mt-1">
            Richte dein Profil ein — einmalig.
          </p>
        </div>

        <div className="bg-lc-surface border border-lc-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-lc-muted mb-1.5 uppercase tracking-wide">
                <User size={11} />
                Vollständiger Name *
              </label>
              <input
                name="full_name"
                required
                placeholder="Max Mustermann"
                className="w-full px-3 py-2.5 bg-lc-cream border border-lc-border-strong rounded-lg text-[13px] text-lc-ink placeholder-lc-faint focus:outline-none focus:border-lc-blue transition-colors"
              />
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-lc-muted mb-1.5 uppercase tracking-wide">
                <Briefcase size={11} />
                Rolle *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <label
                    key={r}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border cursor-pointer transition-all ${
                      role === r
                        ? 'bg-lc-navy/8 border-lc-navy/30 text-lc-navy'
                        : 'bg-lc-cream border-lc-border text-lc-muted hover:border-lc-border-strong'
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
                    <span className="text-[13px] font-semibold">{ROLE_LABELS[r]}</span>
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
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-lc-muted mb-1.5 uppercase tracking-wide">
                  <Users size={11} />
                  Team *
                </label>
                <select
                  name="team"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2.5 bg-lc-cream border border-lc-border-strong rounded-lg text-[13px] text-lc-ink focus:outline-none focus:border-lc-blue transition-colors"
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
              <p className="text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || !role}
              className="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-lc-navy text-white hover:bg-[#0d2491] disabled:opacity-60 transition-colors mt-2"
            >
              {isPending ? 'Speichere…' : 'Profil speichern & loslegen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
