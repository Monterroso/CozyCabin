/**
 * TicketList.tsx
 * Displays a filterable list of tickets with sorting and search capabilities.
 * Uses Shadcn components and MountainLodge theme.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '@/stores/ticketStore';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import type { TicketStatus, TicketPriority } from '@/lib/types/supabase';
import { cn } from '@/lib/utils';

const statusColorMap: Record<TicketStatus, string> = {
  open: 'bg-pine-green/20 text-pine-green',
  in_progress: 'bg-lodge-brown/20 text-lodge-brown',
  pending: 'bg-ember-orange/20 text-ember-orange',
  solved: 'bg-pine-green/20 text-pine-green',
  closed: 'bg-twilight-gray/20 text-twilight-gray',
} as const;

const priorityColorMap: Record<TicketPriority, string> = {
  urgent: 'bg-ember-orange/20 text-ember-orange',
  high: 'bg-ember-orange/20 text-ember-orange',
  medium: 'bg-lodge-brown/20 text-lodge-brown',
  low: 'bg-pine-green/20 text-pine-green',
  normal: 'bg-pine-green/20 text-pine-green',
} as const;

export function TicketList() {
  const navigate = useNavigate();
  const { tickets, fetchTickets, setFilters } = useTicketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');

  // Apply filters
  useEffect(() => {
    setFilters({
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      search: searchQuery || undefined,
    });
  }, [searchQuery, statusFilter, priorityFilter, setFilters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-cabin-cream rounded-lg">
        <h3 className="text-lg font-medium text-lodge-brown mb-2">No tickets found</h3>
        <p className="text-muted-foreground mb-4">Create a new ticket to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | '')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TicketPriority | '')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-cabin-cream/30"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <TableCell className="font-medium text-lodge-brown">{ticket.title}</TableCell>
                <TableCell>
                  <Badge className={cn('capitalize', statusColorMap[ticket.status])}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn('capitalize', priorityColorMap[ticket.priority])}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-twilight-gray">{formatDate(ticket.created_at)}</TableCell>
                <TableCell className="text-twilight-gray">{formatDate(ticket.updated_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 