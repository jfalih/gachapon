import Link from "next/link";

import { ROUTES } from "@/core/route";

import { AuthShell } from "../auth-shell";
import { RegisterForm } from "../register-form";

export function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the guild and start summoning — new players get 500 coins."
      footer={
        <>
          Already have an account?{" "}
          <Link href={ROUTES.AUTH.LOGIN} className="font-semibold text-[#ffd873] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
