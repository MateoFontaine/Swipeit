import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-6 pt-8 pb-4">
        <p className="text-2xl font-bold tracking-tight text-primary">Swipeit</p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        <div className="relative w-full max-w-sm">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl"
          />
          <div className="relative rounded-2xl border border-border bg-white p-8 shadow-xl shadow-black/5">
            <div className="mb-6 flex justify-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
                ✕
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                ♥
              </span>
            </div>
            <h1 className="text-center text-3xl font-bold leading-tight tracking-tight">
              Decisiones en grupo,{" "}
              <span className="text-primary">sin drama</span>
            </h1>
            <p className="mt-4 text-center text-muted-foreground leading-relaxed">
              Creá una encuesta, compartí el link y que cada uno vote deslizando
              como en Tinder. Al final, ranking claro y ballotage si hay empate.
            </p>
          </div>
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <Button href="/register" variant="primary">
            Crear encuesta
          </Button>
          <Button href="/login" variant="outline">
            Unirse
          </Button>
        </div>

        <p className="mt-8 max-w-xs text-center text-sm text-muted-foreground">
          ¿Tenés un link de encuesta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrá acá
          </Link>
        </p>
      </main>
    </div>
  );
}
