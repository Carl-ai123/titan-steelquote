import { SettingsPanel } from '@/components/settings/settings-panel'
import { requireCurrentUser } from '@/lib/auth/context'
import { hasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import type { OrgSettings, User } from '@/lib/types'

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

export default async function SettingsPage() {
  const context = await requireCurrentUser()
  const supabase = await createClient()

  const [{ data: organization, error: organizationError }, { data: memberships }] =
    await Promise.all([
      supabase
        .from('organizations')
        .select('*')
        .eq('id', context.organisation.id)
        .single(),
      supabase
        .from('organization_memberships')
        .select(
          'id, user_id, role, status, profiles!organization_memberships_user_id_fkey(full_name, email)',
        )
        .eq('organization_id', context.organisation.id)
        .order('created_at'),
    ])

  if (organizationError || !organization) {
    throw new Error('Organisation settings could not be loaded.')
  }

  const settings: OrgSettings = {
    companyName: organization.legal_name,
    tradingName: organization.trading_name ?? undefined,
    address: organization.address,
    city: organization.city,
    postcode: organization.postcode,
    phone: organization.phone,
    email: organization.email,
    website: organization.website ?? undefined,
    vatNumber: organization.vat_number,
    companyNumber: organization.company_number,
    logoUrl: organization.logo_url ?? undefined,
    quotePrefix: organization.quote_prefix,
    quoteStartNumber: organization.quote_start_number,
    defaultOverheadPercent: Number(organization.default_overhead_percent),
    defaultMarginPercent: Number(organization.default_margin_percent),
    defaultContingencyPercent: Number(organization.default_contingency_percent),
    defaultPaymentTerms: organization.default_payment_terms,
    defaultQuoteValidity: organization.default_quote_validity,
    vatRate: Number(organization.vat_rate),
    defaultInclusions: asStringArray(organization.default_inclusions),
    defaultExclusions: asStringArray(organization.default_exclusions),
    defaultAssumptions: asStringArray(organization.default_assumptions),
  }

  const users: User[] = (memberships ?? []).map((membership) => {
    const profile = Array.isArray(membership.profiles)
      ? membership.profiles[0]
      : membership.profiles
    const name = profile?.full_name || profile?.email || 'Invited user'

    return {
      id: membership.id,
      userId: membership.user_id,
      name,
      initials: name
        .split(/\s+/)
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      role: membership.role,
      email: profile?.email ?? '',
      active: membership.status === 'active',
      status: membership.status,
    }
  })

  return (
    <SettingsPanel
      settings={settings}
      users={users}
      canManageOrganisation={hasPermission(context.role, 'manageOrganisation')}
      canManageUsers={hasPermission(context.role, 'manageUsers')}
      currentMembershipId={context.membershipId}
    />
  )
}
