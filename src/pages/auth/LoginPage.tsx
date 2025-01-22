import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { Layout } from "@/components/layout/Layout";
import { PublicRoute } from "@/components/auth/PublicRoute";

export default function LoginPage() {
  return (
    <PublicRoute>
      <Layout>
        <div className="flex items-center justify-center py-10">
          <div className="container max-w-lg">
            <Card className="w-full p-8 shadow-lg bg-white">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-lodge-brown">Welcome back</h1>
                <p className="mt-2 text-pine-green-600">
                  Sign in to your account to continue
                </p>
              </div>
              <LoginForm />
            </Card>
          </div>
        </div>
      </Layout>
    </PublicRoute>
  );
} 