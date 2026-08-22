"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { type PasswordForm, passwordSchema } from "@/lib/validations/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";

const loginActivity = [
  {
    date: "Feb 17, 2026 at 10:23 AM",
    detail: "Lagos, Nigeria • Chrome on Windows",
    status: "Success",
  },
  {
    date: "Feb 16, 2026 at 4:15 PM",
    detail: "Lagos, Nigeria • Chrome on Windows",
    status: "Success",
  },
  {
    date: "Feb 15, 2026 at 9:47 AM",
    detail: "Lagos, Nigeria • Safari on iPhone",
    status: "Success",
  },
];

export default function SecurityTab({ onSave }: { onSave: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="bg-background rounded-lg md:rounded-2xl py-4 md:py-5 space-y-6">
        <div className="px-3 md:px-4 ">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <p className="text-sm text-foreground">
            Change your admin account password
          </p>
        </div>
        <hr className="border-border" />

        <div className="px-3 md:px-4 space-y-5 md:space-y-6 max-w-xl">
          <FloatingLabelInput
            label="Enter Current Password"
            type="password"
            icon={<Lock className="size-5" />}
            {...register("currentPassword")}
            error={errors.currentPassword?.message}
          />
          <div className="grid gap-1">
            <FloatingLabelInput
              label="Enter New Password"
              type="password"
              icon={<Lock className="size-5" />}
              {...register("newPassword")}
              error={errors.newPassword?.message}
            />
            <p className="text-xs text-muted-foreground px-1">
              Must be at least 8 characters with uppercase, lowercase, and
              numbers
            </p>
          </div>
          <FloatingLabelInput
            label="Re-enter new password"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>
      </div>

      <div className="bg-background rounded-lg md:rounded-2xl py-4 md:py-5 space-y-4 md:space-y-5">
        <div className="px-4">
          <h3 className="font-semibold">Recent Login Activity</h3>
        </div>
        <hr className="border-border" />
        <div className="space-y-1 px-4">
          {loginActivity.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 md:py-3 pb-0"
            >
              <div>
                <p className="text-sm text-foreground font-medium">{item.date}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.detail}
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 rounded-full">
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
      >
        Update Password
      </Button>
    </form>
  );
}
