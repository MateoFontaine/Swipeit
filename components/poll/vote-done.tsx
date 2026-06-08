type VoteDoneProps = {
  nickname: string;
};

export function VoteDone({ nickname }: VoteDoneProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <p className="text-4xl" aria-hidden="true">
        ✓
      </p>
      <h2 className="mt-3 text-lg font-semibold text-emerald-900">
        ¡Listo, {nickname}!
      </h2>
      <p className="mt-2 text-sm text-emerald-800 leading-relaxed">
        Tus votos fueron registrados correctamente.
      </p>
      <p className="mt-4 text-sm text-emerald-700">
        Podés cerrar esta página. El organizador te avisará si hace falta algo
        más.
      </p>
    </div>
  );
}
