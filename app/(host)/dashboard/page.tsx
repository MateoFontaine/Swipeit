import { redirect } from "next/navigation";
import { HostShell } from "@/components/host/host-shell";

export const dynamic = "force-dynamic";
import { PollCard } from "@/components/polls/poll-card";
import { Button } from "@/components/ui/button";
import { getHostPolls, getParticipantPolls } from "@/lib/polls/queries";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

function PollListSection({
  title,
  polls,
  emptyMessage,
  hrefPrefix,
  dateLabel,
}: {
  title: string;
  polls: Awaited<ReturnType<typeof getHostPolls>>;
  emptyMessage?: string;
  hrefPrefix: string;
  dateLabel?: string;
}) {
  if (polls.length === 0) {
    if (!emptyMessage) return null;

    return (
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {emptyMessage}
          </p>
        </div>
      </section>
    );
  }

  const activePolls = polls.filter((poll) =>
    ["esperando", "votando", "ballotage"].includes(poll.status)
  );
  const pastPolls = polls.filter((poll) =>
    ["resultados", "cerrado"].includes(poll.status)
  );

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>

      {activePolls.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Activas
          </h3>
          <div className="flex flex-col gap-3">
            {activePolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                href={`${hrefPrefix}/${poll.id}`}
                dateLabel={dateLabel}
              />
            ))}
          </div>
        </div>
      )}

      {pastPolls.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pasadas
          </h3>
          <div className="flex flex-col gap-3">
            {pastPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                href={`${hrefPrefix}/${poll.id}`}
                dateLabel={dateLabel}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

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

  const [hostPolls, participatedPolls] = await Promise.all([
    getHostPolls(),
    getParticipantPolls(),
  ]);

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

      <div className="mt-8 flex flex-col gap-10">
        <PollListSection
          title="Mis encuestas"
          polls={hostPolls}
          hrefPrefix="/dashboard"
          dateLabel="Creada"
          emptyMessage="Todavía no creaste encuestas. Creá la primera y compartí el link con tu grupo."
        />

        <PollListSection
          title="Participé en"
          polls={participatedPolls}
          hrefPrefix="/dashboard/participated"
          dateLabel="Encuesta del"
          emptyMessage="Cuando votes en encuestas con tu cuenta (o vincules tu participación ghost), aparecerán acá."
        />
      </div>
    </HostShell>
  );
}
