import type { Metadata } from "next";
import Link from "next/link";
import { EmailPasswordForm } from "@/components/auth/email-password-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

type RegisterPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect: redirectTo } = await searchParams;

  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";

  return (
    <>
      <header>
        <p className="text-sm font-medium tracking-wide text-violet-600">
          Empezá gratis
        </p>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem]">
          Crear cuenta
        </h1>
        <div
          className="mt-4 h-0.5 w-8 rounded-full bg-violet-500"
          aria-hidden
        />
        <p className="mt-4 text-[1rem] leading-relaxed text-muted-foreground">
          Creá encuestas, compartí el link y mirá los resultados desde tu
          dashboard.
        </p>
      </header>

      <div className="mt-8">
        <EmailPasswordForm mode="register" redirectTo={redirectTo} />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={loginHref}
          className="font-medium text-violet-600 transition-colors duration-200 hover:text-violet-700"
        >
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
