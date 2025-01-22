import { Card } from "@/components/ui/card";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { Layout } from "@/components/layout/Layout";
import { PublicRoute } from "@/components/auth/PublicRoute";

export default function NewPasswordPage() {
  return (
    <PublicRoute>
      <Layout>
        <div className="flex items-center justify-center py-10">
          <div className="container max-w-lg">
            <Card className="w-full p-8 shadow-lg bg-white">
              <NewPasswordForm />
            </Card>
          </div>
        </div>
      </Layout>
    </PublicRoute>
  );
} 