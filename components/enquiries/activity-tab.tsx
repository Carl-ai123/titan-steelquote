'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageSquare,
  FileText,
  Calculator,
  FilePen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import type { ActivityEntry } from '@/lib/types'

const typeConfig: Record<
  ActivityEntry['type'],
  { icon: React.ComponentType<{ className?: string }>; colour: string }
> = {
  edit: { icon: FilePen, colour: 'text-muted-foreground bg-muted' },
  comment: { icon: MessageSquare, colour: 'text-blue-700 bg-blue-50' },
  document: { icon: FileText, colour: 'text-purple-700 bg-purple-50' },
  estimate: { icon: Calculator, colour: 'text-green-700 bg-green-50' },
  quote: { icon: FilePen, colour: 'text-amber-700 bg-amber-50' },
  status_change: { icon: ArrowRight, colour: 'text-orange-700 bg-orange-50' },
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ActivityTabProps {
  activity: ActivityEntry[]
}

export function ActivityTab({ activity }: ActivityTabProps) {
  const [comment, setComment] = useState('')

  const handleAddComment = () => {
    if (!comment.trim()) return
    // TODO: POST /api/enquiries/:id/activity with type: 'comment'
    setComment('')
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Add comment */}
      <Card className="border border-border">
        <CardContent className="p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Add Comment
          </p>
          <Textarea
            placeholder="Type a comment, note or query…"
            className="text-sm min-h-[72px] resize-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={!comment.trim()}
              onClick={handleAddComment}
            >
              <MessageSquare data-icon="inline-start" className="size-3.5" />
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity log */}
      <div className="flex flex-col gap-0">
        {activity.length === 0 ? (
          <div className="py-12 text-center">
            <RefreshCw className="size-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          </div>
        ) : (
          [...activity]
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            )
            .map((entry) => {
              const cfg = typeConfig[entry.type]
              const Icon = cfg.icon
              return (
                <div
                  key={entry.id}
                  className="flex gap-3 py-3 border-b border-border/50 last:border-0"
                >
                  <div
                    className={`size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.colour}`}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-medium text-foreground">
                        {entry.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entry.action}
                      </span>
                      <span className="text-xs text-muted-foreground/60 ml-auto whitespace-nowrap">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    {entry.detail && (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded px-2.5 py-1.5">
                        {entry.detail}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}
