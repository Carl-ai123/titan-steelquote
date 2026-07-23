'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { UploadCloud, AlertCircle } from 'lucide-react'
import type { Customer, User } from '@/lib/types'

interface NewEnquiryFormProps {
  customers: Customer[]
  estimators: User[]
}

const ENQUIRY_SOURCES = [
  'Client Direct',
  'Main Contractor',
  'Architect',
  'Structural Engineer',
  'Framework Agreement',
  'Tender Portal',
  'Referral',
]

export function NewEnquiryForm({ customers, estimators }: NewEnquiryFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // TODO: Replace with react-hook-form + zod validation
  const [formData, setFormData] = useState({
    customerId: '',
    project: '',
    projectAddress: '',
    contactName: '',
    receivedDate: new Date().toISOString().split('T')[0],
    tenderDeadline: '',
    estimatorId: '',
    source: '',
    description: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.customerId) newErrors.customerId = 'Customer is required'
    if (!formData.project.trim()) newErrors.project = 'Project name is required'
    if (!formData.tenderDeadline) newErrors.tenderDeadline = 'Tender deadline is required'
    if (!formData.estimatorId) newErrors.estimatorId = 'Assigned estimator is required'
    if (!formData.source) newErrors.source = 'Enquiry source is required'
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setSaving(true)
    // TODO: POST to /api/enquiries and get back the new enquiry ID
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    router.push('/enquiries/enq-001') // Placeholder — redirect to new enquiry
  }

  const set = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const names = Array.from(e.dataTransfer.files).map((f) => f.name)
    setUploadedFiles((prev) => [...prev, ...names])
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-3 gap-6">
        {/* ─── Main form ─── */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Customer & Contact */}
          <Card className="border border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Customer &amp; Contact
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="customerId" className="text-xs font-medium">
                    Customer <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(v) => set('customerId', v)}
                  >
                    <SelectTrigger
                      id="customerId"
                      className={`mt-1 h-8 text-sm ${errors.customerId ? 'border-destructive' : ''}`}
                      aria-invalid={!!errors.customerId}
                      aria-describedby={errors.customerId ? 'customerId-error' : undefined}
                    >
                      <SelectValue placeholder="Select customer…" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customerId && (
                    <p id="customerId-error" className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.customerId}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactName" className="text-xs font-medium">
                    Contact Name
                  </Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => set('contactName', e.target.value)}
                    placeholder="e.g. Paul Gregson"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card className="border border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Project Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="project" className="text-xs font-medium">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => set('project', e.target.value)}
                    placeholder="e.g. Kirkstall Road Distribution Hub"
                    className={`mt-1 h-8 text-sm ${errors.project ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.project}
                    aria-describedby={errors.project ? 'project-error' : undefined}
                  />
                  {errors.project && (
                    <p id="project-error" className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.project}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="projectAddress" className="text-xs font-medium">
                    Project Address
                  </Label>
                  <Input
                    id="projectAddress"
                    value={formData.projectAddress}
                    onChange={(e) => set('projectAddress', e.target.value)}
                    placeholder="Site address including postcode"
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-xs font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Brief description of scope — type of structure, approximate tonnage, special requirements…"
                    rows={4}
                    className="mt-1 text-sm resize-none col-span-2"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-xs font-medium">
                    Internal Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Any internal notes, risk flags or programme comments…"
                    rows={4}
                    className="mt-1 text-sm resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="border border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Documents
              </h2>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-accent/50'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <UploadCloud className="size-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Drop drawings, specifications or schedules here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DWG, DXF, CSV, XLSX — up to 50 MB per file
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={() => {
                    // TODO: Trigger file input click
                  }}
                >
                  Browse files
                </Button>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {uploadedFiles.map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-muted text-xs"
                    >
                      <span className="truncate text-foreground">{name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedFiles((prev) => prev.filter((_, j) => j !== i))
                        }
                        className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
                        aria-label={`Remove ${name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Sidebar ─── */}
        <div className="col-span-1 flex flex-col gap-5">
          <Card className="border border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Dates &amp; Assignment
              </h2>
              <div className="flex flex-col gap-3.5">
                <div>
                  <Label htmlFor="receivedDate" className="text-xs font-medium">
                    Received Date
                  </Label>
                  <Input
                    id="receivedDate"
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e) => set('receivedDate', e.target.value)}
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="tenderDeadline" className="text-xs font-medium">
                    Tender Deadline <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="tenderDeadline"
                    type="date"
                    value={formData.tenderDeadline}
                    onChange={(e) => set('tenderDeadline', e.target.value)}
                    className={`mt-1 h-8 text-sm ${errors.tenderDeadline ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.tenderDeadline}
                  />
                  {errors.tenderDeadline && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.tenderDeadline}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <Label htmlFor="estimatorId" className="text-xs font-medium">
                    Assigned Estimator <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.estimatorId}
                    onValueChange={(v) => set('estimatorId', v)}
                  >
                    <SelectTrigger
                      id="estimatorId"
                      className={`mt-1 h-8 text-sm ${errors.estimatorId ? 'border-destructive' : ''}`}
                      aria-invalid={!!errors.estimatorId}
                    >
                      <SelectValue placeholder="Select estimator…" />
                    </SelectTrigger>
                    <SelectContent>
                      {estimators.filter((u) => u.active).map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} — {u.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estimatorId && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.estimatorId}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="source" className="text-xs font-medium">
                    Enquiry Source <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.source}
                    onValueChange={(v) => set('source', v)}
                  >
                    <SelectTrigger
                      id="source"
                      className={`mt-1 h-8 text-sm ${errors.source ? 'border-destructive' : ''}`}
                      aria-invalid={!!errors.source}
                    >
                      <SelectValue placeholder="Select source…" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENQUIRY_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.source && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.source}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving…' : 'Create Enquiry'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/enquiries')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
