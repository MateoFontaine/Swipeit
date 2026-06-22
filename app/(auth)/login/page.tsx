import type { Metadata } from "next";
import Link from "next/link";
import { EmailPasswordForm } from "@/components/auth/email-password-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, redirect: redirectTo } = await searchParams;

  const registerHref = redirectTo
    ? `/register?redirect=${encodeURIComponent(redirectTo)}`
    : "/register";

  return (
    <>
      <header>
        <p className="text-sm font-medium tracking-wide text-violet-600">
          Bienvenido de nuevo
        </p>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem]">
          Iniciar sesión
        </h1>
        <div
          className="mt-4 h-0.5 w-8 rounded-full bg-violet-500"
          aria-hidden
        />
        <p className="mt-4 text-[1rem] leading-relaxed text-muted-foreground">
          Ingresá con tu email y contraseña para continuar.
        </p>
      </header>

      {error === "auth" && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700"
        >
          No pudimos iniciar sesión. Revisá tus datos e intentá de nuevo.
        </p>
      )}

      <div className="mt-8">
        <EmailPasswordForm mode="login" redirectTo={redirectTo} />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link
          href={registerHref}
          className="font-medium text-violet-600 transition-colors duration-200 hover:text-violet-700"
        >
          Registrate
        </Link>
      </p>
    </>
  );
}
