// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  app: {
    Tables: {
      users: {
        Row: {
          user_id: number;
          username: string;
          email: string;
          password_hash: string;
          full_name: string | null;
          avatar_url: string | null;
          current_level: number;
          total_points: number;
          streak_days: number;
          last_active_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: number;
          username: string;
          email: string;
          password_hash: string;
          full_name?: string | null;
          avatar_url?: string | null;
          current_level?: number;
          total_points?: number;
          streak_days?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: number;
          username?: string;
          email?: string;
          password_hash?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          current_level?: number;
          total_points?: number;
          streak_days?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      levels: {
        Row: {
          level_id: number;
          level_number: number;
          level_name: string;
          points_required: number;
          description: string | null;
          badge_url: string | null;
        };
        Insert: {
          level_id?: number;
          level_number: number;
          level_name: string;
          points_required: number;
          description?: string | null;
          badge_url?: string | null;
        };
        Update: {
          level_id?: number;
          level_number?: number;
          level_name?: string;
          points_required?: number;
          description?: string | null;
          badge_url?: string | null;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          achievement_id: number;
          title: string;
          description: string;
          icon_url: string | null;
          required_condition: string | null;
          points_reward: number;
        };
        Insert: {
          achievement_id?: number;
          title: string;
          description: string;
          icon_url?: string | null;
          required_condition?: string | null;
          points_reward?: number;
        };
        Update: {
          achievement_id?: number;
          title?: string;
          description?: string;
          icon_url?: string | null;
          required_condition?: string | null;
          points_reward?: number;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          user_id: number;
          achievement_id: number;
          date_achieved: string;
        };
        Insert: {
          user_id: number;
          achievement_id: number;
          date_achieved?: string;
        };
        Update: {
          user_id?: number;
          achievement_id?: number;
          date_achieved?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["achievement_id"];
          }
        ];
      };
      vocabulary_categories: {
        Row: {
          category_id: number;
          category_name: string;
          description: string | null;
          icon_url: string | null;
          difficulty_level: number;
          order_index: number | null;
        };
        Insert: {
          category_id?: number;
          category_name: string;
          description?: string | null;
          icon_url?: string | null;
          difficulty_level?: number;
          order_index?: number | null;
        };
        Update: {
          category_id?: number;
          category_name?: string;
          description?: string | null;
          icon_url?: string | null;
          difficulty_level?: number;
          order_index?: number | null;
        };
        Relationships: [];
      };
      vocabulary_words: {
        Row: {
          word_id: number;
          category_id: number;
          word: string;
          pronunciation: string | null;
          part_of_speech: string | null;
          definition: string;
          example_sentence: string | null;
          image_url: string | null;
          audio_url: string | null;
          difficulty_level: number;
        };
        Insert: {
          word_id?: number;
          category_id: number;
          word: string;
          pronunciation?: string | null;
          part_of_speech?: string | null;
          definition: string;
          example_sentence?: string | null;
          image_url?: string | null;
          audio_url?: string | null;
          difficulty_level?: number;
        };
        Update: {
          word_id?: number;
          category_id?: number;
          word?: string;
          pronunciation?: string | null;
          part_of_speech?: string | null;
          definition?: string;
          example_sentence?: string | null;
          image_url?: string | null;
          audio_url?: string | null;
          difficulty_level?: number;
        };
        Relationships: [
          {
            foreignKeyName: "vocabulary_words_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "vocabulary_categories";
            referencedColumns: ["category_id"];
          }
        ];
      };
      // Các bảng khác...
    };
    Functions: {
      update_user_points: {
        Args: {
          user_id_param: number;
          points_to_add: number;
        };
        Returns: undefined;
      };
      check_and_award_achievement: {
        Args: {
          user_id_param: number;
          condition_name: string;
        };
        Returns: boolean;
      };
      update_learning_streak: {
        Args: {
          user_id_param: number;
        };
        Returns: undefined;
      };
    };
  };
}
