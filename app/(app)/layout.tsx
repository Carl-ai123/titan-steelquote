import { AppSidebar } from '@/components/app-sidebar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-56 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  )
}
