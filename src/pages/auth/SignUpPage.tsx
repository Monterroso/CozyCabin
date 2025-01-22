'use client'

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { verifyInvite } from "@/lib/api/invites";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/lib/types/supabase";
import { Layout } from "@/components/layout/Layout";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [inviteData, setInviteData] = useState<{
    email: string;
    role: UserRole;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyInvite(token)
        .then((response) => {
          if (response.is_valid && response.invite_email && response.invite_role) {
            setInviteData({
              email: response.invite_email,
              role: response.invite_role,
            });
          } else {
            toast({
              title: "Invalid invite",
              description: "This invite link is invalid or has expired.",
              variant: "destructive",
            });
            navigate("/signup");
          }
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          navigate("/signup");
        });
    }
  }, [searchParams, toast, navigate]);

  return (
    <Layout>
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
    </Layout>
  );
} 