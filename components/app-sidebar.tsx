'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart2,
  Settings,
  ChevronDown,
  Package,
  HardHat,
  Building2,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { UserRole } from '@/lib/types'
import { signOut } from '@/app/(auth)/login/actions'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  exactMatch?: boolean
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exactMatch: true,
  },
  {
    label: 'Enquiries',
    href: '/enquiries',
    icon: FileText,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Rates',
    href: '/rates/materials',
    icon: BarChart2,
    children: [
      { label: 'Material Rates', href: '/rates/materials', icon: Package },
      { label: 'Labour Rates', href: '/rates/labour', icon: HardHat },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

function NavItemRow({
  item,
  depth = 0,
}: {
  item: NavItem
  depth?: number
}) {
  const pathname = usePathname()
  const hasChildren = item.children && item.children.length > 0

  // Determine active: exact or prefix match
  const isActive = item.exactMatch
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + '/')

  // For items with children, expand if any child is active
  const anyChildActive = item.children?.some((child) =>
    pathname === child.href || pathname.startsWith(child.href + '/'),
  )

  const [open, setOpen] = useState(anyChildActive ?? false)

  const Icon = item.icon

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
            'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            (isActive || anyChildActive) && 'text-sidebar-foreground',
          )}
          aria-expanded={open}
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          />
        </button>
        {open && (
          <div className="mt-0.5 ml-3 pl-3 border-l border-sidebar-border">
            {item.children?.map((child) => (
              <NavItemRow key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
        depth === 0
          ? 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent'
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
        isActive &&
          depth === 0 &&
          'bg-sidebar-accent text-sidebar-foreground font-medium',
        isActive &&
          depth > 0 &&
          'text-sidebar-foreground font-medium',
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AppSidebar({
  user,
  organisationName,
}: {
  user: { name: string; email: string; role: UserRole }
  organisationName: string
}) {
  return (
    <aside
      className="fixed left-0 top-0 h-full w-56 flex flex-col bg-sidebar z-30"
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center size-8 rounded bg-primary shrink-0">
          <Building2 className="size-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground leading-tight truncate">
            {organisationName}
          </p>
          <p className="text-xs text-sidebar-foreground/50 leading-tight truncate">
            SteelQuote
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavItemRow key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-full bg-primary/20 shrink-0">
            <span className="text-xs font-semibold text-primary-foreground/80">
              {getInitials(user.name)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user.role}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded p-1.5 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              aria-label={`Sign out ${user.email}`}
            >
              <LogOut className="size-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
