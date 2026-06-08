export function getMedalEmoji(rank: number): string {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return `${rank + 1}.`;
}

export function voteLabel(count: number): string {
  return count === 1 ? "1 voto" : `${count} votos`;
}
