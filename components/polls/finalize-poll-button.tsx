"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { hostFinalizePoll } from "@/lib/polls/results";
import { SubmitButton } from "@/components/ui/submit-button";
import { Skeleton } from "@/components/ui/skeleton";

type FinalizePollButtonProps = {
  pollId: string;
};

function FieldError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200/80 bg-red-50/80 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </p>
  );
}

export function FinalizePollButton({ pollId }: FinalizePollButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const busy = loading || isPending;

  async function handleFinalize() {
    setLoading(true);
    setError("");

    const result = await hostFinalizePoll(pollId);

    if (!result.success) {
      setError(result.error ?? "No pudimos finalizar la encuesta.");
      setLoading(false);
      return;
    }

    startTransition(() => {
      router.refresh();
      setLoading(false);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <FieldError message={error} />}
      <SubmitButton
        type="button"
        variant="primary"
        loading={busy}
        onClick={handleFinalize}
      >
        Finalizar y ver resultados
      </SubmitButton>
      {busy && (
        <div className="flex flex-col gap-2.5 pt-1" aria-hidden>
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      )}
    </div>
  );
}
