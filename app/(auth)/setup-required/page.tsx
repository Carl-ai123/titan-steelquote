import { Database, LockKeyhole } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupRequiredPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <LockKeyhole className="size-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Secure access is ready to connect</CardTitle>
              <p className="text-sm text-muted-foreground">Phase 1 configuration</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            SteelQuote now requires an organisation-scoped Supabase project before
            business screens can be opened.
          </p>
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Database className="size-4" />
              Remaining deployment connection
            </div>
            <p className="text-muted-foreground">
              Add the project URL, publishable key and server-only service-role key
              to Vercel, then apply the included database migration.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            No demonstration login bypass is enabled; company data stays protected
            until the real identity service is connected.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
