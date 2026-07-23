'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import {
  Search,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { formatGBP, formatDate, daysFromNow } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Enquiry, EnquiryStatus, User } from '@/lib/types'

type SortField =
  | 'enquiryNumber'
  | 'customerName'
  | 'project'
  | 'receivedDate'
  | 'tenderDeadline'
  | 'estimatorName'
  | 'status'
  | 'estimatedValue'
  | 'probability'
  | 'lastUpdated'

type SortDir = 'asc' | 'desc'

const ALL_STATUSES: EnquiryStatus[] = [
  'New', 'In Progress', 'Awaiting Info', 'Priced', 'Submitted', 'Won', 'Lost', 'No Bid', 'Cancelled',
]

const PAGE_SIZES = [10, 25, 50]

interface EnquiriesTableProps {
  enquiries: Enquiry[]
  estimators: User[]
}

export function EnquiriesTable({ enquiries, estimators }: EnquiriesTableProps) {
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [estimatorFilter, setEstimatorFilter] = useState<string>('all')
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all')

  // Sort
  const [sortField, setSortField] = useState<SortField>('tenderDeadline')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    // TODO: Replace with server-side filtering when API is implemented
    return enquiries.filter((e) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        e.enquiryNumber.toLowerCase().includes(q) ||
        e.project.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.estimatorName.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || e.status === statusFilter
      const matchesEstimator =
        estimatorFilter === 'all' || e.estimatorId === estimatorFilter

      const days = daysFromNow(e.tenderDeadline)
      const matchesDeadline =
        deadlineFilter === 'all' ||
        (deadlineFilter === 'overdue' && days < 0) ||
        (deadlineFilter === '7days' && days >= 0 && days <= 7) ||
        (deadlineFilter === '30days' && days >= 0 && days <= 30)

      return matchesSearch && matchesStatus && matchesEstimator && matchesDeadline
    })
  }, [enquiries, search, statusFilter, estimatorFilter, deadlineFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number
      let bv: string | number
      switch (sortField) {
        case 'estimatedValue':
          av = a.estimatedValue ?? 0
          bv = b.estimatedValue ?? 0
          break
        case 'probability':
          av = a.probability
          bv = b.probability
          break
        default:
          av = (a as Record<string, unknown>)[sortField] as string
          bv = (b as Record<string, unknown>)[sortField] as string
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setEstimatorFilter('all')
    setDeadlineFilter('all')
    setPage(1)
  }

  const hasActiveFilters =
    search ||
    statusFilter !== 'all' ||
    estimatorFilter !== 'all' ||
    deadlineFilter !== 'all'

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ChevronUp className="size-3 text-muted-foreground/40" />
    return sortDir === 'asc' ? (
      <ChevronUp className="size-3 text-primary" />
    ) : (
      <ChevronDown className="size-3 text-primary" />
    )
  }

  function SortableHeader({
    field,
    label,
    className,
  }: {
    field: SortField
    label: string
    className?: string
  }) {
    return (
      <th className={cn('pb-2', className)}>
        <button
          onClick={() => handleSort(field)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground"
        >
          {label}
          <SortIcon field={field} />
        </button>
      </th>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search enquiries, projects, customers…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="h-8 w-[140px] text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={estimatorFilter} onValueChange={(v) => { setEstimatorFilter(v); setPage(1) }}>
          <SelectTrigger className="h-8 w-[150px] text-sm">
            <SelectValue placeholder="All Estimators" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Estimators</SelectItem>
            {estimators.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={deadlineFilter} onValueChange={(v) => { setDeadlineFilter(v); setPage(1) }}>
          <SelectTrigger className="h-8 w-[150px] text-sm">
            <SelectValue placeholder="All Deadlines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Deadlines</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="7days">Due ≤ 7 days</SelectItem>
            <SelectItem value="30days">Due ≤ 30 days</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearFilters}>
            <X data-icon="inline-start" className="size-3" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <SortableHeader field="enquiryNumber" label="Enquiry #" className="pl-4 py-2.5" />
                <SortableHeader field="customerName" label="Customer" className="py-2.5" />
                <SortableHeader field="project" label="Project" className="py-2.5" />
                <SortableHeader field="receivedDate" label="Received" className="py-2.5" />
                <SortableHeader field="tenderDeadline" label="Deadline" className="py-2.5" />
                <SortableHeader field="estimatorName" label="Estimator" className="py-2.5" />
                <SortableHeader field="status" label="Status" className="py-2.5" />
                <SortableHeader field="estimatedValue" label="Value" className="py-2.5 text-right" />
                <SortableHeader field="probability" label="Prob." className="py-2.5 text-right" />
                <SortableHeader field="lastUpdated" label="Updated" className="py-2.5" />
                <th className="py-2.5 pr-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                    No enquiries match the current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((enq) => {
                  const days = daysFromNow(enq.tenderDeadline)
                  const isUrgent = days >= 0 && days <= 7
                  const isOverdue = days < 0
                  return (
                    <tr
                      key={enq.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="pl-4 py-2.5 pr-3">
                        <Link
                          href={`/enquiries/${enq.id}`}
                          className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                        >
                          {enq.enquiryNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-xs text-foreground truncate max-w-[160px]">
                          {enq.customerName}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-xs text-foreground truncate max-w-[200px]">
                          {enq.project}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(enq.receivedDate)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isOverdue
                              ? 'text-red-600'
                              : isUrgent
                              ? 'text-amber-600'
                              : 'text-muted-foreground',
                          )}
                        >
                          {formatDate(enq.tenderDeadline)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {enq.estimatorName}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <StatusBadge status={enq.status} />
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span className="text-xs font-medium tabular-nums text-foreground">
                          {enq.estimatedValue ? formatGBP(enq.estimatedValue, 0) : '—'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs tabular-nums',
                            enq.probability >= 70
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : enq.probability >= 40
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {enq.probability}%
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(enq.lastUpdated)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center size-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                            aria-label="Enquiry actions"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                              <Link href={`/enquiries/${enq.id}`}>
                                <Eye className="size-3.5 mr-2" />
                                Open
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="size-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="size-3.5 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="border-t border-border px-4 py-2.5 flex items-center justify-between gap-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {sorted.length === 0
                ? '0 results'
                : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
