import { redirect } from "next/navigation";
import { HostShell } from "@/components/host/host-shell";
import { PollCard } from "@/components/polls/poll-card";
import { NavButton } from "@/components/ui/nav-button";
import { getHostPolls, getParticipantPolls } from "@/lib/polls/queries";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

type Poll = Awaited<ReturnType<typeof getHostPolls>>[number];

function PollListSection({
  title,
  eyebrow,
  polls,
  emptyMessage,
  hrefPrefix,
  dateLabel,
}: {
  title: string;
  eyebrow: string;
  polls: Poll[];
  emptyMessage?: string;
  hrefPrefix: string;
  dateLabel?: string;
}) {
  if (polls.length === 0) {
    if (!emptyMessage) return null;

    return (
      <section>
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="mt-5 rounded-xl border border-dashed border-violet-200/60 bg-violet-500/[0.03] px-5 py-8 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
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
    <section>
      <SectionHeader eyebrow={eyebrow} title={title} />

      <div className="mt-5 flex flex-col gap-6">
        {activePolls.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Activas
            </h3>
            <div className="flex flex-col gap-2.5">
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
            <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Anteriores
            </h3>
            <div className="flex flex-col gap-2.5">
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
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-violet-600">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-[1.375rem]">
        {title}
      </h2>
      <div className="mt-3 h-0.5 w-6 rounded-full bg-violet-500" aria-hidden />
    </div>
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
      <header>
        <p className="text-sm font-medium text-violet-600">Tu espacio</p>
        <h1 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem]">
          Hola, {displayName}
        </h1>
        <div className="mt-4 h-0.5 w-8 rounded-full bg-violet-500" aria-hidden />
        {user.email && (
          <p className="mt-4 truncate text-sm text-muted-foreground">
            {user.email}
          </p>
        )}
      </header>

      <div className="mt-8 sm:mt-10">
        <NavButton href="/dashboard/nueva">+ Nueva encuesta</NavButton>
      </div>

      <div className="mt-10 flex flex-col gap-12 sm:mt-12 sm:gap-14">
        <PollListSection
          eyebrow="Creadas por vos"
          title="Mis encuestas"
          polls={hostPolls}
          hrefPrefix="/dashboard"
          dateLabel="Creada"
          emptyMessage="Todavía no creaste encuestas. Tocá el botón de arriba y compartí el link con tu grupo."
        />

        <PollListSection
          eyebrow="Donde votaste"
          title="Participé en"
          polls={participatedPolls}
          hrefPrefix="/dashboard/participated"
          dateLabel="Encuesta del"
          emptyMessage="Cuando votes con tu cuenta, tus encuestas aparecerán acá."
        />
      </div>

      {hostPolls.length === 0 && (
        <>
          <div className="h-4 sm:hidden" aria-hidden />
          <div className="sticky bottom-0 -mx-5 border-t border-border/50 bg-background/90 px-5 py-4 backdrop-blur-xl sm:hidden">
            <NavButton href="/dashboard/nueva">+ Nueva encuesta</NavButton>
          </div>
        </>
      )}
    </HostShell>
  );
}
