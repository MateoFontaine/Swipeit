"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { hostFinalizePoll } from "@/lib/polls/results";
import { SubmitButton } from "@/components/ui/submit-button";

type FinalizePollButtonProps = {
  pollId: string;
};

export function FinalizePollButton({ pollId }: FinalizePollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFinalize() {
    setLoading(true);
    setError("");

    const result = await hostFinalizePoll(pollId);

    if (!result.success) {
      setError(result.error ?? "No pudimos finalizar la encuesta.");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <SubmitButton
        type="button"
        variant="primary"
        loading={loading}
        onClick={handleFinalize}
      >
        Finalizar y ver resultados
      </SubmitButton>
    </div>
  );
}
