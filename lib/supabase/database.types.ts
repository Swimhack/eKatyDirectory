export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          role: 'user' | 'admin'
          avatar_url?: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
          role?: 'user' | 'admin'
          avatar_url?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          role?: 'user' | 'admin'
          avatar_url?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          lat: number
          lng: number
          phone?: string
          website?: string
          categories: string[]
          hours?: Json
          price_level: 1 | 2 | 3 | 4
          photos: string[]
          featured: boolean
          source?: string
          last_updated: string
          created_at: string
          rating?: number
          review_count?: number
        }
        Insert: {
          id?: string
          name: string
          address: string
          lat: number
          lng: number
          phone?: string
          website?: string
          categories?: string[]
          hours?: Json
          price_level?: 1 | 2 | 3 | 4
          photos?: string[]
          featured?: boolean
          source?: string
          last_updated?: string
          created_at?: string
          rating?: number
          review_count?: number
        }
        Update: {
          id?: string
          name?: string
          address?: string
          lat?: number
          lng?: number
          phone?: string
          website?: string
          categories?: string[]
          hours?: Json
          price_level?: 1 | 2 | 3 | 4
          photos?: string[]
          featured?: boolean
          source?: string
          last_updated?: string
          created_at?: string
          rating?: number
          review_count?: number
        }
      }
      reviews: {
        Row: {
          id: string
          restaurant_id: string
          user_id: string
          rating: number
          text?: string
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          user_id: string
          rating: number
          text?: string
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          user_id?: string
          rating?: number
          text?: string
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          created_at?: string
        }
      }
      spins: {
        Row: {
          id: string
          user_id?: string
          restaurant_id: string
          spin_params?: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          restaurant_id: string
          spin_params?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          spin_params?: Json
          created_at?: string
        }
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
  }
}

// Helper types
export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Spin = Database['public']['Tables']['spins']['Row']