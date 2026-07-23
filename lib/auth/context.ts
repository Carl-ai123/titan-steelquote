import 'server-only'

import { redirect } from 'next/navigation'

import type { UserRole } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

export interface CurrentUserContext {
  userId: string
  email: string
  fullName: string
  role: UserRole
  membershipId: string
  organisation: {
    id: string
    legalName: string
    tradingName: string | null
  }
}

export async function getCurrentUserContext(): Promise<CurrentUserContext | null> {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsData?.claims
  const userId = claims?.sub

  if (claimsError || typeof userId !== 'string') {
    return null
  }

  const [{ data: profile }, { data: membership, error: membershipError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('organization_memberships')
        .select('id, organization_id, role, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle(),
    ])

  if (membershipError || !membership) {
    return null
  }

  const { data: organisation, error: organisationError } = await supabase
    .from('organizations')
    .select('id, legal_name, trading_name')
    .eq('id', membership.organization_id)
    .single()

  if (organisationError || !organisation) {
    return null
  }

  return {
    userId,
    email:
      (typeof profile?.email === 'string' && profile.email) ||
      (typeof claims?.email === 'string' ? claims.email : ''),
    fullName:
      (typeof profile?.full_name === 'string' && profile.full_name) ||
      (typeof claims?.email === 'string'
        ? claims.email.split('@')[0]
        : 'SteelQuote user'),
    role: membership.role as UserRole,
    membershipId: membership.id,
    organisation: {
      id: organisation.id,
      legalName: organisation.legal_name,
      tradingName: organisation.trading_name,
    },
  }
}

export async function requireCurrentUser() {
  const context = await getCurrentUserContext()

  if (!context) {
    redirect('/access-pending')
  }

  return context
}
