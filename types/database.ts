import type { PollStatus } from "./index";

export type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export type Poll = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  max_participants: number;
  time_limit_minutes: number | null;
  status: PollStatus;
  share_token: string;
  created_at: string;
  started_at: string | null;
  closes_at: string | null;
  ballotage_option_ids: string[] | null;
  winner_option_ids: string[] | null;
  closed_at: string | null;
};

export type PollOption = {
  id: string;
  poll_id: string;
  text: string;
  image_url: string | null;
  sort_order: number;
};

export type Participant = {
  id: string;
  poll_id: string;
  user_id: string | null;
  nickname: string;
  joined_at: string;
};

export type Vote = {
  id: string;
  poll_id: string;
  participant_id: string;
  option_id: string;
  value: boolean;
  round: 1 | 2;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      polls: {
        Row: Poll;
        Insert: {
          id?: string;
          host_id: string;
          title: string;
          description?: string | null;
          max_participants?: number;
          time_limit_minutes?: number | null;
          status?: PollStatus;
          share_token?: string;
          created_at?: string;
          started_at?: string | null;
          closes_at?: string | null;
          ballotage_option_ids?: string[] | null;
          winner_option_ids?: string[] | null;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          host_id?: string;
          title?: string;
          description?: string | null;
          max_participants?: number;
          time_limit_minutes?: number | null;
          status?: PollStatus;
          share_token?: string;
          created_at?: string;
          started_at?: string | null;
          closes_at?: string | null;
          ballotage_option_ids?: string[] | null;
          winner_option_ids?: string[] | null;
          closed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "polls_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      poll_options: {
        Row: PollOption;
        Insert: {
          id?: string;
          poll_id: string;
          text: string;
          image_url?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          poll_id?: string;
          text?: string;
          image_url?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
        ];
      };
      participants: {
        Row: Participant;
        Insert: {
          id?: string;
          poll_id: string;
          user_id?: string | null;
          nickname: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          user_id?: string | null;
          nickname?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "participants_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      votes: {
        Row: Vote;
        Insert: {
          id?: string;
          poll_id: string;
          participant_id: string;
          option_id: string;
          value: boolean;
          round?: 1 | 2;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          participant_id?: string;
          option_id?: string;
          value?: boolean;
          round?: 1 | 2;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_participant_id_fkey";
            columns: ["participant_id"];
            isOneToOne: false;
            referencedRelation: "participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "poll_options";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_poll_by_share_token: {
        Args: { p_token: string };
        Returns: Poll;
      };
      get_poll_options_by_share_token: {
        Args: { p_token: string };
        Returns: PollOption[];
      };
      poll_is_joinable: {
        Args: { p_poll_id: string };
        Returns: boolean;
      };
      generate_share_token: {
        Args: Record<string, never>;
        Returns: string;
      };
      check_and_close_poll: {
        Args: { p_poll_id: string };
        Returns: {
          closed: boolean;
          status?: PollStatus;
          reason?: string;
          error?: string;
          ballotage?: boolean;
          tied?: boolean;
        };
      };
      calculate_results: {
        Args: { p_poll_id: string };
        Returns: {
          status?: PollStatus;
          ballotage_option_ids?: string[];
          winner_option_ids?: string[];
          tied?: boolean;
          error?: string;
        };
      };
      finalize_poll: {
        Args: { p_poll_id: string };
        Returns: {
          status?: PollStatus;
          finalized?: boolean;
          error?: string;
        };
      };
      get_poll_results: {
        Args: { p_poll_id: string };
        Returns: {
          round: number;
          is_tie: boolean;
          winner_option_ids: string[];
          ranking: {
            option_id: string;
            text: string;
            sort_order: number;
            yes_count: number;
            is_winner: boolean;
            yes_voters: string[];
          }[];
        } | null;
      };
      get_poll_live_stats: {
        Args: { p_poll_id: string };
        Returns: {
          status: PollStatus;
          participant_count: number;
          max_participants: number;
          voted_count: number;
          round: number;
          participants: {
            id: string;
            nickname: string;
            joined_at: string;
            has_voted: boolean;
            votes: { option_id: string; value: boolean; round: number }[];
          }[];
          partial_counts: {
            option_id: string;
            text: string;
            sort_order: number;
            yes_count: number;
            no_count: number;
          }[];
        } | null;
      };
      get_yes_counts: {
        Args: { p_poll_id: string; p_round: number };
        Returns: { option_id: string; yes_count: number }[];
      };
      get_participant_count: {
        Args: { p_poll_id: string };
        Returns: number;
      };
      get_participant_polls: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          host_id: string;
          title: string;
          description: string | null;
          max_participants: number;
          time_limit_minutes: number | null;
          status: PollStatus;
          share_token: string;
          created_at: string;
          started_at: string | null;
          closes_at: string | null;
          ballotage_option_ids: string[] | null;
          winner_option_ids: string[] | null;
          closed_at: string | null;
          winner_label: string | null;
        }[];
      };
      get_participant_poll: {
        Args: { p_poll_id: string };
        Returns: Poll | null;
      };
      link_participant_to_user: {
        Args: { p_participant_id: string };
        Returns: {
          success: boolean;
          error?: string;
          participant_id?: string;
          nickname?: string;
          linked?: boolean;
          reconnected?: boolean;
          message?: string;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
