'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, MoreHorizontal, Pencil, Trash2, Package, Search } from 'lucide-react'
import { formatGBP, formatDate } from '@/lib/format'
import type { MaterialRate } from '@/lib/types'

interface MaterialRatesLibraryProps {
  rates: MaterialRate[]
}

export function MaterialRatesLibrary({ rates: initial }: MaterialRatesLibraryProps) {
  const [rates, setRates] = useState<MaterialRate[]>(initial)
  const [search, setSearch] = useState('')
  const [showExpired, setShowExpired] = useState(false)
  const [editRate, setEditRate] = useState<MaterialRate | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newRate, setNewRate] = useState<Partial<MaterialRate>>({
    grade: 'S355',
    wasteAllowancePercent: 2.5,
    status: 'Current',
    effectiveDate: new Date().toISOString().split('T')[0],
  })

  const filtered = rates.filter((r) => {
    const matchesSearch =
      !search ||
      r.section.toLowerCase().includes(search.toLowerCase()) ||
      r.grade.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = showExpired ? true : r.status === 'Current'
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: string) => {
    // TODO: DELETE /api/rates/materials/:id
    setRates((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSaveNew = () => {
    // TODO: POST /api/rates/materials
    const created: MaterialRate = {
      id: `mr-new-${Date.now()}`,
      section: newRate.section ?? '',
      grade: newRate.grade ?? 'S355',
      supplier: newRate.supplier ?? '',
      pricePerTonne: newRate.pricePerTonne ?? 0,
      wasteAllowancePercent: newRate.wasteAllowancePercent ?? 2.5,
      effectiveDate: newRate.effectiveDate ?? '',
      status: 'Current',
    }
    setRates((prev) => [...prev, created])
    setIsAdding(false)
    setNewRate({ grade: 'S355', wasteAllowancePercent: 2.5, status: 'Current', effectiveDate: new Date().toISOString().split('T')[0] })
  }

  const handleSaveEdit = () => {
    if (!editRate) return
    // TODO: PATCH /api/rates/materials/:id
    setRates((prev) => prev.map((r) => (r.id === editRate.id ? editRate : r)))
    setEditRate(null)
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Material Rate Library</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Steel section rates used to price material schedules
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
            placeholder="Search section, grade, supplier…"
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
              <Package className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No rates found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {[
                    'Section',
                    'Grade',
                    'Supplier',
                    '£ / tonne',
                    'Waste %',
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
                      <span className="text-xs font-medium">{rate.section}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-xs font-mono">
                        {rate.grade}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">{rate.supplier}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold tabular-nums">
                        {formatGBP(rate.pricePerTonne, 0)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs tabular-nums">{rate.wasteAllowancePercent}%</span>
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
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(rate.id)}
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
            </table>
          )}
        </CardContent>
      </Card>

      {/* Add rate dialog */}
      <Dialog open={isAdding} onOpenChange={(o) => setIsAdding(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Material Rate</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label className="text-xs">Section Type</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Universal Column (UC)"
                value={newRate.section ?? ''}
                onChange={(e) => setNewRate((p) => ({ ...p, section: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Grade</Label>
              <Input
                className="h-8 text-xs"
                placeholder="S355"
                value={newRate.grade ?? ''}
                onChange={(e) => setNewRate((p) => ({ ...p, grade: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Supplier</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Supplier name"
                value={newRate.supplier ?? ''}
                onChange={(e) => setNewRate((p) => ({ ...p, supplier: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Price per Tonne (£)</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                value={newRate.pricePerTonne ?? ''}
                onChange={(e) => setNewRate((p) => ({ ...p, pricePerTonne: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Waste Allowance (%)</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                step="0.5"
                value={newRate.wasteAllowancePercent ?? ''}
                onChange={(e) => setNewRate((p) => ({ ...p, wasteAllowancePercent: Number(e.target.value) }))}
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
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
            <Button size="sm" onClick={handleSaveNew} disabled={!newRate.section || !newRate.supplier}>
              Add Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit rate dialog */}
      <Dialog open={!!editRate} onOpenChange={(o) => { if (!o) setEditRate(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rate — {editRate?.section}</DialogTitle>
          </DialogHeader>
          {editRate && (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label className="text-xs">Section Type</Label>
                <Input
                  className="h-8 text-xs"
                  value={editRate.section}
                  onChange={(e) => setEditRate((p) => p ? ({ ...p, section: e.target.value }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Grade</Label>
                <Input
                  className="h-8 text-xs"
                  value={editRate.grade}
                  onChange={(e) => setEditRate((p) => p ? ({ ...p, grade: e.target.value }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Supplier</Label>
                <Input
                  className="h-8 text-xs"
                  value={editRate.supplier}
                  onChange={(e) => setEditRate((p) => p ? ({ ...p, supplier: e.target.value }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Price per Tonne (£)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  value={editRate.pricePerTonne}
                  onChange={(e) => setEditRate((p) => p ? ({ ...p, pricePerTonne: Number(e.target.value) }) : p)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Waste Allowance (%)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.5"
                  value={editRate.wasteAllowancePercent}
                  onChange={(e) => setEditRate((p) => p ? ({ ...p, wasteAllowancePercent: Number(e.target.value) }) : p)}
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
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
