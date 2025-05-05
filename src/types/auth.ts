
// Auth user type used throughout the app
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  surname?: string;
  role: 'client' | 'coach' | 'admin';
  avatarUrl?: string;
}

// Auth provider types
export type AuthProviderType = 'supabase' | 'firebase' | 'clerk' | 'mock';

// Mock auth provider for development/testing
export interface MockUser extends AuthUser {
  password: string;
}
