import { Clock3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { signOut } from '../login/actions'

export default function AccessPendingPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Clock3 className="mx-auto size-8 text-primary" />
          <CardTitle>Your organisation access is pending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Your sign-in is valid, but an active SteelQuote organisation membership
            has not been assigned. Ask your administrator to activate your account.
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
