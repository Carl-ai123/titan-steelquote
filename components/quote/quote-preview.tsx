'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Printer, Download, Pencil } from 'lucide-react'
import { formatGBP } from '@/lib/format'
import type { Enquiry, EstimateSummary, Customer } from '@/lib/types'

interface QuotePreviewProps {
  enquiry: Enquiry
  estimate: EstimateSummary
  customer?: Customer
}

const DEFAULT_INCLUSIONS = [
  'Supply and fabrication of structural steelwork to approved drawings',
  'Site erection of structural steelwork',
  'BS EN 1090 CE marked steelwork',
  'Hot-dip galvanising to all external structural members',
  'Full structural fabrication drawings (AFC)',
  'Method statement and risk assessment',
]

const DEFAULT_EXCLUSIONS = [
  'Civil engineering works, groundworks and foundations',
  'Cladding, roofing and wall panels',
  'Concrete floor slab and superimposed finishes',
  'Mechanical, electrical and plumbing services',
  'Architectural metalwork, staircases and handrails',
]

const DEFAULT_ASSUMPTIONS = [
  'Structural foundation drawings provided by structural engineer',
  'Site access suitable for delivery of fabricated steelwork',
  'Crane access maintained throughout erection period',
  'No abnormal ground conditions affecting erection',
  'Client-issued drawings are at issued for construction status',
]

