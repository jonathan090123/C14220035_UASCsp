'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  username: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Attempting to sign in with username:', username);
      
      // Query the users table to find the user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Invalid username or password' };
        }
        return { success: false, error: 'Database connection error' };
      }

      if (!data) {
        return { success: false, error: 'Invalid username or password' };
      }

      // For demo purposes, we're using simple password comparison
      // In production, you should use proper password hashing
      const validCredentials = {
        'user1': 'password123',
        'admin1': 'adminpassword'
      };

      const expectedPassword = validCredentials[username as keyof typeof validCredentials];
      
      if (!expectedPassword || expectedPassword !== password) {
        return { success: false, error: 'Invalid username or password' };
      }

      const userData = {
        id: data.id,
        username: data.username,
        role: data.role as 'user' | 'admin'
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Authentication failed. Please check your connection.' };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}