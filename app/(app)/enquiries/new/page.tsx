import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewEnquiryForm } from '@/components/enquiries/new-enquiry-form'
import { mockCustomers, mockUsers } from '@/lib/mock-data'

export default function NewEnquiryPage() {
  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
          <Link href="/enquiries">
            <ChevronLeft data-icon="inline-start" className="size-3" />
            Enquiries
          </Link>
        </Button>
        <span className="text-muted-foreground/40 text-sm">/</span>
        <span className="text-xs text-muted-foreground">New Enquiry</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-foreground">New Enquiry</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Register a new tender enquiry for estimating
        </p>
      </div>

      <NewEnquiryForm customers={mockCustomers} estimators={mockUsers} />
    </div>
  )
}
