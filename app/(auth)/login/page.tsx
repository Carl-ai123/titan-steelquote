import { Building2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = params.next?.startsWith('/') ? params.next : '/dashboard'

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-lg bg-primary">
            <Building2 className="size-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Sign in to Titan SteelQuote</CardTitle>
          <p className="text-sm text-muted-foreground">
            Secure estimating access for your organisation
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </main>
  )
}
