/**
 * AdminOverviewPage.tsx
 * Main overview page for administrators to oversee the entire support system
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  TicketIcon,
  Clock,
  TrendingUp,
  UserPlus,
  Settings2,
  Bot,
  ListTodo,
} from 'lucide-react'

export default function AdminOverviewPage() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button
          variant="outline"
          className="h-20 justify-start gap-4"
          onClick={() => navigate('/admin/invites')}
        >
          <UserPlus className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Invite Users</div>
            <div className="text-xs text-muted-foreground">Send invites to new users</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-20 justify-start gap-4"
          onClick={() => navigate('/admin/console')}
        >
          <Bot className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">AI Console</div>
            <div className="text-xs text-muted-foreground">AI-powered assistance</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-20 justify-start gap-4"
          onClick={() => navigate('/admin/tickets')}
        >
          <ListTodo className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Ticket Management</div>
            <div className="text-xs text-muted-foreground">View and manage tickets</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-20 justify-start gap-4"
          onClick={() => navigate('/admin/settings')}
        >
          <Settings2 className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Settings</div>
            <div className="text-xs text-muted-foreground">Configure system</div>
          </div>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">15 unassigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.5h</div>
            <p className="text-xs text-muted-foreground">Avg. first response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Agent Performance</h2>
          <Button variant="outline" onClick={() => navigate('/admin/reports')}>
            View Reports
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div>
                    <h3 className="font-medium">Sarah Johnson</h3>
                    <p className="text-sm text-muted-foreground">32 tickets resolved this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">98% satisfaction</p>
                  <p className="text-sm text-muted-foreground">1.2h avg. response</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div>
                    <h3 className="font-medium">Michael Chen</h3>
                    <p className="text-sm text-muted-foreground">28 tickets resolved this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">96% satisfaction</p>
                  <p className="text-sm text-muted-foreground">1.5h avg. response</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 