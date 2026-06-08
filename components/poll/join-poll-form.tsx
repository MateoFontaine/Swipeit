"use client";

import { useState } from "react";
import type { JoinPollResult } from "@/lib/polls/participant-mutations";
import { storeParticipantId } from "@/lib/polls/participant-storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

type JoinPollFormProps = {
  shareToken: string;
  pollId: string;
  suggestedNickname?: string;
  onJoined: (participantId: string, nickname: string) => void;
};

export function JoinPollForm({
  shareToken,
  pollId,
  suggestedNickname = "",
  onJoined,
}: JoinPollFormProps) {
  const [nickname, setNickname] = useState(suggestedNickname);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/polls/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareToken, nickname }),
      });

      const result = (await response.json()) as JoinPollResult;

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      storeParticipantId(pollId, result.participantId);
      onJoined(result.participantId, result.nickname);
    } catch {
      setError("No pudimos conectar con el servidor. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="nickname">Tu nickname</Label>
        <Input
          id="nickname"
          name="nickname"
          placeholder="¿Cómo te llamamos?"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={30}
          required
          autoComplete="nickname"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          2–30 caracteres. Todos van a ver tu nickname al votar.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <SubmitButton loading={loading}>Unirme</SubmitButton>
    </form>
  );
}
