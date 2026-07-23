import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <TriangleAlert className="mx-auto size-8 text-destructive" />
          <CardTitle>That sign-in link is no longer valid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Secure links expire and can only be used once. Request a new link to
            continue.
          </p>
          <Button render={<Link href="/login" />}>Return to sign in</Button>
        </CardContent>
      </Card>
    </main>
  )
}
