import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextPath = requestUrl.searchParams.get('next')
  const safeNextPath = nextPath?.startsWith('/') ? nextPath : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const admin = createAdminClient()
        await Promise.all([
          admin
            .from('organization_memberships')
            .update({
              status: 'active',
              joined_at: new Date().toISOString(),
              deactivated_at: null,
              updated_by: user.id,
            })
            .eq('user_id', user.id)
            .eq('status', 'invited'),
          admin
            .from('invitations')
            .update({
              status: 'accepted',
              accepted_at: new Date().toISOString(),
              updated_by: user.id,
            })
            .eq('auth_user_id', user.id)
            .eq('status', 'pending'),
        ])
      }

      return NextResponse.redirect(new URL(safeNextPath, requestUrl.origin))
    }
  }

  return NextResponse.redirect(
    new URL('/auth/error?reason=invalid-link', requestUrl.origin),
  )
}
