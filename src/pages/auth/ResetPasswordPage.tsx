import { Card } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Layout } from "@/components/layout/Layout";

export default function ResetPasswordPage() {
  return (
    <Layout>
      <div className="flex items-center justify-center py-10">
        <div className="container max-w-lg">
          <Card className="w-full p-8 shadow-lg bg-white">
            <ResetPasswordForm />
          </Card>
        </div>
      </div>
    </Layout>
  );
} 