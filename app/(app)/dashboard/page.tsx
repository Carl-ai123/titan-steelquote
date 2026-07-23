import { DashboardKPIs } from '@/components/dashboard/dashboard-kpis'
import { RecentEnquiries } from '@/components/dashboard/recent-enquiries'
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines'
import { EnquiryStatusChart } from '@/components/dashboard/enquiry-status-chart'
import { dashboardStats, mockEnquiries } from '@/lib/mock-data'
import { LIVE_STATUSES } from '@/lib/types'

export default function DashboardPage() {
  // TODO: Fetch live stats from API/database
  const upcomingDeadlines = mockEnquiries
    .filter((enquiry) => LIVE_STATUSES.includes(enquiry.status))
    .sort(
      (a, b) =>
        new Date(a.tenderDeadline).getTime() - new Date(b.tenderDeadline).getTime(),
    )
    .slice(0, 5)

  const recentEnquiries = [...mockEnquiries]
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    )
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of live enquiries and pipeline activity
        </p>
      </div>

      {/* KPI stat cards */}
      <DashboardKPIs stats={dashboardStats} />

      {/* Charts + deadlines row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <EnquiryStatusChart data={dashboardStats.statusBreakdown} />
        </div>
        <div className="col-span-1">
          <UpcomingDeadlines enquiries={upcomingDeadlines} />
        </div>
      </div>

      {/* Recent enquiries */}
      <RecentEnquiries enquiries={recentEnquiries} />
    </div>
  )
}
