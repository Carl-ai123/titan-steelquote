'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  Users,
} from 'lucide-react'
import { formatGBP } from '@/lib/format'
import type { Customer } from '@/lib/types'

const customerTypeColour: Record<Customer['type'], string> = {
  'Main Contractor': 'bg-blue-50 text-blue-700 border-blue-200',
  Developer: 'bg-purple-50 text-purple-700 border-purple-200',
  'Private Client': 'bg-muted text-muted-foreground',
  'Public Sector': 'bg-green-50 text-green-700 border-green-200',
  Subcontractor: 'bg-amber-50 text-amber-700 border-amber-200',
}

interface CustomersDirectoryProps {
  customers: Customer[]
}

export function CustomersDirectory({ customers: initial }: CustomersDirectoryProps) {
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return initial
    return initial.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.primaryContact.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    )
  }, [initial, search])

  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Customers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {initial.length} customer{initial.length !== 1 ? 's' : ''} in directory
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs">
          <Plus data-icon="inline-start" className="size-3.5" />
          Add Customer
          {/* TODO: Open create customer form */}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          className="pl-8 h-8 text-xs"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="border border-border overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-14 text-center">
              <Users className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No customers found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {[
                    'Customer',
                    'Type',
                    'City',
                    'Primary Contact',
                    'Active Enquiries',
                    'Total Won Value',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="size-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                            {customer.name}
                          </p>
                          {customer.website && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {customer.website}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${customerTypeColour[customer.type]}`}
                      >
                        {customer.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{customer.city}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-medium">{customer.primaryContact}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          customer.activeEnquiries > 0
                            ? 'text-xs bg-blue-50 text-blue-700 border-blue-200'
                            : 'text-xs'
                        }
                      >
                        {customer.activeEnquiries}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold tabular-nums">
                        {formatGBP(customer.totalValue, 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center size-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="Customer actions"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                            <ExternalLink className="size-3.5 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="size-3.5 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Customer detail dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(o) => { if (!o) setSelectedCustomer(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="flex flex-col gap-4 py-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${customerTypeColour[selectedCustomer.type]}`}
                >
                  {selectedCustomer.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {selectedCustomer.wonJobs} won jobs &nbsp;·&nbsp;{' '}
                  {selectedCustomer.activeEnquiries} active enquiries
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Address', value: `${selectedCustomer.address}, ${selectedCustomer.city}, ${selectedCustomer.postcode}` },
                  { label: 'Phone', value: selectedCustomer.phone },
                  { label: 'Email', value: selectedCustomer.email },
                  { label: 'Contact', value: selectedCustomer.primaryContact },
                  { label: 'Total Won Value', value: formatGBP(selectedCustomer.totalValue, 0) },
                  { label: 'Customer Since', value: selectedCustomer.createdAt.split('-')[0] },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
              Close
            </Button>
            <Button size="sm">
              <Phone data-icon="inline-start" className="size-3.5" />
              {/* TODO: link to CRM or create enquiry */}
              New Enquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
