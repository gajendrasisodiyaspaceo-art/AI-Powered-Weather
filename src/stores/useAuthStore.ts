import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { usePreferencesStore } from './usePreferencesStore';
import { useFavoritesStore } from './useFavoritesStore';
import * as storageService from '../services/storageService';

type AuthStatus = 'initial' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  error: string | null;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'initial',
  session: null,
  user: null,
  error: null,

  initialize: async () => {
    set({ status: 'loading' });
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({ status: 'authenticated', session, user: session.user });
      } else {
        set({ status: 'unauthenticated', session: null, user: null });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          set({ status: 'authenticated', session, user: session.user });
        } else {
          set({ status: 'unauthenticated', session: null, user: null });
        }
      });
    } catch {
      set({ status: 'unauthenticated', session: null, user: null });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        set({ error: error.message });
        return { success: false, error: error.message };
      }
      if (data.session) {
        set({ status: 'authenticated', session: data.session, user: data.user });
      }
      return { success: true };
    } catch (e: any) {
      const msg = e.message ?? 'Sign up failed';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signIn: async (email: string, password: string) => {
    set({ error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ error: error.message });
        return { success: false, error: error.message };
      }
      set({ status: 'authenticated', session: data.session, user: data.user });
      return { success: true };
    } catch (e: any) {
      const msg = e.message ?? 'Sign in failed';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    usePreferencesStore.getState().reset();
    useFavoritesStore.getState().reset();
    await storageService.clearAll();
    set({ status: 'unauthenticated', session: null, user: null, error: null });
  },

  resetPassword: async (email: string) => {
    set({ error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        set({ error: error.message });
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      const msg = e.message ?? 'Failed to send reset email';
      set({ error: msg });
      return { success: false, error: msg };
    }
  },

  clearError: () => set({ error: null }),
}));
