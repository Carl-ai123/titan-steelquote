'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EnquiryStatus } from '@/lib/types'

const statusConfig: Record<
  EnquiryStatus,
  { label: string; className: string }
> = {
  New: {
    label: 'New',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50',
  },
  Reviewing: {
    label: 'Reviewing',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-50',
  },
  Estimating: {
    label: 'Estimating',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  },
  'Awaiting Clarification': {
    label: 'Awaiting Clarification',
    className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50',
  },
  'Internal Approval': {
    label: 'Internal Approval',
    className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50',
  },
  Quoted: {
    label: 'Quoted',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50',
  },
  Won: {
    label: 'Won',
    className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50',
  },
  Lost: {
    label: 'Lost',
    className: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-50',
  },
  Withdrawn: {
    label: 'Withdrawn',
    className: 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-50',
  },
}

interface StatusBadgeProps {
  status: EnquiryStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-sm whitespace-nowrap',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
