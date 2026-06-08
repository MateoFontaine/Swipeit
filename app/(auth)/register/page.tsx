import Link from "next/link";
import { EmailPasswordForm } from "@/components/auth/email-password-form";

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/6">
      <h1 className="text-center text-2xl font-bold tracking-tight">
        Crear cuenta
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
        Creá tu cuenta con email y contraseña para crear encuestas y ver tu
        historial.
      </p>

      <div className="mt-6">
        <EmailPasswordForm mode="register" />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
