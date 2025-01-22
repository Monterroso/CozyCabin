/**
 * CreateTicketPage.tsx
 * Page component for ticket creation, including layout and notifications.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { TicketForm } from '@/components/tickets/creation/TicketForm';
import { useTicketStore } from '@/stores/ticketStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { CreateTicketForm } from '@/components/tickets/CreateTicketForm';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { error, loading } = useTicketStore();

  // Show error toast when ticket creation fails
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error Creating Ticket",
        description: error,
      });
    }
  }, [error, toast]);

  // Handle successful ticket creation
  const onSuccess = (ticketId: string) => {
    toast({
      title: "Ticket Created Successfully",
      description: "You will be redirected to your ticket details.",
    });
    
    // Navigate to ticket details after a short delay
    setTimeout(() => {
      navigate(`/tickets/${ticketId}`);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-lodge-brown">Create New Ticket</h1>
            <p className="text-twilight-gray">Submit a new support request</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-twilight-gray/20 text-twilight-gray hover:text-lodge-brown"
          >
            Back to Tickets
          </Button>
        </div>

        <div className="max-w-2xl">
          <CreateTicketForm />
        </div>
      </main>
    </DashboardLayout>
  );
} 