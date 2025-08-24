'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/supabaseClient';

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, firstName: string, lastName: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  checkAuth: async () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setLoading(false);
    };

    initAuth();
  }, []);

  const checkAuth = async () => {
    // Try to get user from Supabase
    try {
      const { data } = await getCurrentUser();
      
      if (data.user) {
        // Use Supabase user
        const email = data.user.email || '';
        
        // Get additional user info from localStorage if available
        const localUsers = JSON.parse(localStorage.getItem('users') || '{}');
        const localUser = localUsers[email];
        
        setUser({
          email,
          firstName: localUser?.firstName || '',
          lastName: localUser?.lastName || '',
          isLoggedIn: true
        });
        
        return true;
      }
    } catch (error) {
      console.warn('Supabase auth not fully configured, falling back to local auth');
    }
    
    // Fall back to localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          isLoggedIn: true
        });
        return true;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    
    setUser(null);
    return false;
  };

  const login = (email: string, firstName: string, lastName: string) => {
    const userData = {
      email,
      firstName,
      lastName,
      isLoggedIn: true
    };
    
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = async () => {
    // Try Supabase logout first
    try {
      await signOut();
    } catch (error) {
      console.warn('Supabase signout error, falling back to local logout');
    }
    
    // Local logout
    localStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
