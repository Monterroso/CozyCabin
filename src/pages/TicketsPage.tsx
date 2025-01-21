import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { TicketList } from '@/components/tickets/TicketList';
import { TicketDetails } from '@/components/tickets/TicketDetails';
import { TicketComments } from '@/components/tickets/TicketComments';
import { CreateTicketForm } from '@/components/tickets/CreateTicketForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function TicketsPage() {
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <Sheet open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Create New Ticket</SheetTitle>
                <SheetDescription>
                  Submit a new support ticket for assistance
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <CreateTicketForm />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <TicketList />
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <TicketDetails />
            <TicketComments />
          </div>
        </div>
      </div>
    </Layout>
  );
} 