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
      agents: {
        Row: {
          assigned_station_id: string | null
          assigned_station_name: string | null
          campaign_id: string
          check_in_lat: number | null
          check_in_lon: number | null
          checked_in_at: string | null
          county: string | null
          created_at: string
          full_name: string
          id: string
          national_id: string | null
          payment_amount_kes: number | null
          payment_status: string | null
          phone: string
          photo_url: string | null
          status: string
          sub_county: string | null
          user_id: string | null
        }
        Insert: {
          assigned_station_id?: string | null
          assigned_station_name?: string | null
          campaign_id: string
          check_in_lat?: number | null
          check_in_lon?: number | null
          checked_in_at?: string | null
          county?: string | null
          created_at?: string
          full_name: string
          id?: string
          national_id?: string | null
          payment_amount_kes?: number | null
          payment_status?: string | null
          phone: string
          photo_url?: string | null
          status?: string
          sub_county?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_station_id?: string | null
          assigned_station_name?: string | null
          campaign_id?: string
          check_in_lat?: number | null
          check_in_lon?: number | null
          checked_in_at?: string | null
          county?: string | null
          created_at?: string
          full_name?: string
          id?: string
          national_id?: string | null
          payment_amount_kes?: number | null
          payment_status?: string | null
          phone?: string
          photo_url?: string | null
          status?: string
          sub_county?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          campaign_id: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          campaign_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          campaign_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_members: {
        Row: {
          campaign_id: string
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_members_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          bank_account_number: string | null
          bank_name: string | null
          candidate_name: string
          constituency: string | null
          county: string | null
          created_at: string
          donation_portal_slug: string | null
          id: string
          is_active: boolean
          owner_id: string
          party: string | null
          position: string
          spending_limit_kes: number | null
          subscription_tier: string
          updated_at: string
          ward: string | null
        }
        Insert: {
          bank_account_number?: string | null
          bank_name?: string | null
          candidate_name: string
          constituency?: string | null
          county?: string | null
          created_at?: string
          donation_portal_slug?: string | null
          id?: string
          is_active?: boolean
          owner_id: string
          party?: string | null
          position: string
          spending_limit_kes?: number | null
          subscription_tier?: string
          updated_at?: string
          ward?: string | null
        }
        Update: {
          bank_account_number?: string | null
          bank_name?: string | null
          candidate_name?: string
          constituency?: string | null
          county?: string | null
          created_at?: string
          donation_portal_slug?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string
          party?: string | null
          position?: string
          spending_limit_kes?: number | null
          subscription_tier?: string
          updated_at?: string
          ward?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_kes: number
          campaign_id: string
          compliance_status: string
          created_at: string
          donated_at: string
          donor_name: string | null
          donor_phone: string | null
          flagged_reason: string | null
          id: string
          is_anonymous: boolean
          kyc_status: string
          mpesa_ref: string | null
          receipt_number: string | null
        }
        Insert: {
          amount_kes: number
          campaign_id: string
          compliance_status?: string
          created_at?: string
          donated_at?: string
          donor_name?: string | null
          donor_phone?: string | null
          flagged_reason?: string | null
          id?: string
          is_anonymous?: boolean
          kyc_status?: string
          mpesa_ref?: string | null
          receipt_number?: string | null
        }
        Update: {
          amount_kes?: number
          campaign_id?: string
          compliance_status?: string
          created_at?: string
          donated_at?: string
          donor_name?: string | null
          donor_phone?: string | null
          flagged_reason?: string | null
          id?: string
          is_anonymous?: boolean
          kyc_status?: string
          mpesa_ref?: string | null
          receipt_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_items: {
        Row: {
          agent_id: string | null
          campaign_id: string
          captured_at: string
          created_at: string
          description: string | null
          exif_json: Json | null
          file_size_bytes: number | null
          file_url: string
          gps_lat: number | null
          gps_lon: number | null
          id: string
          sha256_hash: string
          station_id: string | null
          title: string
          type: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          agent_id?: string | null
          campaign_id: string
          captured_at?: string
          created_at?: string
          description?: string | null
          exif_json?: Json | null
          file_size_bytes?: number | null
          file_url: string
          gps_lat?: number | null
          gps_lon?: number | null
          id?: string
          sha256_hash: string
          station_id?: string | null
          title: string
          type: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          agent_id?: string | null
          campaign_id?: string
          captured_at?: string
          created_at?: string
          description?: string | null
          exif_json?: Json | null
          file_size_bytes?: number | null
          file_url?: string
          gps_lat?: number | null
          gps_lon?: number | null
          id?: string
          sha256_hash?: string
          station_id?: string | null
          title?: string
          type?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          agent_id: string | null
          campaign_id: string
          category: string
          created_at: string
          description: string
          gps_lat: number | null
          gps_lon: number | null
          id: string
          reported_at: string
          resolved_at: string | null
          station_id: string | null
          status: string
          urgency: string
        }
        Insert: {
          agent_id?: string | null
          campaign_id: string
          category: string
          created_at?: string
          description: string
          gps_lat?: number | null
          gps_lon?: number | null
          id?: string
          reported_at?: string
          resolved_at?: string | null
          station_id?: string | null
          status?: string
          urgency?: string
        }
        Update: {
          agent_id?: string | null
          campaign_id?: string
          category?: string
          created_at?: string
          description?: string
          gps_lat?: number | null
          gps_lon?: number | null
          id?: string
          reported_at?: string
          resolved_at?: string | null
          station_id?: string | null
          status?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_kes: number
          campaign_id: string
          category: string
          created_at: string
          description: string
          flagged_reason: string | null
          id: string
          receipt_url: string | null
          recorded_by: string
          reference: string | null
          status: string
          transaction_date: string
          type: string
          vendor_name: string | null
          verified_by: string | null
        }
        Insert: {
          amount_kes: number
          campaign_id: string
          category: string
          created_at?: string
          description: string
          flagged_reason?: string | null
          id?: string
          receipt_url?: string | null
          recorded_by: string
          reference?: string | null
          status?: string
          transaction_date?: string
          type: string
          vendor_name?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_kes?: number
          campaign_id?: string
          category?: string
          created_at?: string
          description?: string
          flagged_reason?: string | null
          id?: string
          receipt_url?: string | null
          recorded_by?: string
          reference?: string | null
          status?: string
          transaction_date?: string
          type?: string
          vendor_name?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
