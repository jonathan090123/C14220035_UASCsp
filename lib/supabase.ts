import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('Please make sure you have set up your Supabase project and added the credentials to .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          role: 'user' | 'admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          role?: 'user' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          role?: 'user' | 'admin';
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          nama_produk: string;
          harga_satuan: number;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama_produk: string;
          harga_satuan: number;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama_produk?: string;
          harga_satuan?: number;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};