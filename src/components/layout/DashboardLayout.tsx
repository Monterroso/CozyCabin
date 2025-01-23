/**
 * DashboardLayout.tsx
 * Shared layout component for all dashboard pages with navigation and common UI elements
 */

import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { role } = user?.user_metadata || {}

  const navItems = {
    customer: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Ticket, label: 'My Tickets', href: '/tickets' },
      { icon: Settings, label: 'Settings', href: '/settings' },
    ],
    agent: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/agent' },
      { icon: Ticket, label: 'Tickets', href: '/dashboard/agent/tickets' },
      { icon: Settings, label: 'Settings', href: '/dashboard/agent/settings' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
      { icon: Ticket, label: 'All Tickets', href: '/admin/tickets' },
      { icon: Users, label: 'Users', href: '/admin/users' },
      { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ],
  }

  const currentNavItems = navItems[role as keyof typeof navItems] || navItems.customer
  console.log(currentNavItems)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <span className="text-xl font-semibold">CozyCabin</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {currentNavItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="mb-2 flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div>
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
} 