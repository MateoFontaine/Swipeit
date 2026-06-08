"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startPoll } from "@/lib/polls/actions";
import { SubmitButton } from "@/components/ui/submit-button";

type StartPollButtonProps = {
  pollId: string;
};

export function StartPollButton({ pollId }: StartPollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    setLoading(true);
    setError("");

    const result = await startPoll(pollId);

    if (!result.success) {
      setError(result.error);
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
        variant="success"
        loading={loading}
        onClick={handleStart}
      >
        Iniciar votación
      </SubmitButton>
    </div>
  );
}
