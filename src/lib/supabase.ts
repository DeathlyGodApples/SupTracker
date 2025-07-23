import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          is_premium: boolean
          trial_ends_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          is_premium?: boolean
          trial_ends_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_premium?: boolean
          trial_ends_at?: string
          updated_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: any
          schedule: any
          inventory: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage: any
          schedule: any
          inventory: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: any
          schedule?: any
          inventory?: number
          notes?: string | null
        }
      }
      medication_logs: {
        Row: {
          id: string
          user_id: string
          medication_id: string
          timestamp: string
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          medication_id: string
          timestamp?: string
          status: string
        }
        Update: {
          id?: string
          user_id?: string
          medication_id?: string
          timestamp?: string
          status?: string
        }
      }
    }
  }
}