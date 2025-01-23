import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <Layout>
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="flex items-center justify-center py-10">
          <div className="container max-w-lg">
            <Card className="w-full p-8 shadow-lg bg-white">
              <ResetPasswordForm />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 