'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { hasPermission } from '@/lib/auth/permissions'
import { requireCurrentUser } from '@/lib/auth/context'
import { getAppUrl } from '@/lib/supabase/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { USER_ROLES, type OrgSettings, type UserRole } from '@/lib/types'

export interface SettingsActionResult {
  ok: boolean
  message: string
}

const settingsSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  tradingName: z.string().trim().max(160).optional(),
  address: z.string().trim().max(240),
  city: z.string().trim().max(100),
  postcode: z.string().trim().max(12),
  phone: z.string().trim().max(40),
  email: z.email().max(254),
  website: z.string().trim().max(240).optional(),
  vatNumber: z.string().trim().max(40),
  companyNumber: z.string().trim().max(20),
  logoUrl: z.url().optional(),
  quotePrefix: z.string().trim().regex(/^[A-Z0-9-]{2,10}$/),
  quoteStartNumber: z.number().int().positive(),
  defaultOverheadPercent: z.number().min(0).max(100),
  defaultMarginPercent: z.number().min(0).max(100),
  defaultContingencyPercent: z.number().min(0).max(100),
  defaultPaymentTerms: z.string().trim().min(2).max(160),
  defaultQuoteValidity: z.string().trim().min(2).max(160),
  vatRate: z.number().min(0).max(100),
  defaultInclusions: z.array(z.string().trim().min(1).max(500)).max(100),
  defaultExclusions: z.array(z.string().trim().min(1).max(500)).max(100),
  defaultAssumptions: z.array(z.string().trim().min(1).max(500)).max(100),
})

const inviteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  role: z.enum(USER_ROLES),
})

const membershipSchema = z.object({
  membershipId: z.uuid(),
  active: z.boolean(),
})

export async function saveOrganisationSettings(
  settings: OrgSettings,
): Promise<SettingsActionResult> {
  const context = await requireCurrentUser()

  if (!hasPermission(context.role, 'manageOrganisation')) {
    return { ok: false, message: 'Your role cannot change organisation settings.' }
  }

  const result = settingsSchema.safeParse(settings)
  if (!result.success) {
    return { ok: false, message: 'Check the highlighted organisation values.' }
  }

  const supabase = await createClient()
  const value = result.data
  const { error } = await supabase
    .from('organizations')
    .update({
      legal_name: value.companyName,
      trading_name: value.tradingName || null,
      address: value.address,
      city: value.city,
      postcode: value.postcode,
      phone: value.phone,
      email: value.email,
      website: value.website || null,
      vat_number: value.vatNumber,
      company_number: value.companyNumber,
      logo_url: value.logoUrl || null,
      quote_prefix: value.quotePrefix,
      quote_start_number: value.quoteStartNumber,
      default_overhead_percent: value.defaultOverheadPercent,
      default_margin_percent: value.defaultMarginPercent,
      default_contingency_percent: value.defaultContingencyPercent,
      default_payment_terms: value.defaultPaymentTerms,
      default_quote_validity: value.defaultQuoteValidity,
      vat_rate: value.vatRate,
      default_inclusions: value.defaultInclusions,
      default_exclusions: value.defaultExclusions,
      default_assumptions: value.defaultAssumptions,
      updated_by: context.userId,
    })
    .eq('id', context.organisation.id)

  if (error) {
    return { ok: false, message: 'The settings could not be saved.' }
  }

  revalidatePath('/settings')
  return { ok: true, message: 'Organisation settings saved.' }
}

export async function inviteOrganisationUser(input: {
  name: string
  email: string
  role: UserRole
}): Promise<SettingsActionResult> {
  const context = await requireCurrentUser()

  if (!hasPermission(context.role, 'manageUsers')) {
    return { ok: false, message: 'Only administrators can invite users.' }
  }

  const result = inviteSchema.safeParse(input)
  if (!result.success || result.data.role === 'Admin') {
    return {
      ok: false,
      message: 'Enter a valid user and choose a non-administrator role.',
    }
  }

  const admin = createAdminClient()
  const redirectTo = new URL('/auth/callback', getAppUrl()).toString()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    result.data.email,
    {
      redirectTo,
      data: { full_name: result.data.name },
    },
  )

  if (error || !data.user) {
    return {
      ok: false,
      message:
        error?.message.toLowerCase().includes('already')
          ? 'That email already has an account. Ask them to use the sign-in page.'
          : 'The invitation could not be sent.',
    }
  }

  const [{ error: membershipError }, { error: invitationError }] =
    await Promise.all([
      admin.from('organization_memberships').upsert(
        {
          organization_id: context.organisation.id,
          user_id: data.user.id,
          role: result.data.role,
          status: 'invited',
          invited_by: context.userId,
          created_by: context.userId,
          updated_by: context.userId,
        },
        { onConflict: 'organization_id,user_id' },
      ),
      admin.from('invitations').insert({
        organization_id: context.organisation.id,
        email: result.data.email,
        role: result.data.role,
        status: 'pending',
        auth_user_id: data.user.id,
        invited_by: context.userId,
        created_by: context.userId,
        updated_by: context.userId,
      }),
    ])

  if (membershipError || invitationError) {
    return {
      ok: false,
      message: 'The identity was created, but organisation access needs attention.',
    }
  }

  revalidatePath('/settings')
  return { ok: true, message: `Invitation sent to ${result.data.email}.` }
}

export async function setMembershipActive(input: {
  membershipId: string
  active: boolean
}): Promise<SettingsActionResult> {
  const context = await requireCurrentUser()

  if (!hasPermission(context.role, 'manageUsers')) {
    return { ok: false, message: 'Only administrators can change user access.' }
  }

  const result = membershipSchema.safeParse(input)
  if (!result.success || result.data.membershipId === context.membershipId) {
    return { ok: false, message: 'You cannot deactivate your own administrator access.' }
  }

  const supabase = await createClient()
  const { data: target, error: targetError } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('id', result.data.membershipId)
    .eq('organization_id', context.organisation.id)
    .single()

  if (targetError || !target || target.role === 'Admin') {
    return { ok: false, message: 'Another administrator cannot be changed here.' }
  }

  const { error } = await supabase
    .from('organization_memberships')
    .update({
      status: result.data.active ? 'active' : 'deactivated',
      deactivated_at: result.data.active ? null : new Date().toISOString(),
      joined_at: result.data.active ? new Date().toISOString() : undefined,
      updated_by: context.userId,
    })
    .eq('id', result.data.membershipId)
    .eq('organization_id', context.organisation.id)

  if (error) {
    return { ok: false, message: 'User access could not be updated.' }
  }

  revalidatePath('/settings')
  return {
    ok: true,
    message: result.data.active ? 'User access activated.' : 'User access deactivated.',
  }
}
