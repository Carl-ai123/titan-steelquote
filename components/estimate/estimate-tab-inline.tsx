'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  RefreshCw,
  Save,
  SendHorizontal,
  ChevronRight,
  CheckCircle2,
  Calculator,
} from 'lucide-react'
import { formatGBP, formatPercent } from '@/lib/format'
import type { EstimateSummary } from '@/lib/types'

const DEFAULT_ESTIMATE: EstimateSummary = {
  id: '',
  enquiryId: '',
  revision: 1,
  materials: 0,
  labour: 0,
  consumables: 0,
  coating: 0,
  subcontracting: 0,
  transport: 0,
  plant: 0,
  overheadPercent: 18.0,
  overheadValue: 0,
  contingencyPercent: 3.0,
  contingencyValue: 0,
  totalEstimatedCost: 0,
  targetMarginPercent: 14.5,
  sellingPrice: 0,
  profit: 0,
  effectiveMarginPercent: 0,
  status: 'Draft',
  createdAt: new Date().toISOString().split('T')[0],
}

const COST_LINE_LABELS: {
  key: keyof Pick<
    EstimateSummary,
    'materials' | 'labour' | 'consumables' | 'coating' | 'subcontracting' | 'transport' | 'plant'
  >
  label: string
  description: string
}[] = [
  { key: 'materials', label: 'Materials', description: 'Steel sections, plates & hollows' },
  { key: 'labour', label: 'Labour', description: 'Shop fabrication & site erection' },
  { key: 'consumables', label: 'Consumables', description: 'Bolts, consumables & fixings' },
  { key: 'coating', label: 'Coating', description: 'Blast cleaning, primer & HDG' },
  { key: 'subcontracting', label: 'Subcontracting', description: 'NDT, specialist subcontracts' },
  { key: 'transport', label: 'Transport', description: 'Delivery & abnormal loads' },
  { key: 'plant', label: 'Plant', description: 'Craneage, MEWPs & special equipment' },
]

interface EstimateTabInlineProps {
  estimate?: EstimateSummary
  enquiryId: string
}

