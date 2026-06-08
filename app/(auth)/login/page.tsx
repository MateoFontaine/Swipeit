import Link from "next/link";
import { EmailPasswordForm } from "@/components/auth/email-password-form";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/6">
      <h1 className="text-center text-2xl font-bold tracking-tight">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
        Ingresá con tu email y contraseña. La sesión se mantiene hasta que
        cierres sesión.
      </p>

      {error === "auth" && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          No pudimos iniciar sesión. Revisá tus datos e intentá de nuevo.
        </p>
      )}

      <div className="mt-6">
        <EmailPasswordForm mode="login" />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-accent hover:underline"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}
