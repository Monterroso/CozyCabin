import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTicketStore } from '@/stores/ticketStore'
import type { TicketPriority } from '@/lib/types/supabase'
import { formatDistanceToNow } from 'date-fns'

export function TicketList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const tickets = useTicketStore(state => state.tickets)

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="space-x-2">
          <Button
            variant={priorityFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setPriorityFilter('all')}
          >
            All
          </Button>
          <Button
            variant={priorityFilter === 'high' ? 'default' : 'outline'}
            onClick={() => setPriorityFilter('high')}
          >
            High
          </Button>
          <Button
            variant={priorityFilter === 'medium' ? 'default' : 'outline'}
            onClick={() => setPriorityFilter('medium')}
          >
            Medium
          </Button>
          <Button
            variant={priorityFilter === 'low' ? 'default' : 'outline'}
            onClick={() => setPriorityFilter('low')}
          >
            Low
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="cursor-pointer hover:bg-muted"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <TableCell className="font-medium">{ticket.subject}</TableCell>
              <TableCell>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 