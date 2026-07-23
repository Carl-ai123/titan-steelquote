'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, Hammer } from 'lucide-react'
import { formatGBP, formatNumber } from '@/lib/format'
import type { LabourOperation } from '@/lib/types'

const EMPTY_OP: Omit<LabourOperation, 'id' | 'enquiryId'> = {
  operation: '',
  description: '',
  quantity: 1,
  setupHours: 0,
  unitHours: 0,
  totalHours: 0,
  hourlyRate: 42,
  totalLabourCost: 0,
}

interface LabourTabInlineProps {
  labour: LabourOperation[]
  enquiryId: string
}

export function LabourTabInline({ labour: initial, enquiryId }: LabourTabInlineProps) {
  const [ops, setOps] = useState<LabourOperation[]>(initial)
  const [editOp, setEditOp] = useState<LabourOperation | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newOp, setNewOp] = useState<Omit<LabourOperation, 'id' | 'enquiryId'>>(EMPTY_OP)

  const totalHours = ops.reduce((s, o) => s + o.totalHours, 0)
  const totalCost = ops.reduce((s, o) => s + o.totalLabourCost, 0)

  const handleDelete = (id: string) => {
    // TODO: DELETE /api/enquiries/:enquiryId/labour/:id
    setOps((prev) => prev.filter((o) => o.id !== id))
  }

  const handleSaveNew = () => {
    // TODO: POST /api/enquiries/:enquiryId/labour
    const created: LabourOperation = {
      ...newOp,
      totalHours: newOp.setupHours + newOp.unitHours * newOp.quantity,
      totalLabourCost: (newOp.setupHours + newOp.unitHours * newOp.quantity) * newOp.hourlyRate,
      id: `lo-new-${Date.now()}`,
      enquiryId,
    }
    setOps((prev) => [...prev, created])
    setIsAdding(false)
    setNewOp(EMPTY_OP)
  }

  const handleSaveEdit = () => {
    if (!editOp) return
    // TODO: PATCH /api/enquiries/:enquiryId/labour/:id
    const updated = {
      ...editOp,
      totalHours: editOp.setupHours + editOp.unitHours * editOp.quantity,
      totalLabourCost: (editOp.setupHours + editOp.unitHours * editOp.quantity) * editOp.hourlyRate,
    }
    setOps((prev) => prev.map((o) => (o.id === editOp.id ? updated : o)))
    setEditOp(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8 text-xs" onClick={() => setIsAdding(true)}>
          <Plus data-icon="inline-start" className="size-3.5" />
          Add Operation
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {ops.length} operation{ops.length !== 1 ? 's' : ''} &nbsp;·&nbsp;{' '}
          {formatNumber(totalHours, 1)} hrs total
        </span>
      </div>

      <Card className="border border-border overflow-hidden">
        <CardContent className="p-0">
          {ops.length === 0 ? (
            <div className="py-14 text-center">
              <Hammer className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No labour operations added.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add operations manually or import from the labour rate library.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      'Operation',
                      'Description',
                      'Qty',
                      'Setup Hrs',
                      'Unit Hrs',
                      'Total Hrs',
                      '£/hr',
                      'Total Cost',
                      '',
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={`px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap ${
                          i >= 2 && i < 8 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ops.map((op) => (
                    <tr
                      key={op.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-semibold">{op.operation}</span>
                      </td>
                      <td className="px-3 py-2.5 max-w-[260px]">
                        <span className="text-xs text-muted-foreground truncate block">
                          {op.description}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">{op.quantity}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">{formatNumber(op.setupHours, 1)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">{formatNumber(op.unitHours, 1)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums font-medium">
                          {formatNumber(op.totalHours, 1)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums">{formatGBP(op.hourlyRate, 2)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs tabular-nums font-semibold">
                          {formatGBP(op.totalLabourCost, 0)}
                        </span>
                      </td>
                      <td className="pr-3 py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center size-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                            aria-label="Operation actions"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => setEditOp({ ...op })}>
                              <Pencil className="size-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(op.id)}
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
                    <td colSpan={5} className="px-3 py-2.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Totals
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-bold">
                        {formatNumber(totalHours, 1)} hrs
                      </span>
                    </td>
                    <td />
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-bold">{formatGBP(totalCost, 0)}</span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add operation dialog */}
      <Dialog open={isAdding} onOpenChange={(o) => { setIsAdding(o); if (!o) setNewOp(EMPTY_OP) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Labour Operation</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Operation</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Welding – Fabrication"
                value={newOp.operation}
                onChange={(e) => setNewOp((p) => ({ ...p, operation: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                className="text-xs min-h-[60px] resize-none"
                placeholder="Brief description of work scope"
                value={newOp.description}
                onChange={(e) => setNewOp((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Quantity</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  value={newOp.quantity || ''}
                  onChange={(e) => setNewOp((p) => ({ ...p, quantity: Number(e.target.value) }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Setup Hours</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.5"
                  value={newOp.setupHours || ''}
                  onChange={(e) => setNewOp((p) => ({ ...p, setupHours: Number(e.target.value) }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Unit Hours</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.5"
                  value={newOp.unitHours || ''}
                  onChange={(e) => setNewOp((p) => ({ ...p, unitHours: Number(e.target.value) }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Hourly Rate (£)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.5"
                  value={newOp.hourlyRate || ''}
                  onChange={(e) => setNewOp((p) => ({ ...p, hourlyRate: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNew} disabled={!newOp.operation}>
              Add Operation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit operation dialog */}
      <Dialog open={!!editOp} onOpenChange={(o) => { if (!o) setEditOp(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Operation — {editOp?.operation}</DialogTitle>
          </DialogHeader>
          {editOp && (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Operation</Label>
                <Input
                  className="h-8 text-xs"
                  value={editOp.operation}
                  onChange={(e) => setEditOp((p) => p ? ({ ...p, operation: e.target.value }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  className="text-xs min-h-[60px] resize-none"
                  value={editOp.description}
                  onChange={(e) => setEditOp((p) => p ? ({ ...p, description: e.target.value }) : p)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    value={editOp.quantity}
                    onChange={(e) => setEditOp((p) => p ? ({ ...p, quantity: Number(e.target.value) }) : p)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Setup Hours</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.5"
                    value={editOp.setupHours}
                    onChange={(e) => setEditOp((p) => p ? ({ ...p, setupHours: Number(e.target.value) }) : p)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Unit Hours</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.5"
                    value={editOp.unitHours}
                    onChange={(e) => setEditOp((p) => p ? ({ ...p, unitHours: Number(e.target.value) }) : p)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Hourly Rate (£)</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.5"
                    value={editOp.hourlyRate}
                    onChange={(e) => setEditOp((p) => p ? ({ ...p, hourlyRate: Number(e.target.value) }) : p)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditOp(null)}>
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
