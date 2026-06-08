import { redirect } from "next/navigation";
import { HostShell } from "@/components/host/host-shell";

export const dynamic = "force-dynamic";
import { PollCard } from "@/components/polls/poll-card";
import { Button } from "@/components/ui/button";
import { getHostPolls } from "@/lib/polls/queries";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let displayName = user.email?.split("@")[0] ?? "Usuario";

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profile?.display_name) {
    displayName = profile.display_name;
  }

  const polls = await getHostPolls();
  const activePolls = polls.filter((p) =>
    ["esperando", "votando", "ballotage"].includes(p.status)
  );
  const pastPolls = polls.filter((p) =>
    ["resultados", "cerrado"].includes(p.status)
  );

  return (
    <HostShell>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/6">
        <p className="text-sm font-medium text-accent">Tu espacio</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Hola, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="mt-6">
        <Button href="/dashboard/nueva" variant="primary">
          + Nueva encuesta
        </Button>
      </div>

      {polls.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-4xl" aria-hidden="true">
            📊
          </p>
          <h2 className="mt-3 text-lg font-semibold">Todavía no tenés encuestas</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Creá tu primera encuesta, compartí el link y dejá que el grupo vote
            deslizando.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {activePolls.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Activas
              </h2>
              <div className="flex flex-col gap-3">
                {activePolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            </section>
          )}

          {pastPolls.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Pasadas
              </h2>
              <div className="flex flex-col gap-3">
                {pastPolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </HostShell>
  );
}
