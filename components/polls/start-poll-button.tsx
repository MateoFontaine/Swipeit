"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { StartPollResult } from "@/lib/polls/mutations";
import { SubmitButton } from "@/components/ui/submit-button";
import { Skeleton } from "@/components/ui/skeleton";

type StartPollButtonProps = {
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

export function StartPollButton({ pollId }: StartPollButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const busy = loading || isPending;

  async function handleStart() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/polls/${pollId}/start`, {
        method: "POST",
      });
      const result = (await response.json()) as StartPollResult;

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      startTransition(() => {
        router.refresh();
        setLoading(false);
      });
    } catch {
      setError("No pudimos conectar con el servidor. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <FieldError message={error} />}
      <SubmitButton
        type="button"
        variant="primary"
        loading={busy}
        onClick={handleStart}
      >
        Iniciar votación
      </SubmitButton>
      {busy && (
        <div className="flex flex-col gap-2.5 pt-1" aria-hidden>
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
        </div>
      )}
    </div>
  );
}
