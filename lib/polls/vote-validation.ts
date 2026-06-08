import type { VoteValue } from "@/types";

export type VoteInput = {
  optionId: string;
  value: VoteValue;
};

export function mapVoteError(message: string): string {
  if (message.includes("duplicate key") || message.includes("unique")) {
    return "Ya enviaste tus votos para esta ronda.";
  }
  if (message.includes("row-level security")) {
    return "No tenés permiso para votar en esta encuesta.";
  }
  return message;
}

export function validateVoteInputs(
  votes: VoteInput[],
  requiredOptionIds: string[]
): { valid: true } | { valid: false; error: string } {
  if (votes.length !== requiredOptionIds.length) {
    return {
      valid: false,
      error: `Tenés que votar las ${requiredOptionIds.length} opciones.`,
    };
  }

  const requiredSet = new Set(requiredOptionIds);
  const seen = new Set<string>();

  for (const vote of votes) {
    if (!requiredSet.has(vote.optionId)) {
      return {
        valid: false,
        error: "Una de las opciones no pertenece a esta encuesta.",
      };
    }

    if (seen.has(vote.optionId)) {
      return {
        valid: false,
        error: "Solo podés votar una vez por opción.",
      };
    }

    if (vote.value !== "yes" && vote.value !== "no") {
      return { valid: false, error: "Valor de voto inválido." };
    }

    seen.add(vote.optionId);
  }

  for (const optionId of requiredOptionIds) {
    if (!seen.has(optionId)) {
      return {
        valid: false,
        error: "Falta votar al menos una opción.",
      };
    }
  }

  return { valid: true };
}
