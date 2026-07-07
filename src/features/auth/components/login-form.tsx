"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { roleHome } from "@/core/route";

import { AuthField } from "./auth-field";
import { loginSchema, type LoginValues } from "../utils/auth-schemas";

export function LoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const res = await signIn("credentials", { ...values, redirect: false });
    if (!res || res.error) {
      setSubmitError("Invalid email or password.");
      return;
    }

    // The backend decides the role — read it from the session for the redirect.
    const session = await getSession();
    router.push(roleHome(session?.user?.role));
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {submitError && <p className="text-sm text-[#ff9d9d]">{submitError}</p>}

      <Button
        type="submit"
        className="mt-1 bg-gradient-to-b from-[#eec55e] to-[#b8862a] font-bold tracking-widest text-[#33240a] hover:brightness-110"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in…" : "SIGN IN"}
      </Button>
    </form>
  );
}