export function EstimateTabInline({ estimate: initial, enquiryId }: EstimateTabInlineProps) {
  const [est, setEst] = useState<EstimateSummary>(
    initial ?? { ...DEFAULT_ESTIMATE, id: `est-${enquiryId}`, enquiryId },
  )
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)

  const handleRecalculate = () => {
    // TODO: POST /api/enquiries/:id/estimate/recalculate — triggers server-side calculation
    const directCost =
      est.materials +
      est.labour +
      est.consumables +
      est.coating +
      est.subcontracting +
      est.transport +
      est.plant
    const overheadValue = directCost * (est.overheadPercent / 100)
    const subtotal = directCost + overheadValue
    const contingencyValue = subtotal * (est.contingencyPercent / 100)
    const totalEstimatedCost = subtotal + contingencyValue
    const sellingPrice = totalEstimatedCost / (1 - est.targetMarginPercent / 100)
    const profit = sellingPrice - totalEstimatedCost
    const effectiveMarginPercent = (profit / sellingPrice) * 100

    setEst((p) => ({
      ...p,
      overheadValue,
      contingencyValue,
      totalEstimatedCost,
      sellingPrice,
      profit,
      effectiveMarginPercent,
    }))
  }

  const handleSaveRevision = () => {
    // TODO: POST /api/enquiries/:id/estimate/revisions
  }

  const handleSubmitForApproval = () => {
    // TODO: PATCH /api/enquiries/:id/estimate/:revId with status: 'Submitted for Approval'
    setEst((p) => ({ ...p, status: 'Submitted for Approval' }))
    setShowApprovalDialog(false)
  }

  const statusColour =
    est.status === 'Approved'
      ? 'bg-green-50 text-green-700 border-green-200'
      : est.status === 'Submitted for Approval'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : est.status === 'Rejected'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-muted text-muted-foreground'

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Estimate — Revision {est.revision}
          </p>
          <p className="text-xs text-muted-foreground">
            {est.createdAt} &nbsp;·&nbsp; Last recalculated manually
          </p>
        </div>
        <Badge variant="outline" className={`ml-2 text-xs ${statusColour}`}>
          {est.status}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleRecalculate}>
            <RefreshCw data-icon="inline-start" className="size-3.5" />
            Recalculate
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSaveRevision}>
            <Save data-icon="inline-start" className="size-3.5" />
            Save Revision
          </Button>
          {est.status === 'Draft' && (
            <Button size="sm" className="h-8 text-xs" onClick={() => setShowApprovalDialog(true)}>
              <SendHorizontal data-icon="inline-start" className="size-3.5" />
              Submit for Approval
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left — Cost build-up */}
        <div className="col-span-2 flex flex-col gap-4">
          <Card className="border border-border">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-border bg-muted/40">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Direct Costs
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                      Item
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COST_LINE_LABELS.map(({ key, label, description }) => (
                    <tr
                      key={key}
                      className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-medium">{label}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Input
                          type="number"
                          className="h-7 w-32 text-xs text-right ml-auto tabular-nums"
                          value={est[key] || ''}
                          onChange={(e) =>
                            setEst((p) => ({ ...p, [key]: Number(e.target.value) }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/50">
                    <td colSpan={2} className="px-4 py-2.5">
                      <span className="text-xs font-semibold">Direct Cost Sub-total</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-xs font-bold tabular-nums">
                        {formatGBP(
                          est.materials +
                            est.labour +
                            est.consumables +
                            est.coating +
                            est.subcontracting +
                            est.transport +
                            est.plant,
                          0,
                        )}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* Assumptions / overheads */}
          <Card className="border border-border">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-border bg-muted/40">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Assumptions &amp; Adjustments
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Overhead (%)</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.5"
                    value={est.overheadPercent}
                    onChange={(e) =>
                      setEst((p) => ({ ...p, overheadPercent: Number(e.target.value) }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    = {formatGBP(est.overheadValue, 0)} overhead applied
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Contingency (%)</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.5"
                    value={est.contingencyPercent}
                    onChange={(e) =>
                      setEst((p) => ({ ...p, contingencyPercent: Number(e.target.value) }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    = {formatGBP(est.contingencyValue, 0)} contingency applied
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Target Margin (%)</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.5"
                    value={est.targetMarginPercent}
                    onChange={(e) =>
                      setEst((p) => ({ ...p, targetMarginPercent: Number(e.target.value) }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Applied to selling price
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Summary panel */}
        <div className="col-span-1 flex flex-col gap-4">
          <Card className="border border-border">
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Summary
              </h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Direct Costs', value: est.materials + est.labour + est.consumables + est.coating + est.subcontracting + est.transport + est.plant },
                  { label: `Overhead (${formatPercent(est.overheadPercent)})`, value: est.overheadValue },
                  { label: `Contingency (${formatPercent(est.contingencyPercent)})`, value: est.contingencyValue },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs tabular-nums">{formatGBP(value, 0)}</span>
                  </div>
                ))}

                <Separator className="my-1" />

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold">Total Cost</span>
                  <span className="text-xs font-bold tabular-nums">
                    {formatGBP(est.totalEstimatedCost, 0)}
                  </span>
                </div>

                <Separator className="my-1" />

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-foreground">Selling Price</span>
                  <span className="text-sm font-bold tabular-nums text-primary">
                    {formatGBP(est.sellingPrice, 0)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Profit</span>
                  <span className="text-xs tabular-nums text-green-700 font-medium">
                    {formatGBP(est.profit, 0)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Effective Margin</span>
                  <span className="text-xs tabular-nums font-semibold">
                    {formatPercent(est.effectiveMarginPercent)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs w-full"
            onClick={() => setShowBreakdown(true)}
          >
            <Calculator data-icon="inline-start" className="size-3.5" />
            View Calculation Breakdown
            <ChevronRight data-icon="inline-end" className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Calculation breakdown sheet */}
      <Sheet open={showBreakdown} onOpenChange={setShowBreakdown}>
        <SheetContent className="w-[420px] sm:w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Calculation Breakdown</SheetTitle>
          </SheetHeader>
          <div className="mt-5 flex flex-col gap-3 text-sm">
            <p className="text-xs text-muted-foreground">
              This shows how the selling price is derived from the direct cost inputs.
            </p>
            <Separator />
            {COST_LINE_LABELS.map(({ key, label }) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="tabular-nums font-medium">{formatGBP(est[key] as number, 0)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-xs font-semibold">
              <span>Direct Sub-total</span>
              <span className="tabular-nums">
                {formatGBP(
                  est.materials + est.labour + est.consumables + est.coating +
                  est.subcontracting + est.transport + est.plant, 0,
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Overhead @ {formatPercent(est.overheadPercent)}
              </span>
              <span className="tabular-nums">{formatGBP(est.overheadValue, 0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Contingency @ {formatPercent(est.contingencyPercent)}
              </span>
              <span className="tabular-nums">{formatGBP(est.contingencyValue, 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xs font-bold">
              <span>Total Estimated Cost</span>
              <span className="tabular-nums">{formatGBP(est.totalEstimatedCost, 0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Margin @ {formatPercent(est.targetMarginPercent)} on selling price
              </span>
              <span className="tabular-nums">{formatGBP(est.profit, 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold text-primary">
              <span>Selling Price</span>
              <span className="tabular-nums">{formatGBP(est.sellingPrice, 0)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {/* TODO: Wire to actual VAT setting from /settings */}
              VAT at 20% would add {formatGBP(est.sellingPrice * 0.2, 0)}, giving a gross total
              of {formatGBP(est.sellingPrice * 1.2, 0)}.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Submit for approval dialog */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Estimate for Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              This will lock the estimate at{' '}
              <strong>{formatGBP(est.sellingPrice, 0)}</strong> and notify the
              Estimating Manager. You will not be able to edit it until it is reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitForApproval}>
              <CheckCircle2 className="size-3.5 mr-1.5" />
              Submit for Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
