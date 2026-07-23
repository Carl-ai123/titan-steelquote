import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { getSupabasePublicConfig, isSupabaseConfigured } from './config'

const PUBLIC_PATHS = ['/login', '/auth', '/setup-required']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isSupabaseConfigured()) {
    if (isPublicPath(pathname)) {
      return NextResponse.next({ request })
    }

    const setupUrl = request.nextUrl.clone()
    setupUrl.pathname = '/setup-required'
    setupUrl.search = ''
    return NextResponse.redirect(setupUrl)
  }

  const { url, publishableKey } = getSupabasePublicConfig()
  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(data?.claims?.sub)

  if (!isAuthenticated && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && pathname === '/login') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}
