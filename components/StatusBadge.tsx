import type { Task } from '@/lib/types'
import { getStatusBadgeClass, getStatusLabel } from '@/lib/utils'

interface Props {
  task: Pick<Task, 'status' | 'deadline'>
  className?: string
}

export function StatusBadge({ task, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusBadgeClass(task)} ${className}`}
    >
      {getStatusLabel(task)}
    </span>
  )
}
