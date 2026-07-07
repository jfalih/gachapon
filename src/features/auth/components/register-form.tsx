"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { ROUTES } from "@/core/route";
import { useRegister } from "@/services/hooks/apis/auth";

import { AuthField } from "./auth-field";
import { registerSchema, type RegisterValues } from "../utils/auth-schemas";

export function RegisterForm() {
  const router = useRouter();
  const registerAccount = useRegister();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      // 1) Create the player account (500 starting coins, role decided server-side).
      await registerAccount.mutateAsync({
        email: values.email,
        full_name: values.name,
        password: values.password,
      });
      // 2) Establish the NextAuth session.
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      router.push(ROUTES.HOME);
      router.refresh();
    } catch (err) {
      setSubmitError(
        (err as { message?: string })?.message ?? "Could not create your account. Please try again.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <AuthField
        label="Full name"
        placeholder="Jane Doe"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <AuthField
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <AuthField
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <AuthField
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" className="mt-1 bg-red-800 hover:bg-red-900" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
