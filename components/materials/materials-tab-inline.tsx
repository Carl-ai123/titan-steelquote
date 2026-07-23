'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Upload,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Package,
} from 'lucide-react'
import { formatGBP, formatWeight, formatNumber } from '@/lib/format'
import type { SteelMaterialLine } from '@/lib/types'

const validationIcon: Record<SteelMaterialLine['validationStatus'], React.ReactNode> = {
  Valid: <CheckCircle2 className="size-3.5 text-green-600" />,
  Warning: <AlertTriangle className="size-3.5 text-amber-500" />,
  Error: <XCircle className="size-3.5 text-destructive" />,
}

const EMPTY_LINE: Omit<SteelMaterialLine, 'id' | 'enquiryId'> = {
  mark: '',
  section: '',
  grade: 'S355',
  lengthMm: 0,
  quantity: 1,
  unitWeightKgm: 0,
  totalWeightKg: 0,
  pricePerTonne: 0,
  wastePercent: 2.5,
  totalCost: 0,
  validationStatus: 'Valid',
}

interface MaterialsTabInlineProps {
  materials: SteelMaterialLine[]
  enquiryId: string
}

export function MaterialsTabInline({ materials: initial, enquiryId }: MaterialsTabInlineProps) {
  const [lines, setLines] = useState<SteelMaterialLine[]>(initial)
  const [editLine, setEditLine] = useState<SteelMaterialLine | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newLine, setNewLine] = useState<Omit<SteelMaterialLine, 'id' | 'enquiryId'>>(EMPTY_LINE)

  const errors = lines.filter((l) => l.validationStatus === 'Error')
  const warnings = lines.filter((l) => l.validationStatus === 'Warning')

  const totalWeightKg = lines.reduce((s, l) => s + l.totalWeightKg, 0)
  const totalCost = lines.reduce((s, l) => s + l.totalCost, 0)

  const handleDelete = (id: string) => {
    // TODO: DELETE /api/enquiries/:enquiryId/materials/:id
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const handleSaveNew = () => {
    // TODO: POST /api/enquiries/:enquiryId/materials
    const created: SteelMaterialLine = {
      ...newLine,
      id: `ml-new-${Date.now()}`,
      enquiryId,
    }
    setLines((prev) => [...prev, created])
    setIsAdding(false)
    setNewLine(EMPTY_LINE)
  }

  const handleSaveEdit = () => {
    if (!editLine) return
    // TODO: PATCH /api/enquiries/:enquiryId/materials/:id
    setLines((prev) => prev.map((l) => (l.id === editLine.id ? editLine : l)))
    setEditLine(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Upload data-icon="inline-start" className="size-3.5" />
          Import CSV
          {/* TODO: wire to CSV parser and import handler */}
        </Button>
        <Button size="sm" className="h-8 text-xs" onClick={() => setIsAdding(true)}>
          <Plus data-icon="inline-start" className="size-3.5" />
          Add Line
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {lines.length} line{lines.length !== 1 ? 's' : ''} &nbsp;·&nbsp; {formatWeight(totalWeightKg)}
        </span>
      </div>

      {/* Import error / warning banner */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="py-2.5">
          <XCircle className="size-4" />
          <AlertDescription className="text-xs">
            {errors.length} line{errors.length !== 1 ? 's have' : ' has'} validation errors.
            Review highlighted rows before saving.
          </AlertDescription>
        </Alert>
      )}
      {warnings.length > 0 && errors.length === 0 && (
        <Alert className="py-2.5 border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle className="size-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            {warnings.length} line{warnings.length !== 1 ? 's have' : ' has'} warnings that
            should be reviewed.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card className="border border-border overflow-hidden">
        <CardContent className="p-0">
          {lines.length === 0 ? (
            <div className="py-14 text-center">
              <Package className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No material lines added.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Import a CSV schedule or add lines manually.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      'Mark',
                      'Section',
                      'Grade',
                      'Length (mm)',
                      'Qty',
                      'Unit Wt (kg/m)',
                      'Total Wt',
                      '£/t',
                      'Waste %',
                      'Total Cost',
                      '',
                      '',
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={`px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap ${
                          i >= 3 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr
                      key={line.id}
                      className={`border-b border-border/60 last:border-0 hover:bg-muted/30 ${
                        line.validationStatus === 'Error'
                          ? 'bg-red-50/60'
                          : line.validationStatus === 'Warning'
                          ? 'bg-amber-50/40'
                          : ''
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <code className="text-xs font-mono font-medium">{line.mark}</code>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-medium">{line.section}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-xs font-mono">
                          {line.grade}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">
                          {formatNumber(line.lengthMm, 0)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">{line.quantity}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">
                          {line.unitWeightKgm > 0 ? formatNumber(line.unitWeightKgm, 1) : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums font-medium">
                          {formatWeight(line.totalWeightKg)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">
                          {formatGBP(line.pricePerTonne, 0)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">{line.wastePercent}%</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums font-semibold">
                          {formatGBP(line.totalCost, 0)}
                        </span>
                      </td>
                      {/* Validation status */}
                      <td className="px-2 py-2.5 text-center">
                        <span title={line.validationMessage ?? ''}>
                          {validationIcon[line.validationStatus]}
                        </span>
                      </td>
                      <td className="pr-3 py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center size-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                            aria-label="Line actions"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => setEditLine({ ...line })}>
                              <Pencil className="size-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(line.id)}
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/60">
                    <td colSpan={6} className="px-3 py-2.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Totals
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-bold">{formatWeight(totalWeightKg)}</span>
                    </td>
                    <td colSpan={2} />
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-bold">{formatGBP(totalCost, 0)}</span>
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add line dialog */}
      <Dialog open={isAdding} onOpenChange={(o) => { setIsAdding(o); if (!o) setNewLine(EMPTY_LINE) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Material Line</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Mark</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. A1"
                value={newLine.mark}
                onChange={(e) => setNewLine((p) => ({ ...p, mark: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Section</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. UC 254x254x89"
                value={newLine.section}
                onChange={(e) => setNewLine((p) => ({ ...p, section: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Grade</Label>
              <Input
                className="h-8 text-xs"
                placeholder="S355"
                value={newLine.grade}
                onChange={(e) => setNewLine((p) => ({ ...p, grade: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Length (mm)</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                value={newLine.lengthMm || ''}
                onChange={(e) => setNewLine((p) => ({ ...p, lengthMm: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Quantity</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                value={newLine.quantity || ''}
                onChange={(e) => setNewLine((p) => ({ ...p, quantity: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Unit Weight (kg/m)</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                step="0.1"
                value={newLine.unitWeightKgm || ''}
                onChange={(e) => setNewLine((p) => ({ ...p, unitWeightKgm: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Price per Tonne (£)</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                value={newLine.pricePerTonne || ''}
                onChange={(e) => setNewLine((p) => ({ ...p, pricePerTonne: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Waste %</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                step="0.5"
                value={newLine.wastePercent || ''}
                onChange={(e) => setNewLine((p) => ({ ...p, wastePercent: Number(e.target.value) }))}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {/* TODO: Auto-calculate total weight and cost on save */}
            Total weight and cost will be calculated on save.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNew} disabled={!newLine.mark || !newLine.section}>
              Add Line
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit line dialog */}
      <Dialog open={!!editLine} onOpenChange={(o) => { if (!o) setEditLine(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Line — {editLine?.mark}</DialogTitle>
          </DialogHeader>
          {editLine && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Mark</Label>
                <Input
                  className="h-8 text-xs"
                  value={editLine.mark}
                  onChange={(e) => setEditLine((p) => p ? ({ ...p, mark: e.target.value }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Section</Label>
                <Input
                  className="h-8 text-xs"
                  value={editLine.section}
                  onChange={(e) => setEditLine((p) => p ? ({ ...p, section: e.target.value }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Grade</Label>
                <Input
                  className="h-8 text-xs"
                  value={editLine.grade}
                  onChange={(e) => setEditLine((p) => p ? ({ ...p, grade: e.target.value }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Length (mm)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  value={editLine.lengthMm}
                  onChange={(e) => setEditLine((p) => p ? ({ ...p, lengthMm: Number(e.target.value) }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Quantity</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  value={editLine.quantity}
                  onChange={(e) => setEditLine((p) => p ? ({ ...p, quantity: Number(e.target.value) }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Unit Weight (kg/m)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.1"
                  value={editLine.unitWeightKgm}
                  onChange={(e) => setEditLine((p) => p ? ({ ...p, unitWeightKgm: Number(e.target.value) }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Price per Tonne (£)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  value={editLine.pricePerTonne}
                  onChange={(e) => setEditLine((p) => p ? ({ ...p, pricePerTonne: Number(e.target.value) }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Waste %</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.5"
                  value={editLine.wastePercent}
                  onChange={(e) => setEditLine((p) => p ? ({ ...p, wastePercent: Number(e.target.value) }) : p)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditLine(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
