'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  Pencil,
  ChevronDown,
  FileText,
  Package,
  Hammer,
  Calculator,
  ClipboardList,
  History,
  Activity,
  Calendar,
  User,
} from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { OverviewTab } from '@/components/enquiries/overview-tab'
import { DocumentsTab } from '@/components/enquiries/documents-tab'
import { MaterialsTabInline } from '@/components/materials/materials-tab-inline'
import { LabourTabInline } from '@/components/labour/labour-tab-inline'
import { EstimateTabInline } from '@/components/estimate/estimate-tab-inline'
import { QuoteRevisionsTab } from '@/components/enquiries/quote-revisions-tab'
import { ActivityTab } from '@/components/enquiries/activity-tab'
import { formatDate } from '@/lib/format'
import type {
  Enquiry,
  Document,
  ActivityEntry,
  SteelMaterialLine,
  LabourOperation,
  EstimateSummary,
  EnquiryStatus,
} from '@/lib/types'

const STATUS_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  New: ['In Progress', 'Awaiting Info', 'No Bid', 'Cancelled'],
  'In Progress': ['Awaiting Info', 'Priced', 'No Bid', 'Cancelled'],
  'Awaiting Info': ['In Progress', 'No Bid', 'Cancelled'],
  Priced: ['Submitted', 'In Progress', 'No Bid', 'Cancelled'],
  Submitted: ['Won', 'Lost', 'Priced'],
  Won: ['Cancelled'],
  Lost: ['In Progress'],
  'No Bid': ['In Progress'],
  Cancelled: [],
}

interface EnquiryWorkspaceProps {
  enquiry: Enquiry
  documents: Document[]
  activity: ActivityEntry[]
  materials: SteelMaterialLine[]
  labour: LabourOperation[]
  estimate?: EstimateSummary
}

export function EnquiryWorkspace({
  enquiry,
  documents,
  activity,
  materials,
  labour,
  estimate,
}: EnquiryWorkspaceProps) {
  const [currentStatus, setCurrentStatus] = useState<EnquiryStatus>(enquiry.status)
  const [activeTab, setActiveTab] = useState('overview')

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] ?? []

  const handleStatusChange = (newStatus: EnquiryStatus) => {
    // TODO: PATCH /api/enquiries/:id with new status
    setCurrentStatus(newStatus)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div className="border-b border-border bg-card px-6 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
            <Link href="/enquiries">
              <ChevronLeft data-icon="inline-start" className="size-3" />
              Enquiries
            </Link>
          </Button>
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className="text-xs text-muted-foreground">{enquiry.enquiryNumber}</span>
        </div>

        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-semibold text-foreground">
                {enquiry.project}
              </h1>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{enquiry.customerName}</p>

            {/* Meta row */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                  {enquiry.enquiryNumber}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                <span>Deadline: {formatDate(enquiry.tenderDeadline)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="size-3" />
                <span>{enquiry.estimatorName}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Pencil data-icon="inline-start" className="size-3" />
              Edit
            </Button>

            {availableTransitions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                  Change Status
                  <ChevronDown className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Change to
                  </div>
                  <DropdownMenuSeparator />
                  {availableTransitions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="text-sm"
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 px-6 py-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-border rounded-none bg-transparent p-0 h-auto mb-5 flex gap-0">
            {[
              { value: 'overview', label: 'Overview', icon: ClipboardList },
              { value: 'documents', label: 'Documents', icon: FileText },
              { value: 'materials', label: 'Materials', icon: Package },
              { value: 'labour', label: 'Labour', icon: Hammer },
              { value: 'estimate', label: 'Estimate', icon: Calculator },
              { value: 'revisions', label: 'Revisions', icon: History },
              { value: 'activity', label: 'Activity', icon: Activity },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent hover:bg-muted/50 transition-colors font-medium text-muted-foreground data-[state=active]:shadow-none"
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <OverviewTab enquiry={{ ...enquiry, status: currentStatus }} />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <DocumentsTab documents={documents} enquiryId={enquiry.id} />
          </TabsContent>

          <TabsContent value="materials" className="mt-0">
            <MaterialsTabInline materials={materials} enquiryId={enquiry.id} />
          </TabsContent>

          <TabsContent value="labour" className="mt-0">
            <LabourTabInline labour={labour} enquiryId={enquiry.id} />
          </TabsContent>

          <TabsContent value="estimate" className="mt-0">
            <EstimateTabInline estimate={estimate} enquiryId={enquiry.id} />
          </TabsContent>

          <TabsContent value="revisions" className="mt-0">
            <QuoteRevisionsTab revisions={enquiry.revisions} enquiryId={enquiry.id} />
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <ActivityTab activity={activity} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
