import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { formatGBP, formatDate } from '@/lib/format'
import type { Enquiry } from '@/lib/types'

interface RecentEnquiriesProps {
  enquiries: Enquiry[]
}

export function RecentEnquiries({ enquiries }: RecentEnquiriesProps) {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-0 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            Recent Enquiries
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            render={<Link href="/enquiries" />}
          >
              View all
              <ArrowRight data-icon="inline-end" className="size-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 mt-3">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 font-medium text-xs text-muted-foreground">Enquiry</th>
                <th className="text-left pb-2 font-medium text-xs text-muted-foreground">Project</th>
                <th className="text-left pb-2 font-medium text-xs text-muted-foreground">Customer</th>
                <th className="text-left pb-2 font-medium text-xs text-muted-foreground">Deadline</th>
                <th className="text-left pb-2 font-medium text-xs text-muted-foreground">Status</th>
                <th className="text-right pb-2 font-medium text-xs text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr
                  key={enq.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2.5 pr-3">
                    <Link
                      href={`/enquiries/${enq.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {enq.enquiryNumber}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3">
                    <p className="text-xs font-medium text-foreground truncate max-w-[200px]">
                      {enq.project}
                    </p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {enq.customerName}
                    </p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(enq.tenderDeadline)}
                    </p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge status={enq.status} />
                  </td>
                  <td className="py-2.5 text-right">
                    <p className="text-xs font-medium tabular-nums text-foreground">
                      {enq.estimatedValue ? formatGBP(enq.estimatedValue, 0) : '—'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
