"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FloatingLabelInput } from "../shared/form/floating-label-input";
import { Button } from "@/components/ui/button";
import { AtSign, Lock } from "lucide-react";
import { useLogin } from "@/hooks/auth/use-auth-mutations";
import { toErrorMessage } from "@/lib/api/errors";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  return (
    <form
      onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
      className="space-y-4"
    >
      <div>
        <FloatingLabelInput
          label="Email Address"
          type="email"
          autoComplete="email"
          icon={<AtSign className="size-5" />}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <FloatingLabelInput
          label="Password"
          type="password"
          autoComplete="current-password"
          icon={<Lock className="size-5" />}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {loginMutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {toErrorMessage(loginMutation.error)}
        </p>
      )}

      <Button
        type="submit"
        // Stays busy through the redirect that follows a successful login.
        isLoading={loginMutation.isPending || loginMutation.isSuccess}
        className="w-full h-10  md:h-10.5 rounded-full bg-primary hover:bg-[#2d442d] text-white "
      >
        Login
      </Button>
    </form>
  );
}
