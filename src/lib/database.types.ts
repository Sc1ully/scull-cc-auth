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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      key_claims: {
        Row: {
          claimed_at: string
          id: string
          key_id: string
          lootlabs_task_id: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          key_id: string
          lootlabs_task_id?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          key_id?: string
          lootlabs_task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_claims_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "key_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_claims_lootlabs_task_id_fkey"
            columns: ["lootlabs_task_id"]
            isOneToOne: false
            referencedRelation: "lootlabs_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      key_inventory: {
        Row: {
          added_at: string
          added_by: string | null
          id: string
          issued_at: string | null
          issued_to: string | null
          key_value: string
          notes: string | null
          status: Database["public"]["Enums"]["key_status"]
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          id?: string
          issued_at?: string | null
          issued_to?: string | null
          key_value: string
          notes?: string | null
          status?: Database["public"]["Enums"]["key_status"]
        }
        Update: {
          added_at?: string
          added_by?: string | null
          id?: string
          issued_at?: string | null
          issued_to?: string | null
          key_value?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["key_status"]
        }
        Relationships: [
          {
            foreignKeyName: "key_inventory_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_inventory_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lootlabs_tasks: {
        Row: {
          completed_at: string | null
          completion_ip: string | null
          completion_unique_id: string | null
          created_at: string
          id: string
          key_id: string | null
          lootlabs_short: string | null
          lootlabs_unique_id: string | null
          lootlabs_url: string | null
          puid: string
          status: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_ip?: string | null
          completion_unique_id?: string | null
          created_at?: string
          id?: string
          key_id?: string | null
          lootlabs_short?: string | null
          lootlabs_unique_id?: string | null
          lootlabs_url?: string | null
          puid: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_ip?: string | null
          completion_unique_id?: string | null
          created_at?: string
          id?: string
          key_id?: string | null
          lootlabs_short?: string | null
          lootlabs_unique_id?: string | null
          lootlabs_url?: string | null
          puid?: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lootlabs_tasks_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "key_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lootlabs_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_keys: {
        Row: {
          claim_id: string | null
          claimed_at: string | null
          issued_at: string | null
          key_status: Database["public"]["Enums"]["key_status"] | null
          key_value: string | null
          lootlabs_task_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "key_claims_lootlabs_task_id_fkey"
            columns: ["lootlabs_task_id"]
            isOneToOne: false
            referencedRelation: "lootlabs_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      claim_available_key: {
        Args: { p_task_id: string; p_user_id: string }
        Returns: {
          claim_id: string
          key_value: string
        }[]
      }
    }
    Enums: {
      key_status: "available" | "issued" | "disabled"
      task_status: "pending" | "completed" | "failed"
      user_role: "user" | "admin"
      user_status: "active" | "disabled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      key_status: ["available", "issued", "disabled"],
      task_status: ["pending", "completed", "failed"],
      user_role: ["user", "admin"],
      user_status: ["active", "disabled"],
    },
  },
} as const
