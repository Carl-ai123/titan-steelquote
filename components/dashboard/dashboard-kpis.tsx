import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  Clock,
  AlertCircle,
  Award,
  DollarSign,
  Percent,
} from 'lucide-react'
import { formatGBP, formatPercent } from '@/lib/format'

interface DashboardStats {
  totalLiveEnquiryValue: number
  quotesAwaitingApproval: number
  quotesDueWithin7Days: number
  winRate: number
  averageQuotedMargin: number
}

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  highlight?: boolean
  alert?: boolean
}

function KPICard({ title, value, subtitle, icon: Icon, highlight, alert }: KPICardProps) {
  return (
    <Card className="border border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              {title}
            </p>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                alert
                  ? 'text-amber-600'
                  : highlight
                  ? 'text-primary'
                  : 'text-foreground'
              }`}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={`flex items-center justify-center size-9 rounded-md shrink-0 ${
              alert
                ? 'bg-amber-50 text-amber-600'
                : highlight
                ? 'bg-accent text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Icon className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardKPIsProps {
  stats: DashboardStats
}

export function DashboardKPIs({ stats }: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <KPICard
        title="Live Enquiry Value"
        value={formatGBP(stats.totalLiveEnquiryValue, 0)}
        subtitle="Across all active statuses"
        icon={DollarSign}
        highlight
      />
      <KPICard
        title="Awaiting Approval"
        value={String(stats.quotesAwaitingApproval)}
        subtitle="Estimates to review"
        icon={AlertCircle}
        alert={stats.quotesAwaitingApproval > 0}
      />
      <KPICard
        title="Deadlines ≤ 7 Days"
        value={String(stats.quotesDueWithin7Days)}
        subtitle="Tender due dates"
        icon={Clock}
        alert={stats.quotesDueWithin7Days > 0}
      />
      <KPICard
        title="Win Rate"
        value={`${stats.winRate}%`}
        subtitle="Rolling 6 months"
        icon={Award}
      />
      <KPICard
        title="Avg Quoted Margin"
        value={`${stats.averageQuotedMargin.toFixed(1)}%`}
        subtitle="Rolling 6 months"
        icon={Percent}
      />
    </div>
  )
}
