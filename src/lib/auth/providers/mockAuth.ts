
import { AuthUser, AuthProviderType, MockUser } from '@/types/auth';
import { users } from '@/lib/data';

// Mock users for development
const mockUsers: MockUser[] = users.map(user => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role as 'client' | 'coach' | 'admin',
  password: 'password123', // All users have the same password for testing
}));

// Mock auth provider for development/testing
export const mockProvider = {
  type: 'mock' as AuthProviderType,
  
  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      const user = JSON.parse(userJson);
      return user;
    } catch {
      return null;
    }
  },
  
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    // Find user by email and password
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Store user in localStorage (simulate session)
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return { success: true, user: userWithoutPassword };
  },
  
  // Sign out
  signOut: async () => {
    localStorage.removeItem('user');
  },
  
  // Auth state change listener
  onAuthStateChange: (callback: (user: AuthUser | null) => void) => {
    // This is a very simple implementation
    // In a real app, you would use browser events
    const checkAuth = () => {
      const userJson = localStorage.getItem('user');
      try {
        const user = userJson ? JSON.parse(userJson) : null;
        callback(user);
      } catch {
        callback(null);
      }
    };
    
    // Call initially
    checkAuth();
    
    // No good way to listen for localStorage changes
    // So we just return a no-op function
    return () => {};
  },
};
