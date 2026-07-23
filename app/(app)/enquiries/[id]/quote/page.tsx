import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuotePreview } from '@/components/quote/quote-preview'
import {
  mockEnquiries,
  mockEstimate,
  mockCustomers,
} from '@/lib/mock-data'

// TODO: Replace with dynamic data fetch: GET /api/enquiries/:id/quote
export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const enquiry = mockEnquiries.find((e) => e.id === id) ?? mockEnquiries[0]
  const customer = mockCustomers.find((c) => c.id === enquiry.customerId)

  return (
    <div className="flex flex-col min-h-full">
      {/* Toolbar */}
      <div className="border-b border-border bg-card px-6 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          render={<Link href={`/enquiries/${id}`} />}
        >
            <ChevronLeft data-icon="inline-start" className="size-3" />
            Back to Enquiry
        </Button>
        <span className="text-muted-foreground/40">|</span>
        <span className="text-xs text-muted-foreground">
          {enquiry.enquiryNumber} — Quote Preview
        </span>
      </div>

      <div className="flex-1 px-6 py-6 bg-muted/30">
        <QuotePreview enquiry={enquiry} estimate={mockEstimate} customer={customer} />
      </div>
    </div>
  )
}
