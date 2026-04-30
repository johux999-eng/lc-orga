# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type-check without emitting
```

No test suite is configured. ESLint config is not yet set up (`npm run lint` will prompt for it on first run).

## Architecture

Next.js 14 App Router + Supabase + Tailwind. All data fetching happens server-side in page components; mutations go through Server Actions in `lib/actions.ts`.

### Supabase Client Instances

Two separate Supabase clients — never mix them up:
- `lib/supabase/server.ts` — reads cookies, used in Server Components, Server Actions, and `middleware.ts`
- `lib/supabase/client.ts` — browser singleton, used only inside `'use client'` components (currently not needed since all data fetching is server-side)

### Auth & Access Control

- **Magic-link only** (`signInWithMagicLink` in `lib/actions.ts`) → Supabase sends OTP email → `/auth/callback` exchanges code for session → redirect to `/`.
- **Supabase ANON key + user JWT** → RLS is fully active on all tables. The server client (`lib/supabase/server.ts`) passes session cookies; there is no service-role bypass.
- `middleware.ts` handles session refresh and redirects unapproved users to `/waiting`.
- Role hierarchy: `chair > head > member`. Stored in the `profiles` table (`role`, `team`, `approved` columns).
- `lib/auth.ts` exports `getAuthUser()` and `getCurrentProfile()` wrapped in `React.cache` — both can be called freely from layouts and page components within a request without extra round-trips.

### Route Structure

All authenticated pages live under `app/(app)/` and are wrapped by `AppShell` (renders `Sidebar` + main content). Unauthenticated flows: `/login`, `/onboarding`, `/waiting`. The middleware guards all routes and enforces the `approved` flag before any page renders.

| Route | Access | Description |
|-------|--------|-------------|
| `/` | all roles | Dashboard — aggregate stats + per-member table via `DashboardTable` |
| `/tasks` | all roles | Task list filtered by role (see Role Visibility Rules) |
| `/me` | all roles | Personal stats and own task list |
| `/review` | head, chair | Approval queue — heads see their team's member tasks; chairs see all |
| `/admin` | chair only | Approve pending new members; redirects non-chairs to `/` |

All page components export `revalidate = 0` to force dynamic rendering (no stale caches).

### Data Model

Two core tables in Supabase:
- **`profiles`** — one row per auth user: `id, full_name, role, team, approved`
- **`tasks`** — `id, title, description, assigned_to (uuid|null), co_assignees (uuid[]), assigned_group (text|null), team, status, deadline, proof_url, created_by, submitted_at, submitted_by, reviewed_by, completed_at`

The 6 valid teams: `Sponsoring`, `Speaker`, `Public Relations`, `Technik/Mobility`, `Event`, `Chairs`.

Task assignment is either to individual person(s) (`assigned_to` + `co_assignees`) or to a named group (`assigned_group`). The 13 group identifiers are defined in `lib/utils.ts` (`ASSIGNEE_GROUPS`, `GROUP_CRITERIA`). `isProfileInGroup()` is the single source of truth for group membership. `GROUP_CRITERIA` is not exported — never bypass `isProfileInGroup`.

### Task Creation Rules

All three roles can create tasks, with different constraints:

| Role | Can create | Team | Assignment |
|------|-----------|------|------------|
| **chair** | any task | any team | any person or any group |
| **head** | any task | any team (defaults to own) | any person or any group from: all `members_*` groups + own specific `heads_*` group |
| **member** | self-assigned tasks only | forced to own team | always `assigned_to = self`, no group |

Members' self-assigned tasks behave like regular tasks: submit → `pending_review` → head approves → `done`.

### Task Status Flow

```
open → (assignee submits) → pending_review → (head/chair approves) → done
                                           → (head/chair rejects)  → open
```

- **Members** submit → `pending_review`; only the head of their team can approve
- **Heads** submit → `pending_review`; only chairs can approve (heads cannot approve head-submitted tasks)
- **Chairs** submit → `done` directly (auto-approved)
- **Head group tasks** (`assigned_group = heads_*`) — when submitted by any head in the group → `pending_review`; only chairs can approve (heads are blocked from approving `heads_*` group tasks by the action validation)

The approval gating logic lives in `approveTask` in `lib/actions.ts`: heads may only approve tasks where `assignee.role === 'member' && assignee.team === approver.team`. This naturally prevents heads from approving head-group tasks or cross-team tasks.

### Group Task Visibility

`isTaskVisibleForProfile(task, profile)` in `lib/utils.ts` is the single source of truth for whether a group task should appear for a given user. It is used in `computeStats`, `/me`, and `/tasks`.

| State | Head group (`heads_*`) | Member group / `all` |
|-------|----------------------|---------------------|
| `open` | visible to all group members | visible to all group members |
| `pending_review` / `done` | visible to **all** heads in the group | visible **only** to `submitted_by` |

The underlying RLS SELECT policy is intentionally permissive for group members (all can read open group tasks via `is_in_group`). The above visibility distinction is enforced at the application layer.

### Role Visibility Rules

| Who | Sees in /tasks | Sees in /review |
|-----|---------------|-----------------|
| member | own tasks only (assigned_to / co_assignees / group, filtered by `isTaskVisibleForProfile`) | — |
| head | all tasks for their team **+ all tasks they personally created** (any team) | member tasks of their team (direct + group) |
| chair | all tasks | all pending_review tasks |

The server-side queries apply per-role filters **on top of** RLS — both layers must allow access. The head query uses `.or('team.eq.X,created_by.eq.Y')` to cover cross-team tasks they created.

### Required Supabase RLS Policies

The `tasks` **SELECT** policy must include these clauses:

```sql
-- Direct/co assignment, group membership, creator, head team access, chair all-access
assigned_to = auth.uid()
OR auth.uid() = ANY(co_assignees)
OR (assigned_group IS NOT NULL AND public.is_in_group(assigned_group))
OR created_by = auth.uid()
OR ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head'
    AND team = (SELECT team FROM profiles WHERE id = auth.uid()))
OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'chair'
```

The `tasks` **INSERT** policy must allow all three roles (`member`, `head`, `chair`) — application-level checks in `createTask` enforce the per-role constraints.

A `public.is_in_group(group_name text)` SECURITY DEFINER function is needed for the group clause — it maps each group identifier to `(role, team)` criteria against `auth.uid()`.

### Design System

Light-mode, law-congress aesthetic. Never use dark Tailwind slate classes.

**Tailwind tokens** (`lc-*` — defined in `tailwind.config.ts`):
| Token | Hex | Usage |
|-------|-----|-------|
| `lc-navy` | `#081c74` | Sidebar bg, primary buttons, icon accents |
| `lc-blue` | `#1e69c4` | Focus rings, interactive highlights |
| `lc-cream` | `#f8f5f2` | Page background, input backgrounds |
| `lc-ink` | `#202020` | Primary text |
| `lc-secondary` | `#363636` | Secondary text |
| `lc-muted` | `#4a4a4a` | Muted text, labels |
| `lc-faint` | `#8a8682` | Placeholder, timestamps |
| `lc-border` | `#e5e2de` | Default borders |
| `lc-border-strong` | `#d4d0cb` | Input borders |
| `lc-hover` | `#f0ede9` | Hover backgrounds |

**Fonts:**
- `font-sans` / `font-avenir` → `'Avenir Next', 'Avenir', -apple-system, …` (system font; no import needed)
- `font-didot` → `'Didot', var(--font-playfair), 'Bodoni MT', Georgia, serif` — Playfair Display loaded from Google Fonts in `app/layout.tsx` as `--font-playfair`

**Typography rules** (from brand guide):
- Page headings: `text-xl font-medium` (Avenir Next, 20 pt equiv)
- Section/table sub-headings: `font-didot text-[11-12px] font-bold uppercase tracking-wider` (Didot Bold Caps, 14 pt equiv)
- Body / UI text: `text-[13px]` (Avenir Next Regular, 12 pt equiv)

**UI patterns:**
- Cards: `bg-white border border-lc-border rounded-xl`
- Inputs/selects: `bg-lc-cream border border-lc-border-strong rounded-lg text-[13px] text-lc-ink focus:border-lc-blue`
- Primary button: `bg-lc-navy text-white hover:bg-[#0d2491]`
- Secondary button: `text-lc-muted border border-lc-border hover:bg-lc-hover`
- Modal backdrop: `bg-lc-ink/40 backdrop-blur-sm`; modal shell: `bg-white border border-lc-border` — use the `ModalShell` component inside `TasksView.tsx` as the pattern
- Sidebar: navy (`bg-lc-navy`), nav active state `bg-white/12`, inactive `text-white/55 hover:bg-white/8`
- Mobile task cards use `line-clamp-2` for description/proof_url with a `ChevronDown`/`ChevronUp` expand toggle shown when text exceeds ~80 characters
- Loading skeletons (`app/**/loading.tsx`): use `animate-pulse` with `lc-*` tokens — `bg-lc-border` / `bg-lc-hover` for skeleton shapes, `bg-white border border-lc-border` for card shells, `bg-lc-cream` for table headers. Never use dark `slate-*` classes in loading screens.

### StatusBadge

`components/StatusBadge.tsx` renders a colored pill via `getStatusBadgeClass` / `getStatusLabel` from `lib/utils.ts`. There are four visual states (not three): `done` (emerald), `pending_review` (amber), overdue (red — `open` task past deadline), and `open` (neutral lc-hover). The overdue state is derived at render time from `task.deadline`, not stored in the DB.

### Key Files

- `lib/types.ts` — shared TypeScript types (`Role`, `Team`, `Task`, `Profile`, `UserStats`)
- `lib/utils.ts` — group definitions, `isProfileInGroup`, `isTaskVisibleForProfile`, `computeStats`, `getStatusBadgeClass`, `getInitials`, formatting helpers
- `lib/auth.ts` — `getAuthUser` / `getCurrentProfile` with React.cache deduplication
- `lib/actions.ts` — all Server Actions (auth, CRUD for tasks, approval/rejection, user management)
- `components/AppShell.tsx` — server component wrapping all authenticated pages; redirects to `/login` or `/onboarding` if session/profile missing
- `components/Sidebar.tsx` — nav sidebar; receives `profile` from `AppShell`
- `components/TasksView.tsx` — full tasks UI including Create/Edit/Delete/Reassign/Submit modals and inline approve/reject buttons; `ModalShell` is the shared modal wrapper pattern
- `components/ReviewView.tsx` — review queue UI (head sees member tasks; chair sees all pending)
- `components/AdminView.tsx` — new-member approval UI (chair only)
- `components/DashboardTable.tsx` — per-member stats table used on the dashboard
- `app/auth/callback/` — exchanges Supabase OTP code for session, then redirects to `/`
- `app/(app)/review/page.tsx` — server-side filtering of pending tasks per role before passing to ReviewView
- `app/(app)/me/page.tsx` — personal stats and task list; applies `isTaskVisibleForProfile` filter before computing stats
- `app/(app)/admin/page.tsx` — chair-only page; fetches unapproved profiles and passes to `AdminView`
