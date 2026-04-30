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
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen fixed left-0 top-0 bg-lc-navy z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3.5 px-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center shrink-0">
            <Scale size={15} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-white tracking-[0.18em] uppercase">
              LC Orga
            </p>
            <p className="font-didot text-[8.5px] text-white/45 tracking-[0.22em] uppercase mt-0.5">
              EBS Law Congress
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  active
                    ? 'bg-white/12 text-white'
                    : 'text-white/55 hover:text-white hover:bg-white/8'
                }`}
              >
                <item.icon size={15} strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate leading-tight">
                {profile.full_name ?? '—'}
              </p>
              <p className="text-[10px] text-white/40 truncate mt-0.5">
                {profile.role ? ROLE_LABELS[profile.role] : ''}
                {profile.team ? ` · ${TEAM_LABELS[profile.team]}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-white/40 hover:text-white hover:bg-white/8 transition-all"
          >
            <LogOut size={13} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-lc-surface/95 backdrop-blur border-t border-lc-border flex items-center justify-around z-40 px-2">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-colors ${
                active ? 'text-lc-navy' : 'text-lc-muted'
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
