'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink, FilePen, History } from 'lucide-react'
import { formatGBP, formatDate } from '@/lib/format'
import type { QuoteRevision } from '@/lib/types'

const revisionStatusColour: Record<QuoteRevision['status'], string> = {
  Draft: 'bg-muted text-muted-foreground',
  Issued: 'bg-blue-50 text-blue-700 border-blue-200',
  Accepted: 'bg-green-50 text-green-700 border-green-200',
  Declined: 'bg-red-50 text-red-700 border-red-200',
  Superseded: 'bg-muted text-muted-foreground',
}

interface QuoteRevisionsTabProps {
  revisions: QuoteRevision[]
  enquiryId: string
}

export function QuoteRevisionsTab({ revisions, enquiryId }: QuoteRevisionsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {revisions.length} revision{revisions.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" className="h-8 text-xs" asChild>
          <Link href={`/enquiries/${enquiryId}/quote`}>
            <Plus data-icon="inline-start" className="size-3.5" />
            New Revision
          </Link>
        </Button>
      </div>

      {revisions.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-14 text-center">
            <History className="size-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No quotations issued yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Build the estimate then generate the first quotation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['Quote Number', 'Revision', 'Selling Price', 'Status', 'Issued', 'Valid Until', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground first:pl-4"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {[...revisions]
                  .sort((a, b) => b.revision - a.revision)
                  .map((rev) => (
                    <tr
                      key={rev.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FilePen className="size-3.5 text-muted-foreground shrink-0" />
                          <code className="text-xs font-mono font-medium">
                            {rev.quoteNumber}
                          </code>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">Rev {rev.revision}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold">{formatGBP(rev.sellingPrice, 0)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${revisionStatusColour[rev.status]}`}
                        >
                          {rev.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {rev.issuedAt ? formatDate(rev.issuedAt.split('T')[0]) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {rev.validUntil ? formatDate(rev.validUntil.split('T')[0]) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="size-7" asChild>
                          <Link href={`/enquiries/${enquiryId}/quote`}>
                            <ExternalLink className="size-3.5" />
                            <span className="sr-only">Open quote</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
