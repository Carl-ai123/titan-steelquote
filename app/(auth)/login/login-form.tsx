'use client'

import { useActionState } from 'react'
import { Mail, ShieldCheck } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { sendMagicLink, type LoginState } from './actions'

const initialState: LoginState = {
  status: 'idle',
  message: '',
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@fabricator.co.uk"
          required
        />
      </div>

      {state.message ? (
        <Alert variant={state.status === 'error' ? 'destructive' : 'default'}>
          {state.status === 'success' ? <ShieldCheck /> : <Mail />}
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        <Mail data-icon="inline-start" />
        {pending ? 'Sending secure link…' : 'Email me a sign-in link'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Access is invitation-only. No password is stored by SteelQuote.
      </p>
    </form>
  )
}
