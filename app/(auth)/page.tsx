import AuthLayout from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function AuthPage() {
  return (
    <AuthLayout
      title="Login"
      subtitle="Enter your details below to login into the admin portal"
    >
      <LoginForm />
    </AuthLayout>
  );
}
