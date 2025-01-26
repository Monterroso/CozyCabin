'use client'

import { useEffect, useState, useTransition } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { verifyInvite } from "@/lib/api/invites";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import type { Database } from "@/lib/types/supabase";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type UserRole = Database["public"]["Enums"]["user_role"];

const isValidUUID = (str: string | null): str is string => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [inviteData, setInviteData] = useState<{
    email: string;
    role: UserRole;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleInviteVerification = async () => {
      const maybeToken = searchParams.get("token");
      
      if (!isValidUUID(maybeToken)) {
        toast({
          title: "Invalid invite",
          description: "The invite link is invalid.",
          variant: "destructive",
        });
        startTransition(() => {
          navigate("/auth/signup");
        });
        return;
      }

      try {
        const response = await verifyInvite(maybeToken);
        if (
          response.is_valid && 
          response.invite_email && 
          response.invite_role && 
          (response.invite_role === 'agent' || response.invite_role === 'admin')
        ) {
          startTransition(() => {
            setInviteData({
              email: response.invite_email as string,
              role: response.invite_role as UserRole,
            });
          });
        } else {
          toast({
            title: "Invalid invite",
            description: "This invite link is invalid or has expired.",
            variant: "destructive",
          });
          startTransition(() => {
            navigate("/auth/signup");
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
        startTransition(() => {
          navigate("/auth/signup");
        });
      }
    };

    handleInviteVerification();
  }, [searchParams, toast, navigate]);

  return (
    <Layout>
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="flex items-center justify-center py-10">
          <div className="container max-w-lg">
            <Card className="w-full p-8 shadow-lg bg-white">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-lodge-brown">Create an account</h1>
                {inviteData && (
                  <p className="mt-2 text-pine-green-600">
                    You've been invited to join as a {inviteData.role}.
                  </p>
                )}
              </div>
              <SignUpForm inviteData={inviteData} />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 