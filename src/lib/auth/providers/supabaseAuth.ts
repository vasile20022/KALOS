
import { createClient } from '@supabase/supabase-js';
import { AuthUser, AuthProviderType } from '@/types/auth';

// Initialize Supabase client with public values
const supabase = createClient(
  'https://tuqvfblugumqqljoqqou.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cXZmYmx1Z3VtcXFsam9xcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODczNzksImV4cCI6MjA1NzI2MzM3OX0.Z_r5UM2LCW4yW1DOBSS34oPUIYn0ioE2MY4I6ARYkrQ',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Transform Supabase user to our app's user format
const transformUser = (supabaseUser: any): AuthUser | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || 'User',
    surname: supabaseUser.user_metadata?.surname || '',
    role: supabaseUser.user_metadata?.role || 'client',
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
  };
};

// Supabase authentication provider
export const supabaseProvider = {
  type: 'supabase' as AuthProviderType,
  
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? transformUser(user) : null;
  },
  
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    const transformedUser = transformUser(data.user);
    return { success: true, user: transformedUser };
  },

  signUp: async (email: string, password: string, name?: string, surname?: string, role?: 'client' | 'coach', additionalData?: { dateOfBirth?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          surname: surname || '',
          role: role || 'client',
          dateOfBirth: additionalData?.dateOfBirth || null, // Store the date of birth
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: transformUser(data.user) };
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        console.error('Password verification failed:', signInError);
        return { success: false, error: 'Current password is incorrect' };
      }
      
      // If verification succeeded, update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Password update failed:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  updateProfile: async (userData: { name?: string; surname?: string; email?: string }) => {
    const updates: any = {};
    
    if (userData.name || userData.surname) {
      updates.data = {};
      if (userData.name) updates.data.name = userData.name;
      if (userData.surname) updates.data.surname = userData.surname;
    }
    
    if (userData.email) {
      updates.email = userData.email;
    }
    
    if (Object.keys(updates).length === 0) {
      return { success: true };
    }
    
    try {
      // First update the auth user metadata
      const { data, error } = await supabase.auth.updateUser(updates);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Then update the user's profile in the profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: userData.name || data.user.user_metadata.name,
            surname: userData.surname || data.user.user_metadata.surname
          })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error('Profile update failed:', profileError);
          return { success: false, error: profileError.message };
        }
      }
      
      return { success: true, user: transformUser(data.user) };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  onAuthStateChange: (callback: (user: AuthUser | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session ? transformUser(session.user) : null;
      callback(user);
    });
    
    return data.subscription.unsubscribe;
  },
};
