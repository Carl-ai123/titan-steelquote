import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, AlertTriangle } from 'lucide-react'
import { formatDate, daysFromNow } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Enquiry } from '@/lib/types'

interface UpcomingDeadlinesProps {
  enquiries: Enquiry[]
}

export function UpcomingDeadlines({ enquiries }: UpcomingDeadlinesProps) {
  return (
    <Card className="border border-border h-full">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {enquiries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {enquiries.map((enq) => {
              const days = daysFromNow(enq.tenderDeadline)
              const isUrgent = days <= 7
              const isOverdue = days < 0
              return (
                <Link
                  key={enq.id}
                  href={`/enquiries/${enq.id}`}
                  className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-muted transition-colors group"
                >
                  <div
                    className={cn(
                      'mt-0.5 flex items-center justify-center size-5 rounded shrink-0',
                      isOverdue
                        ? 'bg-red-100 text-red-600'
                        : isUrgent
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isOverdue || isUrgent ? (
                      <AlertTriangle className="size-3" />
                    ) : (
                      <Clock className="size-3" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-primary">
                      {enq.project}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {enq.customerName}
                    </p>
                    <p
                      className={cn(
                        'text-xs font-medium mt-0.5',
                        isOverdue
                          ? 'text-red-600'
                          : isUrgent
                          ? 'text-amber-600'
                          : 'text-muted-foreground',
                      )}
                    >
                      {isOverdue
                        ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
                        : days === 0
                        ? 'Due today'
                        : `${days} day${days !== 1 ? 's' : ''} — ${formatDate(enq.tenderDeadline)}`}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
