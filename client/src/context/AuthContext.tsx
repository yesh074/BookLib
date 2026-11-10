import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('bookmind_token');
    const savedUser = localStorage.getItem('bookmind_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('bookmind_token');
        localStorage.removeItem('bookmind_user');
      }
    }
    setIsLoading(false);
  }, []);

  const saveAuthSession = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    if (authenticatedUser.token) {
      setToken(authenticatedUser.token);
      localStorage.setItem('bookmind_token', authenticatedUser.token);
    }
    localStorage.setItem('bookmind_user', JSON.stringify(authenticatedUser));
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    saveAuthSession(data);
  };

  const register = async (name: string, email: string, password: string, avatar?: string) => {
    const data = await api.register(name, email, password, avatar);
    saveAuthSession(data);
  };

  const loginAsDemo = async () => {
    const data = await api.demoLogin();
    saveAuthSession(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bookmind_token');
    localStorage.removeItem('bookmind_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        login,
        register,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
