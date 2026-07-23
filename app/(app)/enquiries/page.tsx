import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EnquiriesTable } from '@/components/enquiries/enquiries-table'
import { mockEnquiries, mockUsers } from '@/lib/mock-data'

export default function EnquiriesPage() {
  // TODO: Fetch enquiries from API with server-side filtering, sorting, pagination
  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Enquiries</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockEnquiries.length} total enquiries
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/enquiries/new">
            <Plus data-icon="inline-start" />
            New Enquiry
          </Link>
        </Button>
      </div>

      {/* Table with filters */}
      <EnquiriesTable enquiries={mockEnquiries} estimators={mockUsers} />
    </div>
  )
}
