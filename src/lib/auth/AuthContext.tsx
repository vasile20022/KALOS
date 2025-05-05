
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, AuthProviderType } from '@/types/auth';
import { supabaseProvider } from './providers/supabaseAuth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signUp: (
    email: string, 
    password: string, 
    name?: string, 
    surname?: string, 
    role?: 'client' | 'coach',
    additionalData?: { 
      dateOfBirth?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (userData: { name?: string; surname?: string; email?: string }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  provider: AuthProviderType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const authProvider = supabaseProvider;

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const currentUser = await authProvider.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const unsubscribe = authProvider.onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authProvider.signIn(email, password);
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string,
    surname?: string,
    role?: 'client' | 'coach',
    additionalData?: {
      dateOfBirth?: string;
    }
  ) => {
    try {
      const result = await authProvider.signUp(email, password, name, surname, role, additionalData);
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Failed to sign up' };
    }
  };

  const signOut = async () => {
    try {
      await authProvider.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const result = await authProvider.changePassword(currentPassword, newPassword);
      return result;
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  };
  
  const updateProfile = async (userData: { name?: string; surname?: string; email?: string }) => {
    try {
      const result = await authProvider.updateProfile(userData);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        changePassword,
        updateProfile,
        provider: authProvider.type,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
