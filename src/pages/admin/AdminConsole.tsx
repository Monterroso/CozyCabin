"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import { useToast } from "@/components/ui/use-toast";
import { adminMessageFormSchema } from "@/lib/schemas/admin";
import type { AdminMessageFormData, Message } from "@/lib/types/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminConsole() {
  const { messages, isProcessing, error, sendMessage } = useAdminStore();
  const { toast } = useToast();
  
  const { handleSubmit, register, reset, formState: { errors } } = useForm<AdminMessageFormData>({
    resolver: zodResolver(adminMessageFormSchema)
  });

  const onSubmit = async (data: AdminMessageFormData) => {
    try {
      await sendMessage(data.content);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets Overview</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card className="bg-cabin-cream border-pine-green/20">
            <CardHeader>
              <CardTitle className="text-lodge-brown">Tickets Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Add ticket list component */}
              <div className="text-twilight-gray">
                Ticket overview coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="bg-cabin-cream border-pine-green/20">
            <CardHeader>
              <CardTitle className="text-lodge-brown">Admin AI Console</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] border rounded-md p-4 mb-4">
                {messages.map((message: Message, index) => (
                  <div
                    key={index}
                    className={`mb-4 p-4 rounded-lg ${
                      message.role === "assistant"
                        ? "bg-pine-green/5 border border-pine-green/10"
                        : "bg-lodge-brown/5 border border-lodge-brown/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-twilight-gray">
                        {message.role === "assistant" ? "AI Assistant" : "You"}
                      </span>
                      <span className="text-xs text-twilight-gray/60">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-twilight-gray whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}
              </ScrollArea>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    {...register("content")}
                    placeholder="Ask the AI assistant..."
                    className="flex-1"
                    disabled={isProcessing}
                  />
                  <Button 
                    type="submit"
                    className="bg-lodge-brown hover:bg-lodge-brown/90"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
                {errors.content && (
                  <p className="text-sm text-ember-orange">{errors.content.message}</p>
                )}
                {error && (
                  <p className="text-sm text-ember-orange">{error}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 