const KEY_PREFIX = "swipeit_participant_";

export function participantStorageKey(pollId: string): string {
  return `${KEY_PREFIX}${pollId}`;
}

export function getStoredParticipantId(pollId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(participantStorageKey(pollId));
}

export function storeParticipantId(
  pollId: string,
  participantId: string
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(participantStorageKey(pollId), participantId);
}

export function clearStoredParticipantId(pollId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(participantStorageKey(pollId));
}
