import Link from "next/link";

import { ROUTES } from "@/core/route";

import { AuthShell } from "../auth-shell";
import { LoginForm } from "../login-form";

export function LoginPage() {
  return (
    <AuthShell
      title="Welcome back, adventurer"
      subtitle="Sign in to continue your summons."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.AUTH.REGISTER} className="font-semibold text-[#ffd873] hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
