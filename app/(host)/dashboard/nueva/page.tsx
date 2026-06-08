import { HostShell } from "@/components/host/host-shell";
import { CreatePollForm } from "@/components/polls/create-poll-form";

export const dynamic = "force-dynamic";

export default function NuevaEncuestaPage() {
  return (
    <HostShell backHref="/dashboard" backLabel="Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nueva encuesta</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Definí las opciones y compartí el link cuando esté lista.
        </p>
      </div>

      <CreatePollForm />
    </HostShell>
  );
}
