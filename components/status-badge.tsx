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
  'In Progress': {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  },
  'Awaiting Info': {
    label: 'Awaiting Info',
    className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50',
  },
  Priced: {
    label: 'Priced',
    className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50',
  },
  Submitted: {
    label: 'Submitted',
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
  'No Bid': {
    label: 'No Bid',
    className: 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-50',
  },
  Cancelled: {
    label: 'Cancelled',
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