export function QuotePreview({ enquiry, estimate, customer }: QuotePreviewProps) {
  const currentRevision = enquiry.revisions[0]
  const quoteNumber = currentRevision?.quoteNumber ?? 'QTE-2025-DRAFT'
  const revision = currentRevision?.revision ?? 1
  const issueDateSource = currentRevision?.issuedAt ?? enquiry.lastUpdated
  const validityDate = new Date(issueDateSource)
  validityDate.setDate(validityDate.getDate() + 60)

  const issueDate = new Date(issueDateSource).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const validUntil = new Date(currentRevision?.validUntil ?? validityDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const [inclusions, setInclusions] = useState(
    enquiry.inclusions?.length ? enquiry.inclusions : DEFAULT_INCLUSIONS,
  )
  const [exclusions, setExclusions] = useState(
    enquiry.exclusions?.length ? enquiry.exclusions : DEFAULT_EXCLUSIONS,
  )
  const [assumptions, setAssumptions] = useState(
    enquiry.assumptions?.length ? enquiry.assumptions : DEFAULT_ASSUMPTIONS,
  )
  const [paymentTerms, setPaymentTerms] = useState(
    enquiry.paymentTerms ?? '30 days net from date of invoice',
  )
  const [quoteValidity, setQuoteValidity] = useState(
    enquiry.quoteValidity ?? '60 days from date of issue',
  )
  const [editMode, setEditMode] = useState(false)

  const handleGeneratePDF = () => {
    // TODO: POST /api/enquiries/:id/quote/generate-pdf — returns signed S3/Blob URL
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      {/* Controls bar */}
      <div className="flex items-center gap-2 print:hidden">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setEditMode((v) => !v)}
        >
          <Pencil data-icon="inline-start" className="size-3.5" />
          {editMode ? 'Done Editing' : 'Edit Quote Text'}
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleGeneratePDF}>
            <Printer data-icon="inline-start" className="size-3.5" />
            Print / PDF
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={handleGeneratePDF}>
            <Download data-icon="inline-start" className="size-3.5" />
            Generate PDF
            {/* TODO: Wire to PDF generation service */}
          </Button>
        </div>
      </div>

      {/* Quote document */}
      <Card className="border border-border shadow-sm print:shadow-none print:border-0">
        <CardContent className="p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-12 rounded bg-primary shrink-0">
                <Building2 className="size-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-tight">
                  Titan Steel Fabrications Ltd
                </p>
                <p className="text-xs text-muted-foreground">
                  Unit 14, Thorncliffe Industrial Estate, Sheffield, S35 2PH
                </p>
                <p className="text-xs text-muted-foreground">
                  Tel: 0114 284 5000 &nbsp;·&nbsp; enquiries@titansteel.co.uk
                </p>
                <p className="text-xs text-muted-foreground">
                  Company No. 04871236 &nbsp;·&nbsp; VAT No. 823 4521 17
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">QUOTATION</p>
              <p className="text-xs text-muted-foreground mt-1">
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                  {quoteNumber}
                </code>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Revision {revision}</p>
              <p className="text-xs text-muted-foreground">Date: {issueDate}</p>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Addressee and project details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Addressed To
              </p>
              <p className="text-sm font-semibold text-foreground">{enquiry.customerName}</p>
              {customer && (
                <>
                  <p className="text-xs text-muted-foreground">{customer.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.city}, {customer.postcode}
                  </p>
                </>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Attn: {enquiry.contactName ?? 'The Estimating Department'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Project Details
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Project', value: enquiry.project },
                  { label: 'Location', value: enquiry.projectAddress || '—' },
                  { label: 'Quote Ref', value: quoteNumber },
                  { label: 'Your Ref', value: enquiry.enquiryNumber },
                ].map(({ label, value }) => (
                  <div key={label} className="grid grid-cols-[90px_1fr] gap-1">
                    <span className="text-xs text-muted-foreground">{label}:</span>
                    <span className="text-xs font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Opening */}
          <div className="mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              Dear {enquiry.contactName ? enquiry.contactName.split(' ')[0] : 'Sir/Madam'},
            </p>
            <p className="text-sm text-foreground leading-relaxed mt-2">
              Thank you for the opportunity to tender for the above project. We are pleased to
              submit our quotation for the supply and erection of structural steelwork as
              detailed herein.
            </p>
          </div>

          {/* Price */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Lump Sum Price (excl. VAT)
                </p>
                <p className="text-3xl font-bold text-primary tabular-nums">
                  {formatGBP(estimate.sellingPrice, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Plus VAT at 20% where applicable (
                  {formatGBP(estimate.sellingPrice * 0.2, 0)})
                </p>
                <p className="text-xs text-muted-foreground">
                  Gross total inc. VAT:{' '}
                  <strong>{formatGBP(estimate.sellingPrice * 1.2, 0)}</strong>
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs mb-1">
                  Revision {revision}
                </Badge>
                <p className="text-xs text-muted-foreground">Valid until:</p>
                <p className="text-xs font-medium">{validUntil}</p>
              </div>
            </div>
          </div>

          {/* Inclusions */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Scope of Works / Inclusions
            </p>
            {editMode ? (
              <EditableList items={inclusions} onChange={setInclusions} />
            ) : (
              <ul className="flex flex-col gap-1.5">
                {inclusions.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground">
                    <span className="text-primary shrink-0 mt-0.5 font-bold">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Exclusions */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Exclusions
            </p>
            {editMode ? (
              <EditableList items={exclusions} onChange={setExclusions} />
            ) : (
              <ul className="flex flex-col gap-1.5">
                {exclusions.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground">
                    <span className="text-muted-foreground shrink-0 mt-0.5">&#8722;</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Assumptions */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Assumptions &amp; Qualifications
            </p>
            {editMode ? (
              <EditableList items={assumptions} onChange={setAssumptions} />
            ) : (
              <ul className="flex flex-col gap-1.5">
                {assumptions.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground">
                    <span className="text-blue-500 shrink-0 mt-0.5 font-bold">*</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator className="mb-5" />

          {/* Terms */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Payment Terms
              </p>
              {editMode ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="sr-only">Payment Terms</Label>
                  <Input
                    className="h-8 text-xs"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  />
                </div>
              ) : (
                <p className="text-xs text-foreground">{paymentTerms}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Quote Validity
              </p>
              {editMode ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="sr-only">Quote Validity</Label>
                  <Input
                    className="h-8 text-xs"
                    value={quoteValidity}
                    onChange={(e) => setQuoteValidity(e.target.value)}
                  />
                </div>
              ) : (
                <p className="text-xs text-foreground">{quoteValidity}</p>
              )}
            </div>
          </div>

          {/* Closing */}
          <div className="mb-8">
            <p className="text-xs text-muted-foreground leading-relaxed">
              We trust this quotation is in order and look forward to hearing from you. Should
              you require any clarification or wish to discuss the scope further, please do
              not hesitate to contact us.
            </p>
          </div>

          {/* Signature block */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-medium text-foreground">{enquiry.estimatorName}</p>
              <p className="text-xs text-muted-foreground">Estimating Department</p>
              <p className="text-xs text-muted-foreground">Titan Steel Fabrications Ltd</p>
              <p className="text-xs text-muted-foreground mt-2">
                T: 0114 284 5000 &nbsp;·&nbsp; enquiries@titansteel.co.uk
              </p>
            </div>
            <div className="flex flex-col justify-end items-end">
              <p className="text-xs text-muted-foreground">
                This quotation supersedes all previous correspondence.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Titan Steel Fabrications Ltd is registered in England &amp; Wales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simple inline editable list helper
function EditableList({
  items,
  onChange,
}: {
  items: string[]
  onChange: (items: string[]) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            className="h-7 text-xs flex-1"
            value={item}
            onChange={(e) => {
              const next = [...items]
              next[i] = e.target.value
              onChange(next)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs w-fit"
        onClick={() => onChange([...items, ''])}
      >
        + Add item
      </Button>
    </div>
  )
}
