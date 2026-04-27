# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type-check without emitting
```

No test suite is configured.

## Architecture

Next.js 14 App Router + Supabase + Tailwind. All data fetching happens server-side in page components; mutations go through Server Actions in `lib/actions.ts`.

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

Task assignment is either to individual person(s) (`assigned_to` + `co_assignees`) or to a named group (`assigned_group`). The 13 group identifiers are defined in `lib/utils.ts` (`ASSIGNEE_GROUPS`, `GROUP_CRITERIA`). `isProfileInGroup()` is the single source of truth for group membership. `GROUP_CRITERIA` is not exported — never bypass `isProfileInGroup`.

Only `head` and `chair` roles can create tasks (enforced in both `createTask` action and `TasksView` UI).

### Task Status Flow

```
open → (assignee submits) → pending_review → (head/chair approves) → done
                                           → (head/chair rejects)  → open
```

- **Members** submit → status becomes `pending_review`; `submitted_by` is set to their user id
- **Heads** submit their own tasks → `pending_review` (chair must approve)
- **Chairs** submit → status becomes `done` directly

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
| head | all tasks for their team | member tasks of their team (direct + group) |
| chair | all tasks | all pending_review tasks |

The server-side queries in `app/(app)/tasks/page.tsx` and `app/(app)/me/page.tsx` build the appropriate `.eq()` / `.or()` filters per role **on top of** RLS — both layers must allow access.

### Required Supabase RLS Policies

The `tasks` SELECT policy must include these clauses (otherwise heads lose visibility of tasks they create for members):

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

A `public.is_in_group(group_name text)` SECURITY DEFINER function is needed for the group clause — it maps each group identifier to `(role, team)` criteria against `auth.uid()`.

### Design System

Light-mode, law-congress aesthetic. Never revert to dark Tailwind slate classes.

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

### Key Files

- `lib/types.ts` — shared TypeScript types (`Role`, `Team`, `Task`, `Profile`, `UserStats`)
- `lib/utils.ts` — group definitions, `isProfileInGroup`, `isTaskVisibleForProfile`, `computeStats`, formatting helpers
- `lib/auth.ts` — `getAuthUser` / `getCurrentProfile` with React.cache deduplication
- `lib/actions.ts` — all Server Actions (auth, CRUD for tasks, approval/rejection, user management)
- `components/TasksView.tsx` — full tasks UI including Create/Edit/Delete/Reassign/Submit modals and inline approve/reject buttons
- `components/ReviewView.tsx` — review queue UI (head sees member tasks; chair sees all pending)
- `components/DashboardTable.tsx` — per-member stats table used on the dashboard
- `app/(app)/review/page.tsx` — server-side filtering of pending tasks per role before passing to ReviewView
- `app/(app)/me/page.tsx` — personal stats and task list; applies `isTaskVisibleForProfile` filter before computing stats
- `app/(app)/admin/page.tsx` — chair-only page; fetches unapproved profiles and passes to `AdminView`
