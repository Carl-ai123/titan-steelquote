'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Upload,
  FileText,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import type { Document } from '@/lib/types'

const docTypeColors: Record<Document['type'], string> = {
  Drawing: 'bg-blue-50 text-blue-700 border-blue-200',
  Specification: 'bg-purple-50 text-purple-700 border-purple-200',
  BOM: 'bg-green-50 text-green-700 border-green-200',
  Quote: 'bg-amber-50 text-amber-700 border-amber-200',
  Correspondence: 'bg-slate-50 text-slate-600 border-slate-200',
  Other: 'bg-muted text-muted-foreground',
}

interface DocumentsTabProps {
  documents: Document[]
  enquiryId: string
}

export function DocumentsTab({ documents }: DocumentsTabProps) {
  const [dragActive, setDragActive] = useState(false)

  // TODO: Implement document upload to blob storage
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    // TODO: Upload files via POST /api/enquiries/:id/documents
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-accent/50'
            : 'border-border hover:border-muted-foreground/40'
        }`}
      >
        <Upload className="size-6 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">
          Drop files here or{' '}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => {
              // TODO: Open file picker
            }}
          >
            browse
          </button>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DWG, DXF, CSV, XLSX — max 50 MB
        </p>
      </div>

      {/* Document list */}
      <Card className="border border-border">
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            </div>
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">
                    Uploaded by
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium text-foreground truncate max-w-[280px]">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={`text-xs ${docTypeColors[doc.type]}`}
                      >
                        {doc.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">{doc.uploadedBy}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(doc.uploadedAt.split('T')[0])}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center size-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="Document actions"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem>
                            <Eye className="size-3.5 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="size-3.5 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="size-3.5 mr-2" />
                            Delete
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
    </div>
  )
}
