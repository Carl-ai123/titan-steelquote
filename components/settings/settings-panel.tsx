'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Building2,
  Users,
  Hash,
  Sliders,
  Percent,
  Receipt,
  Palette,
  Save,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import type { OrgSettings, User } from '@/lib/types'
import {
  inviteOrganisationUser,
  saveOrganisationSettings,
  setMembershipActive,
} from '@/app/(app)/settings/actions'

interface SettingsPanelProps {
  settings: OrgSettings
  users: User[]
}

const ROLE_COLOURS: Record<User['role'], string> = {
  Director: 'bg-purple-50 text-purple-700 border-purple-200',
  'Estimating Manager': 'bg-blue-50 text-blue-700 border-blue-200',
  'Senior Estimator': 'bg-green-50 text-green-700 border-green-200',
  Estimator: 'bg-muted text-muted-foreground',
  Admin: 'bg-amber-50 text-amber-700 border-amber-200',
}

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function SaveButton({
  section,
  saved,
  onSave,
  disabled,
}: {
  section: string
  saved: boolean
  onSave: (section: string) => void
  disabled?: boolean
}) {
  return (
    <Button
      size="sm"
      className="h-8 text-xs"
      onClick={() => onSave(section)}
      disabled={disabled}
    >
      <Save data-icon="inline-start" className="size-3.5" />
      {saved ? 'Saved!' : 'Save Changes'}
    </Button>
  )
}

