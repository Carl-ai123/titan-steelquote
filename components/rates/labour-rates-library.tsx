'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, HardHat, Search } from 'lucide-react'
import { formatGBP, formatDate, formatNumber } from '@/lib/format'
import type { LabourRate } from '@/lib/types'

interface LabourRatesLibraryProps {
  rates: LabourRate[]
}

export function LabourRatesLibrary({ rates: initial }: LabourRatesLibraryProps) {
  const [rates, setRates] = useState<LabourRate[]>(initial)
  const [search, setSearch] = useState('')
  const [showExpired, setShowExpired] = useState(false)
  const [editRate, setEditRate] = useState<LabourRate | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newRate, setNewRate] = useState<Partial<LabourRate>>({
    setupTimeHours: 1.0,
    unitTimeHours: 0.25,
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'Current',
  })

  const filtered = rates.filter((r) => {
    const matchesSearch =
      !search ||
      r.operation.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = showExpired ? true : r.status === 'Current'
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: string) => {
    // TODO: DELETE /api/rates/labour/:id
    setRates((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSaveNew = () => {
    // TODO: POST /api/rates/labour
    const created: LabourRate = {
      id: `lr-new-${Date.now()}`,
      operation: newRate.operation ?? '',
      description: newRate.description ?? '',
      hourlyRate: newRate.hourlyRate ?? 0,
      setupTimeHours: newRate.setupTimeHours ?? 1.0,
      unitTimeHours: newRate.unitTimeHours ?? 0.25,
      effectiveDate: newRate.effectiveDate ?? '',
      status: 'Current',
    }
    setRates((prev) => [...prev, created])
    setIsAdding(false)
    setNewRate({ setupTimeHours: 1.0, unitTimeHours: 0.25, effectiveDate: new Date().toISOString().split('T')[0], status: 'Current' })
  }

  const handleSaveEdit = () => {
    if (!editRate) return
    // TODO: PATCH /api/rates/labour/:id
    setRates((prev) => prev.map((r) => (r.id === editRate.id ? editRate : r)))
    setEditRate(null)
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Labour Rate Library</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Shop and site operation rates for labour estimating
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => setIsAdding(true)}>
          <Plus data-icon="inline-start" className="size-3.5" />
          Add Rate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-xs w-64"
            placeholder="Search operation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={showExpired ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setShowExpired((v) => !v)}
        >
          Show Expired
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-border overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-14 text-center">
              <HardHat className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No rates found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {[
                    'Operation',
                    'Description',
                    '£ / hour',
                    'Setup Hrs',
                    'Unit Hrs',
                    'Effective Date',
                    'Status',
                    'Notes',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rate) => (
                  <tr
                    key={rate.id}
                    className={`border-b border-border/60 last:border-0 hover:bg-muted/30 ${
                      rate.status === 'Expired' ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold">{rate.operation}</span>
                    </td>
                    <td className="px-4 py-2.5 max-w-[220px]">
                      <span className="text-xs text-muted-foreground truncate block">
                        {rate.description}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold tabular-nums">
                        {formatGBP(rate.hourlyRate, 2)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs tabular-nums">{formatNumber(rate.setupTimeHours, 1)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs tabular-nums">{formatNumber(rate.unitTimeHours, 2)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(rate.effectiveDate)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant="outline"
                        className={
                          rate.status === 'Current'
                            ? 'text-xs bg-green-50 text-green-700 border-green-200'
                            : 'text-xs bg-muted text-muted-foreground'
                        }
                      >
                        {rate.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 max-w-[160px]">
                      <span className="text-xs text-muted-foreground truncate block">
                        {rate.notes ?? '—'}
                      </span>
                    </td>
                    <td className="pr-3 py-2.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center size-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="Rate actions"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => setEditRate({ ...rate })}>
                            <Pencil className="size-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(rate.id)}>
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

      {/* Add dialog */}
      <Dialog open={isAdding} onOpenChange={(o) => setIsAdding(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Labour Rate</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Operation</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Welding – MIG/MAG"
                value={newRate.operation ?? ''}
                onChange={(e) => setNewRate((p) => ({ ...p, operation: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                className="text-xs min-h-[56px] resize-none"
                placeholder="Brief description"
                value={newRate.description ?? ''}
                onChange={(e) => setNewRate((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">£ / Hour</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.5"
                  value={newRate.hourlyRate ?? ''}
                  onChange={(e) => setNewRate((p) => ({ ...p, hourlyRate: Number(e.target.value) }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Setup Hrs</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.25"
                  value={newRate.setupTimeHours ?? ''}
                  onChange={(e) => setNewRate((p) => ({ ...p, setupTimeHours: Number(e.target.value) }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Unit Hrs</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.01"
                  value={newRate.unitTimeHours ?? ''}
                  onChange={(e) => setNewRate((p) => ({ ...p, unitTimeHours: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Effective Date</Label>
              <Input
                className="h-8 text-xs"
                type="date"
                value={newRate.effectiveDate ?? ''}
                onChange={(e) => setNewRate((p) => ({ ...p, effectiveDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveNew} disabled={!newRate.operation}>Add Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editRate} onOpenChange={(o) => { if (!o) setEditRate(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rate — {editRate?.operation}</DialogTitle>
          </DialogHeader>
          {editRate && (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Operation</Label>
                <Input
                  className="h-8 text-xs"
                  value={editRate.operation}
                  onChange={(e) => setEditRate((p) => p ? ({ ...p, operation: e.target.value }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  className="text-xs min-h-[56px] resize-none"
                  value={editRate.description}
                  onChange={(e) => setEditRate((p) => p ? ({ ...p, description: e.target.value }) : p)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">£ / Hour</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.5"
                    value={editRate.hourlyRate}
                    onChange={(e) => setEditRate((p) => p ? ({ ...p, hourlyRate: Number(e.target.value) }) : p)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Setup Hrs</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.25"
                    value={editRate.setupTimeHours}
                    onChange={(e) => setEditRate((p) => p ? ({ ...p, setupTimeHours: Number(e.target.value) }) : p)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Unit Hrs</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.01"
                    value={editRate.unitTimeHours}
                    onChange={(e) => setEditRate((p) => p ? ({ ...p, unitTimeHours: Number(e.target.value) }) : p)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Effective Date</Label>
                <Input
                  className="h-8 text-xs"
                  type="date"
                  value={editRate.effectiveDate}
                  onChange={(e) => setEditRate((p) => p ? ({ ...p, effectiveDate: e.target.value }) : p)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditRate(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
