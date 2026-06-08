export type PollStatus =
  | "esperando"
  | "votando"
  | "ballotage"
  | "resultados"
  | "cerrado";

export type VoteValue = "yes" | "no";

export type {
  Database,
  Poll,
  PollOption,
  Participant,
  Profile,
  Vote,
} from "./database";
