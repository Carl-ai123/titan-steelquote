import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatGBP } from '@/lib/format'
import type { Enquiry } from '@/lib/types'

interface OverviewTabProps {
  enquiry: Enquiry
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-2 border-b border-border/50 last:border-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  )
}

export function OverviewTab({ enquiry }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-3 gap-5">
      {/* Project summary */}
      <div className="col-span-2 flex flex-col gap-5">
        <Card className="border border-border">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Project Summary
            </h3>
            <div>
              <InfoRow label="Enquiry Number" value={<code className="font-mono text-xs">{enquiry.enquiryNumber}</code>} />
              <InfoRow label="Project" value={enquiry.project} />
              <InfoRow label="Project Address" value={enquiry.projectAddress || '—'} />
              <InfoRow label="Customer" value={enquiry.customerName} />
              <InfoRow label="Contact" value={enquiry.contactName || '—'} />
              <InfoRow label="Received" value={formatDate(enquiry.receivedDate)} />
              <InfoRow label="Tender Deadline" value={formatDate(enquiry.tenderDeadline)} />
              <InfoRow label="Source" value={enquiry.source} />
            </div>
          </CardContent>
        </Card>

        {enquiry.description && (
          <Card className="border border-border">
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-sm text-foreground leading-relaxed">{enquiry.description}</p>
            </CardContent>
          </Card>
        )}

        {enquiry.notes && (
          <Card className="border border-border bg-amber-50/40">
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Internal Notes
              </h3>
              <p className="text-sm text-foreground leading-relaxed">{enquiry.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Inclusions / Exclusions / Assumptions */}
        {(enquiry.inclusions?.length ||
          enquiry.exclusions?.length ||
          enquiry.assumptions?.length) ? (
          <div className="grid grid-cols-3 gap-4">
            {enquiry.inclusions && enquiry.inclusions.length > 0 && (
              <Card className="border border-border">
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                    Inclusions
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {enquiry.inclusions.map((item, i) => (
                      <li key={i} className="text-xs text-foreground flex gap-1.5">
                        <span className="text-green-500 shrink-0 mt-0.5">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {enquiry.exclusions && enquiry.exclusions.length > 0 && (
              <Card className="border border-border">
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                    Exclusions
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {enquiry.exclusions.map((item, i) => (
                      <li key={i} className="text-xs text-foreground flex gap-1.5">
                        <span className="text-red-400 shrink-0 mt-0.5">−</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {enquiry.assumptions && enquiry.assumptions.length > 0 && (
              <Card className="border border-border">
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                    Assumptions
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {enquiry.assumptions.map((item, i) => (
                      <li key={i} className="text-xs text-foreground flex gap-1.5">
                        <span className="text-blue-400 shrink-0 mt-0.5">*</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>

      {/* Sidebar */}
      <div className="col-span-1 flex flex-col gap-5">
        <Card className="border border-border">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Commercial
            </h3>
            <div>
              <InfoRow
                label="Estimated Value"
                value={
                  enquiry.estimatedValue ? (
                    <span className="font-semibold text-foreground">
                      {formatGBP(enquiry.estimatedValue, 0)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not priced</span>
                  )
                }
              />
              <InfoRow
                label="Probability"
                value={
                  <Badge
                    variant="outline"
                    className={
                      enquiry.probability >= 70
                        ? 'bg-green-50 text-green-700 border-green-200 text-xs'
                        : enquiry.probability >= 40
                        ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                        : 'bg-muted text-muted-foreground text-xs'
                    }
                  >
                    {enquiry.probability}%
                  </Badge>
                }
              />
              <InfoRow label="Payment Terms" value={enquiry.paymentTerms || '—'} />
              <InfoRow label="Quote Validity" value={enquiry.quoteValidity || '—'} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Assignment
            </h3>
            <div>
              <InfoRow label="Estimator" value={enquiry.estimatorName} />
              <InfoRow label="Last Updated" value={formatDate(enquiry.lastUpdated)} />
              <InfoRow label="Created" value={formatDate(enquiry.createdAt)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
