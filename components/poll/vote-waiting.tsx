"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type VoteWaitingProps = {
  nickname: string;
};

export function VoteWaiting({ nickname }: VoteWaitingProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
      <p className="text-4xl" aria-hidden="true">
        ⏳
      </p>
      <h2 className="mt-3 text-lg font-semibold text-amber-900">
        ¡Listo, {nickname}!
      </h2>
      <p className="mt-2 text-sm text-amber-800 leading-relaxed">
        Tus votos fueron registrados. Esperando que voten los demás…
      </p>
      <p className="mt-4 text-xs text-amber-700">
        Esta página se actualiza sola cuando termine la votación.
      </p>
    </div>
  );
}
