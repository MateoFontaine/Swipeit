import Link from "next/link";

type AuthEmailSentProps = {
  email: string;
  loginHref?: string;
};

export function AuthEmailSent({ email, loginHref = "/login" }: AuthEmailSentProps) {
  return (
    <div
      role="status"
      className="rounded-xl border border-violet-200/60 bg-violet-500/[0.04] px-5 py-6 sm:px-6"
    >
      <p className="text-sm font-medium text-violet-600">Paso final</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-[1.375rem]">
        Revisá tu correo
      </h2>
      <div className="mt-3 h-0.5 w-6 rounded-full bg-violet-500" aria-hidden />

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Te enviamos un link de confirmación a:
      </p>
      <p className="mt-2 truncate rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-medium">
        {email}
      </p>

      <ol className="mt-5 space-y-2.5 text-sm text-muted-foreground">
        <li className="flex gap-3">
          <span className="font-semibold text-violet-600">1.</span>
          <span>Abrí el mail de Swipeit (revisá spam si no lo ves).</span>
        </li>
        <li className="flex gap-3">
          <span className="font-semibold text-violet-600">2.</span>
          <span>Tocá el botón para confirmar tu cuenta.</span>
        </li>
        <li className="flex gap-3">
          <span className="font-semibold text-violet-600">3.</span>
          <span>Volvé acá e iniciá sesión.</span>
        </li>
      </ol>

      <Link
        href={loginHref}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
      >
        Ir a iniciar sesión
      </Link>
    </div>
  );
}