export function SettingsPanel({
  settings: initial,
  users: initialUsers,
  canManageOrganisation,
  canManageUsers,
  currentMembershipId,
}: SettingsPanelProps & {
  canManageOrganisation: boolean
  canManageUsers: boolean
  currentMembershipId: string
}) {
  const router = useRouter()
  const [settings, setSettings] = useState<OrgSettings>(initial)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'Estimator', active: true })
  const [savedSections, setSavedSections] = useState<string[]>([])
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{
    ok: boolean
    text: string
  } | null>(null)

  const handleSave = async (section: string) => {
    setPendingAction(`save-${section}`)
    setActionMessage(null)
    const result = await saveOrganisationSettings(settings)
    setPendingAction(null)
    setActionMessage({ ok: result.ok, text: result.message })

    if (result.ok) {
      setSavedSections((prev) => [...prev, section])
      setTimeout(
        () => setSavedSections((prev) => prev.filter((item) => item !== section)),
        2000,
      )
      router.refresh()
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      return
    }

    setPendingAction('invite')
    setActionMessage(null)
    const result = await inviteOrganisationUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    })
    setPendingAction(null)
    setActionMessage({ ok: result.ok, text: result.message })

    if (result.ok) {
      setIsAddingUser(false)
      setNewUser({ role: 'Estimator', active: true })
      router.refresh()
    }
  }

  const handleDeactivateUser = async (id: string) => {
    const user = users.find((item) => item.id === id)
    if (!user) {
      return
    }

    setPendingAction(`member-${id}`)
    setActionMessage(null)
    const result = await setMembershipActive({
      membershipId: id,
      active: !user.active,
    })
    setPendingAction(null)
    setActionMessage({ ok: result.ok, text: result.message })

    if (result.ok) {
      setUsers((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                active: !item.active,
                status: !item.active ? 'active' : 'deactivated',
              }
            : item,
        ),
      )
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-0 px-6 py-5">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Organisation profile, defaults, numbering and user management
        </p>
      </div>

      {actionMessage ? (
        <div
          role="status"
          className={`mb-4 rounded-md border px-3 py-2 text-xs ${
            actionMessage.ok
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {actionMessage.text}
        </div>
      ) : null}

      <Tabs defaultValue="organisation">
        <TabsList className="border-b border-border rounded-none bg-transparent p-0 h-auto mb-6 flex gap-0 overflow-x-auto">
          {[
            { value: 'organisation', label: 'Organisation', icon: Building2 },
            { value: 'users', label: 'Users & Roles', icon: Users },
            { value: 'numbering', label: 'Numbering', icon: Hash },
            { value: 'defaults', label: 'Defaults', icon: Sliders },
            { value: 'financials', label: 'Financials', icon: Percent },
            { value: 'branding', label: 'Branding', icon: Palette },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent hover:bg-muted/50 transition-colors font-medium text-muted-foreground data-[state=active]:shadow-none whitespace-nowrap"
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Organisation Profile */}
        <TabsContent value="organisation" className="mt-0 max-w-2xl">
          <Card className="border border-border">
            <CardContent className="p-6">
              <SectionHeader
                icon={Building2}
                title="Organisation Profile"
                description="Your company details shown on quotations and correspondence"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label className="text-xs">Registered Company Name</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.companyName}
                    onChange={(e) => setSettings((p) => ({ ...p, companyName: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Trading Name (if different)</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.tradingName ?? ''}
                    onChange={(e) => setSettings((p) => ({ ...p, tradingName: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.phone}
                    onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label className="text-xs">Address</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.address}
                    onChange={(e) => setSettings((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">City</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.city}
                    onChange={(e) => setSettings((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Postcode</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.postcode}
                    onChange={(e) => setSettings((p) => ({ ...p, postcode: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input
                    className="h-8 text-xs"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Website</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.website ?? ''}
                    onChange={(e) => setSettings((p) => ({ ...p, website: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Companies House Number</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={settings.companyNumber}
                    onChange={(e) => setSettings((p) => ({ ...p, companyNumber: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">VAT Registration Number</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={settings.vatNumber}
                    onChange={(e) => setSettings((p) => ({ ...p, vatNumber: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <SaveButton
                  section="organisation"
                  saved={savedSections.includes('organisation')}
                  onSave={handleSave}
                  disabled={!canManageOrganisation || pendingAction !== null}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users & Roles */}
        <TabsContent value="users" className="mt-0 max-w-3xl">
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-5">
                <SectionHeader
                  icon={Users}
                  title="Users & Roles"
                  description="Manage estimators, managers and admin access"
                />
                <Button
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  onClick={() => setIsAddingUser(true)}
                  disabled={!canManageUsers || pendingAction !== null}
                >
                  <Plus data-icon="inline-start" className="size-3.5" />
                  Add User
                </Button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Name', 'Email', 'Role', 'Status', ''].map((h) => (
                      <th key={h} className="text-left pb-2.5 text-xs font-medium text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary">{user.initials}</span>
                          </div>
                          <span className="text-xs font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className={`text-xs ${ROLE_COLOURS[user.role]}`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="outline"
                          className={
                            user.status === 'invited'
                              ? 'text-xs bg-blue-50 text-blue-700 border-blue-200'
                              : user.active
                                ? 'text-xs bg-green-50 text-green-700 border-green-200'
                                : 'text-xs'
                          }
                        >
                          {user.status === 'invited'
                            ? 'Invited'
                            : user.active
                              ? 'Active'
                              : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="size-6" aria-label="Edit user">
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground"
                            aria-label={user.active ? 'Deactivate user' : 'Activate user'}
                            onClick={() => handleDeactivateUser(user.id)}
                            disabled={
                              !canManageUsers ||
                              user.id === currentMembershipId ||
                              user.role === 'Admin' ||
                              pendingAction !== null
                            }
                          >
                            <ShieldCheck className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-4">
                {/* TODO: Link to IAM / auth provider role assignment */}
                Role permissions and authentication are managed through the identity provider.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Numbering */}
        <TabsContent value="numbering" className="mt-0 max-w-xl">
          <Card className="border border-border">
            <CardContent className="p-6">
              <SectionHeader
                icon={Hash}
                title="Quote Numbering"
                description="Configure the quotation number prefix and sequence"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Quote Number Prefix</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    placeholder="QTE"
                    value={settings.quotePrefix}
                    onChange={(e) => setSettings((p) => ({ ...p, quotePrefix: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g. QTE, REF, TSF
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Next Quote Number</Label>
                  <Input
                    className="h-8 text-xs tabular-nums"
                    type="number"
                    value={settings.quoteStartNumber}
                    onChange={(e) => setSettings((p) => ({ ...p, quoteStartNumber: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Preview: {settings.quotePrefix}-2025-{String(settings.quoteStartNumber).padStart(4, '0')}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <SaveButton
                  section="numbering"
                  saved={savedSections.includes('numbering')}
                  onSave={handleSave}
                  disabled={!canManageOrganisation || pendingAction !== null}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Default Assumptions */}
        <TabsContent value="defaults" className="mt-0 max-w-2xl">
          <Card className="border border-border">
            <CardContent className="p-6">
              <SectionHeader
                icon={Sliders}
                title="Default Assumptions"
                description="Standard inclusions, exclusions and assumptions applied to new quotations"
              />
              <div className="flex flex-col gap-5">
                {[
                  { key: 'defaultInclusions' as const, label: 'Default Inclusions', placeholder: 'Add an inclusion…', textColour: 'text-green-700' },
                  { key: 'defaultExclusions' as const, label: 'Default Exclusions', placeholder: 'Add an exclusion…', textColour: 'text-red-600' },
                  { key: 'defaultAssumptions' as const, label: 'Default Assumptions', placeholder: 'Add an assumption…', textColour: 'text-blue-700' },
                ].map(({ key, label, placeholder, textColour }) => (
                  <div key={key}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${textColour}`}>
                      {label}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {settings[key].map((item, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            className="h-8 text-xs flex-1"
                            value={item}
                            onChange={(e) => {
                              const next = [...settings[key]]
                              next[i] = e.target.value
                              setSettings((p) => ({ ...p, [key]: next }))
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground shrink-0"
                            onClick={() => {
                              setSettings((p) => ({
                                ...p,
                                [key]: p[key].filter((_, idx) => idx !== i),
                              }))
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs w-fit"
                        onClick={() => setSettings((p) => ({ ...p, [key]: [...p[key], ''] }))}
                      >
                        <Plus data-icon="inline-start" className="size-3" />
                        {placeholder}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <SaveButton
                  section="defaults"
                  saved={savedSections.includes('defaults')}
                  onSave={handleSave}
                  disabled={!canManageOrganisation || pendingAction !== null}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials */}
        <TabsContent value="financials" className="mt-0 max-w-xl">
          <Card className="border border-border">
            <CardContent className="p-6">
              <SectionHeader
                icon={Receipt}
                title="Financial Defaults"
                description="Default overhead, margin, contingency and VAT applied to new estimates"
              />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'defaultOverheadPercent' as const, label: 'Default Overhead (%)', description: 'Applied to direct costs' },
                  { key: 'defaultMarginPercent' as const, label: 'Default Margin (%)', description: 'Target margin on selling price' },
                  { key: 'defaultContingencyPercent' as const, label: 'Default Contingency (%)', description: 'Applied to cost + overhead' },
                  { key: 'vatRate' as const, label: 'VAT Rate (%)', description: 'Standard UK rate is 20%' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      className="h-8 text-xs tabular-nums"
                      type="number"
                      step="0.5"
                      value={settings[key]}
                      onChange={(e) => setSettings((p) => ({ ...p, [key]: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Default Payment Terms</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.defaultPaymentTerms}
                    onChange={(e) => setSettings((p) => ({ ...p, defaultPaymentTerms: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Default Quote Validity</Label>
                  <Input
                    className="h-8 text-xs"
                    value={settings.defaultQuoteValidity}
                    onChange={(e) => setSettings((p) => ({ ...p, defaultQuoteValidity: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <SaveButton
                  section="financials"
                  saved={savedSections.includes('financials')}
                  onSave={handleSave}
                  disabled={!canManageOrganisation || pendingAction !== null}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="mt-0 max-w-xl">
          <Card className="border border-border">
            <CardContent className="p-6">
              <SectionHeader
                icon={Palette}
                title="Branding"
                description="Company logo and branding applied to quotation documents"
              />
              <div className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
                  <div className="flex items-center justify-center size-12 rounded bg-primary mx-auto mb-3">
                    <Building2 className="size-6 text-primary-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Upload Company Logo</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG or SVG, max 2 MB, min 200×200px</p>
                  <Button variant="outline" size="sm" className="mt-3 h-8 text-xs">
                    {/* TODO: wire to Vercel Blob upload */}
                    Browse Files
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {/* TODO: Implement logo upload via Vercel Blob storage */}
                  The logo will appear in the top-left corner of all generated quotation PDFs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add user dialog */}
      <Dialog open={isAddingUser} onOpenChange={(o) => { if (!o) setIsAddingUser(false) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Sarah Johnson"
                value={newUser.name ?? ''}
                onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                className="h-8 text-xs"
                type="email"
                placeholder="name@company.co.uk"
                value={newUser.email ?? ''}
                onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Role</Label>
              <select
                className="h-8 text-xs border border-input rounded-md px-2.5 bg-background"
                value={newUser.role ?? 'Estimator'}
                onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as User['role'] }))}
              >
                {['Estimator', 'Senior Estimator', 'Estimating Manager', 'Director'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: trigger auth invitation email on create */}
              An invitation email will be sent to the user with login instructions.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAddingUser(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleAddUser}
              disabled={
                !newUser.name ||
                !newUser.email ||
                pendingAction !== null
              }
            >
              {pendingAction === 'invite' ? 'Sending…' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
