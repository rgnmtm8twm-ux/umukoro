export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          answer_text: string | null
          attempt_id: string
          auto_marks: number | null
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_option: string | null
          self_marks: number | null
        }
        Insert: {
          answer_text?: string | null
          attempt_id: string
          auto_marks?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_option?: string | null
          self_marks?: number | null
        }
        Update: {
          answer_text?: string | null
          attempt_id?: string
          auto_marks?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_option?: string | null
          self_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          auto_score: number | null
          created_at: string
          id: string
          is_complete: boolean
          paper_id: string
          self_score: number | null
          started_at: string
          submitted_at: string | null
          total_marks: number | null
          user_id: string
        }
        Insert: {
          auto_score?: number | null
          created_at?: string
          id?: string
          is_complete?: boolean
          paper_id: string
          self_score?: number | null
          started_at?: string
          submitted_at?: string | null
          total_marks?: number | null
          user_id: string
        }
        Update: {
          auto_score?: number | null
          created_at?: string
          id?: string
          is_complete?: boolean
          paper_id?: string
          self_score?: number | null
          started_at?: string
          submitted_at?: string | null
          total_marks?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contributor_applications: {
        Row: {
          created_at: string
          id: string
          motivation: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          school_or_org: string | null
          status: string
          subject_expertise: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          motivation?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          school_or_org?: string | null
          status?: string
          subject_expertise?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          motivation?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          school_or_org?: string | null
          status?: string
          subject_expertise?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributor_applications_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributor_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          paper_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          paper_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          paper_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marking_schemes: {
        Row: {
          created_at: string
          id: string
          marking_notes: string | null
          model_answer: string
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          marking_notes?: string | null
          model_answer: string
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          marking_notes?: string | null
          model_answer?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marking_schemes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          contributor_id: string | null
          created_at: string
          id: string
          is_published: boolean
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          contributor_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          contributor_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      papers: {
        Row: {
          contributor_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          is_published: boolean
          paper_number: number
          pdf_url: string | null
          subject_id: string
          title: string
          total_marks: number | null
          updated_at: string
          year: number
        }
        Insert: {
          contributor_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          paper_number?: number
          pdf_url?: string | null
          subject_id: string
          title: string
          total_marks?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          contributor_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          paper_number?: number
          pdf_url?: string | null
          subject_id?: string
          title?: string
          total_marks?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "papers_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean
          is_contributor: boolean
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          is_contributor?: boolean
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_contributor?: boolean
          role?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string | null
          correct_option: string | null
          created_at: string
          id: string
          marks: number
          options: Json | null
          order_index: number
          paper_id: string
          question_text: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          correct_answer?: string | null
          correct_option?: string | null
          created_at?: string
          id?: string
          marks?: number
          options?: Json | null
          order_index: number
          paper_id: string
          question_text: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          correct_answer?: string | null
          correct_option?: string | null
          created_at?: string
          id?: string
          marks?: number
          options?: Json | null
          order_index?: number
          paper_id?: string
          question_text?: string
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          level: string
          published_at: string | null
          resource_type: string
          reviewed_by: string | null
          status: string
          subject: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          level: string
          published_at?: string | null
          resource_type: string
          reviewed_by?: string | null
          status?: string
          subject?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          level?: string
          published_at?: string | null
          resource_type?: string
          reviewed_by?: string | null
          status?: string
          subject?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saves: {
        Row: {
          created_at: string
          id: string
          paper_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          paper_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          paper_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          id: string
          level: Database["public"]["Enums"]["exam_level"]
          name: string
          slug: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["exam_level"]
          name: string
          slug: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["exam_level"]
          name?: string
          slug?: string
        }
        Relationships: []
      }
      syllabi: {
        Row: {
          content: string
          created_at: string
          id: string
          is_current: boolean
          subject_id: string
          version: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_current?: boolean
          subject_id: string
          version?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_current?: boolean
          subject_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syllabi_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      exam_level: "PLE" | "O_LEVEL" | "A_LEVEL"
      question_type: "mcq" | "short" | "long" | "math"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      exam_level: ["PLE", "O_LEVEL", "A_LEVEL"],
      question_type: ["mcq", "short", "long", "math"],
    },
  },
} as const
