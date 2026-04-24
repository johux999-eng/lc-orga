export type Role = 'chair' | 'head' | 'member'

export type Team =
  | 'Sponsoring'
  | 'Speaker'
  | 'Public Relations'
  | 'Technik/Mobility'
  | 'Event'
  | 'Chairs'

export type TaskStatus = 'open' | 'pending_review' | 'done'

export interface Profile {
  id: string
  full_name: string | null
  team: Team | null
  role: Role | null
  approved: boolean
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  assigned_to: string | null
  co_assignees: string[]
  assigned_group: string | null
  created_by: string | null
  team: Team | null
  status: TaskStatus
  deadline: string | null
  proof_url: string | null
  submitted_at: string | null
  submitted_by: string | null
  reviewed_by: string | null
  completed_at: string | null
  created_at: string
  assigned_profile?: {
    id: string
    full_name: string | null
    role: Role | null
    team: Team | null
  } | null
  created_profile?: {
    id: string
    full_name: string | null
  } | null
}

export interface UserStats {
  profile: Profile
  open: number
  overdue: number
  pending: number
  done: number
  total: number
  rate: number
}
