import { Layout } from '../../components/layout/Layout';
import { LoginForm } from '../../components/auth/login-form';

export function LoginPage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold text-lodge-brown mb-6 text-center">Welcome Back</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
} 