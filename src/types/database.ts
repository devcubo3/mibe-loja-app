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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_configs: {
        Row: {
          global_fee_percent: number | null
          id: number
          support_email: string | null
          support_whatsapp: string | null
          updated_at: string | null
        }
        Insert: {
          global_fee_percent?: number | null
          id?: number
          support_email?: string | null
          support_whatsapp?: string | null
          updated_at?: string | null
        }
        Update: {
          global_fee_percent?: number | null
          id?: number
          support_email?: string | null
          support_whatsapp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cashback_balances: {
        Row: {
          company_id: string | null
          current_balance: number | null
          id: string
          last_purchase_date: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          current_balance?: number | null
          id?: string
          last_purchase_date?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          current_balance?: number | null
          id?: string
          last_purchase_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cashback_balances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          icon_url: string | null
          id: number
          name: string
        }
        Insert: {
          icon_url?: string | null
          id?: number
          name: string
        }
        Update: {
          icon_url?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          business_name: string
          cashback_percent: number | null
          category_id: number | null
          cnpj: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          expiration_days: number | null
          has_expiration: boolean | null
          id: string
          is_active: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          min_purchase_value: number | null
          owner_id: string | null
          phone: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["company_status"] | null
          trial_used_at: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          cashback_percent?: number | null
          category_id?: number | null
          cnpj?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          expiration_days?: number | null
          has_expiration?: boolean | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          min_purchase_value?: number | null
          owner_id?: string | null
          phone?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["company_status"] | null
          trial_used_at?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          cashback_percent?: number | null
          category_id?: number | null
          cnpj?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          expiration_days?: number | null
          has_expiration?: boolean | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          min_purchase_value?: number | null
          owner_id?: string | null
          phone?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["company_status"] | null
          trial_used_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_gallery: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          photo_url: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          photo_url: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_gallery_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
          user_type?: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          commission_date: string | null
          created_at: string
          due_date: string
          gateway_reference: string | null
          id: string
          payment_date: string | null
          status: string
          subscription_id: string
          type: string
        }
        Insert: {
          amount: number
          commission_date?: string | null
          created_at?: string
          due_date: string
          gateway_reference?: string | null
          id?: string
          payment_date?: string | null
          status?: string
          subscription_id: string
          type?: string
        }
        Update: {
          amount?: number
          commission_date?: string | null
          created_at?: string
          due_date?: string
          gateway_reference?: string | null
          id?: string
          payment_date?: string | null
          status?: string
          subscription_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          commission_percent: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          is_trial: boolean
          monthly_price: number
          name: string
          trial_duration_days: number | null
          updated_at: string
        }
        Insert: {
          commission_percent?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_trial?: boolean
          monthly_price: number
          name: string
          trial_duration_days?: number | null
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_trial?: boolean
          monthly_price?: number
          name?: string
          trial_duration_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      points_history: {
        Row: {
          created_at: string
          id: string
          points: number
          transaction_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          transaction_id?: string | null
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          transaction_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          company_id: string | null
          cpf: string | null
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean
          onboarding_completed: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          company_id?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_active?: boolean
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          company_id?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          company_id: string | null
          created_at: string | null
          id: string
          owner_response: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          owner_response?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          owner_response?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          admin_fee_amount: number | null
          cashback_earned: number
          cashback_redeemed: number | null
          company_id: string | null
          created_at: string | null
          id: string
          net_amount_paid: number
          payment_method: string
          total_amount: number
          user_id: string | null
        }
        Insert: {
          admin_fee_amount?: number | null
          cashback_earned: number
          cashback_redeemed?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          net_amount_paid: number
          payment_method?: string
          total_amount: number
          user_id?: string | null
        }
        Update: {
          admin_fee_amount?: number | null
          cashback_earned?: number
          cashback_redeemed?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          net_amount_paid?: number
          payment_method?: string
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: { Args: { email_input: string }; Returns: boolean }
      expire_old_cashback: { Args: never; Returns: undefined }
      expire_subscriptions: { Args: never; Returns: undefined }
      fn_check_overdue_invoices: { Args: never; Returns: undefined }
      fn_generate_monthly_invoices: { Args: never; Returns: undefined }
      is_super_admin: { Args: never; Returns: boolean }
      nearby_companies: {
        Args: {
          max_results?: number
          radius_km?: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          business_name: string
          cashback_percent: number
          category_id: number
          category_name: string
          dist_meters: number
          id: string
          latitude: number
          logo_url: string
          longitude: number
        }[]
      }
    }
    Enums: {
      company_status: "active" | "inactive" | "pending"
      user_role: "super_admin" | "company_owner" | "client" | "company_staff"
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
      company_status: ["active", "inactive", "pending"],
      user_role: ["super_admin", "company_owner", "client", "company_staff"],
    },
  },
} as const

// Aliases convenientes para Row types das principais tabelas
export type Plan = Tables<'plans'>
export type Subscription = Tables<'subscriptions'>
export type PaymentHistory = Tables<'payment_history'>
export type Profile = Tables<'profiles'>
export type Company = Tables<'companies'>
export type Transaction = Tables<'transactions'>
export type Review = Tables<'reviews'>
export type CashbackBalance = Tables<'cashback_balances'>
export type Category = Tables<'categories'>

