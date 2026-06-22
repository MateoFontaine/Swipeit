import type { Metadata } from "next";
import { HostShell } from "@/components/host/host-shell";
import { CreatePollForm } from "@/components/polls/create-poll-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nueva encuesta",
};

export default function NuevaEncuestaPage() {
  return (
    <HostShell backHref="/dashboard" backLabel="Dashboard">
      <header>
        <p className="text-sm font-medium tracking-wide text-violet-600">
          Crear
        </p>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem]">
          Nueva encuesta
        </h1>
        <div
          className="mt-4 h-0.5 w-8 rounded-full bg-violet-500"
          aria-hidden
        />
        <p className="mt-4 text-[1rem] leading-relaxed text-muted-foreground">
          Definí las opciones y compartí el link cuando esté lista.
        </p>
      </header>

      <div className="mt-8 sm:mt-10">
        <CreatePollForm />
      </div>
    </HostShell>
  );
}
