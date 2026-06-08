import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-6 pt-8 pb-4">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          Swipeit
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/6">
          <h1 className="text-center text-3xl font-bold leading-tight tracking-tight">
            Decisiones en grupo,{" "}
            <span className="text-accent">sin drama</span>
          </h1>
          <p className="mt-4 text-center text-muted-foreground leading-relaxed">
            Creá una encuesta con tus opciones, compartí el link y cada persona
            vota deslizando. Cuando termina, ves el ranking — y ballotage si hay
            empate.
          </p>
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <Button href="/register" variant="primary">
            Crear encuesta
          </Button>
          <Button href="/login" variant="secondary">
            Unirse
          </Button>
        </div>

        <p className="mt-8 max-w-xs text-center text-sm text-muted-foreground">
          ¿Tenés un link de encuesta?{" "}
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            Entrá acá
          </Link>
        </p>
      </main>
    </div>
  );
}
