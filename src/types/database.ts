export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_configs: {
        Row: {
          global_fee_percent: number | null
          id: number
          updated_at: string | null
        }
        Insert: {
          global_fee_percent?: number | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          global_fee_percent?: number | null
          id?: number
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
          asaas_customer_id: string | null
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
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          min_purchase_value: number | null
          owner_id: string | null
          phone: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["company_status"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          asaas_customer_id?: string | null
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
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          min_purchase_value?: number | null
          owner_id?: string | null
          phone?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          asaas_customer_id?: string | null
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
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          min_purchase_value?: number | null
          owner_id?: string | null
          phone?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["company_status"] | null
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
      company_users: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          onboarding_completed: boolean | null
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          onboarding_completed?: boolean | null
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          onboarding_completed?: boolean | null
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          base_amount: number
          created_at: string
          due_date: string
          excess_amount: number
          gateway_reference: string | null
          id: string
          payment_date: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          amount: number
          base_amount: number
          created_at?: string
          due_date: string
          excess_amount?: number
          gateway_reference?: string | null
          id?: string
          payment_date?: string | null
          status?: string
          subscription_id: string
        }
        Update: {
          amount?: number
          base_amount?: number
          created_at?: string
          due_date?: string
          excess_amount?: number
          gateway_reference?: string | null
          id?: string
          payment_date?: string | null
          status?: string
          subscription_id?: string
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
          created_at: string | null
          description: string | null
          excess_user_fee: number
          id: string
          is_active: boolean
          monthly_price: number
          name: string
          updated_at: string
          user_limit: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          excess_user_fee: number
          id?: string
          is_active?: boolean
          monthly_price: number
          name: string
          updated_at?: string
          user_limit: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          excess_user_fee?: number
          id?: string
          is_active?: boolean
          monthly_price?: number
          name?: string
          updated_at?: string
          user_limit?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          cpf: string
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          birth_date?: string | null
          cpf: string
          created_at?: string | null
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          birth_date?: string | null
          cpf?: string
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
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
          current_profile_count: number
          excess_amount: number
          excess_profiles: number
          id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          current_profile_count?: number
          excess_amount?: number
          excess_profiles?: number
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          current_profile_count?: number
          excess_amount?: number
          excess_profiles?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_old_cashback: { Args: Record<string, never>; Returns: undefined }
      is_super_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      company_status: "active" | "inactive" | "pending"
      user_role: "super_admin" | "company_owner" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos utilitarios para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Aliases para tabelas mais usadas
export type Company = Tables<'companies'>
export type CompanyUser = Tables<'company_users'>
export type Profile = Tables<'profiles'>
export type Transaction = Tables<'transactions'>
export type CashbackBalance = Tables<'cashback_balances'>
export type Review = Tables<'reviews'>
export type Category = Tables<'categories'>
export type Plan = Tables<'plans'>
export type Subscription = Tables<'subscriptions'>
export type PaymentHistory = Tables<'payment_history'>
export type AppConfig = Tables<'app_configs'>
export type CompanyGallery = Tables<'company_gallery'>

// Enums
export type CompanyStatus = Enums<'company_status'>
export type UserRole = Enums<'user_role'>
