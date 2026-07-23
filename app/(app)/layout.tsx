import { AppSidebar } from '@/components/app-sidebar'
import { requireCurrentUser } from '@/lib/auth/context'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await requireCurrentUser()

  return (
    <div className="min-h-screen flex">
      <AppSidebar
        user={{
          name: context.fullName,
          email: context.email,
          role: context.role,
        }}
        organisationName={
          context.organisation.tradingName ?? context.organisation.legalName
        }
      />
      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-56 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  )
}
