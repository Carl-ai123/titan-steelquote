'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { getAppUrl, isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.email().max(254),
  next: z.string().startsWith('/').default('/dashboard'),
})

export interface LoginState {
  status: 'idle' | 'success' | 'error'
  message: string
}

export async function sendMagicLink(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      status: 'error',
      message: 'Authentication has not been connected to a Supabase project yet.',
    }
  }

  const result = loginSchema.safeParse({
    email: formData.get('email'),
    next: formData.get('next') || '/dashboard',
  })

  if (!result.success) {
    return {
      status: 'error',
      message: 'Enter a valid work email address.',
    }
  }

  const supabase = await createClient()
  const callbackUrl = new URL('/auth/callback', getAppUrl())
  callbackUrl.searchParams.set('next', result.data.next)

  const { error } = await supabase.auth.signInWithOtp({
    email: result.data.email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      shouldCreateUser: false,
    },
  })

  if (error) {
    return {
      status: 'error',
      message:
        error.message === 'Signups not allowed for otp'
          ? 'This email has not been invited to SteelQuote.'
          : 'We could not send the sign-in email. Please try again.',
    }
  }

  return {
    status: 'success',
    message: 'Check your inbox for a secure SteelQuote sign-in link.',
  }
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  redirect('/login')
}
