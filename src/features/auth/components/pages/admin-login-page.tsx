import Link from "next/link";

import { ROUTES } from "@/core/route";

import { AuthShell } from "../auth-shell";
import { LoginForm } from "../login-form";

export function AdminLoginPage() {
  return (
    <AuthShell
      title="Admin sign in"
      subtitle="Restricted area — administrators only."
      footer={
        <>
          Not an admin?{" "}
          <Link href={ROUTES.AUTH.LOGIN} className="font-semibold text-[#ffd873] hover:underline">
            Player login
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
