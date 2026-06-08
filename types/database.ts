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
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
