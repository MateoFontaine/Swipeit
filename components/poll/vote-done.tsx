type VoteDoneProps = {
  nickname: string;
};

export function VoteDone({ nickname }: VoteDoneProps) {
  return (
    <div
      role="status"
      className="rounded-xl border border-violet-200/60 bg-violet-500/[0.04] px-5 py-8 text-center sm:px-6"
    >
      <p className="text-sm font-medium text-violet-600">Listo</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        ¡Gracias, {nickname}!
      </h2>
      <div className="mx-auto mt-3 h-0.5 w-6 rounded-full bg-violet-500" aria-hidden />
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Tus votos fueron registrados. Podés cerrar esta página; el organizador
        te avisará si hace falta algo más.
      </p>
    </div>
  );
}
