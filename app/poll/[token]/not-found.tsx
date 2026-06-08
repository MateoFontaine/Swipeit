import Link from "next/link";
import { PollShell } from "@/components/poll/poll-shell";
import { Button } from "@/components/ui/button";

export default function PollNotFound() {
  return (
    <PollShell>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-5xl" aria-hidden="true">
          🔍
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Encuesta no encontrada
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          El link puede estar mal escrito o la encuesta fue eliminada.
        </p>
        <div className="mt-8 w-full max-w-xs">
          <Button href="/" variant="secondary">
            Ir al inicio
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          ¿Tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </PollShell>
  );
}
