import { redirect } from "next/navigation";
import AuthLayout from "@/components/auth/auth-layout";
import { OtpForm } from "@/components/auth/otp-form";
import { getPendingLoginEmail } from "@/lib/auth/session";

export default async function VerifyOtpPage() {
  const email = await getPendingLoginEmail();

  if (!email) {
    redirect("/");
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the verification code we sent to ${email}`}
    >
      <OtpForm />
    </AuthLayout>
  );
}
