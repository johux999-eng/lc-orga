'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  ClipboardList,
  User,
  LogOut,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import type { Profile } from '@/lib/types'
import { TEAM_LABELS, ROLE_LABELS, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['chair', 'head', 'member'] },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks', roles: ['chair', 'head', 'member'] },
  { href: '/review', icon: ClipboardList, label: 'Review', roles: ['chair', 'head'] },
  { href: '/admin', icon: ShieldCheck, label: 'Admin', roles: ['chair'] },
  { href: '/me', icon: User, label: 'Profil', roles: ['chair', 'head', 'member'] },
]

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const items = NAV.filter((item) => item.roles.includes(profile.role ?? ''))
  const initials = getInitials(profile.full_name)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen fixed left-0 top-0 bg-slate-900 border-r border-slate-800 z-40">
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-5 border-b border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Scale size={14} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-100 tracking-tight">LC Orga</p>
            <p className="text-[10px] text-slate-500">EBS Law Congress</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-2 border-t border-slate-800 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate leading-tight">
                {profile.full_name ?? '—'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {profile.role ? ROLE_LABELS[profile.role] : ''}
                {profile.team ? ` · ${TEAM_LABELS[profile.team]}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-100 hover:bg-slate-800/80 transition-all"
          >
            <LogOut size={14} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex items-center justify-around z-40 px-2">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-colors ${
                active ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
