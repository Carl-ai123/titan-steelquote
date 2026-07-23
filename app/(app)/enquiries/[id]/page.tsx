import { notFound } from 'next/navigation'
import { EnquiryWorkspace } from '@/components/enquiries/enquiry-workspace'
import {
  mockEnquiries,
  mockDocuments,
  mockActivityLog,
  mockMaterialLines,
  mockLabourOperations,
  mockEstimate,
} from '@/lib/mock-data'

interface EnquiryPageProps {
  params: Promise<{ id: string }>
}

export default async function EnquiryDetailPage({ params }: EnquiryPageProps) {
  const { id } = await params
  // TODO: Fetch enquiry by ID from API/database
  const enquiry = mockEnquiries.find((e) => e.id === id)

  if (!enquiry) {
    notFound()
  }

  const documents = mockDocuments.filter((d) => d.enquiryId === id)
  const activity = mockActivityLog
    .filter((a) => a.enquiryId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const materials = mockMaterialLines.filter((m) => m.enquiryId === id)
  const labour = mockLabourOperations.filter((l) => l.enquiryId === id)
  const estimate = mockEstimate.enquiryId === id ? mockEstimate : undefined

  return (
    <EnquiryWorkspace
      enquiry={enquiry}
      documents={documents}
      activity={activity}
      materials={materials}
      labour={labour}
      estimate={estimate}
    />
  )
}
