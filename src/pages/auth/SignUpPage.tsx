import { Layout } from '../../components/layout/Layout';
import { SignUpForm } from '../../components/auth/sign-up-form';

export function SignUpPage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold text-lodge-brown mb-6 text-center">Create an Account</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <SignUpForm />
        </div>
      </div>
    </Layout>
  );
} 