'use client';

import { set } from 'date-fns';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  email: string | null;
  role: string;
  jwtToken: string | null;
  isLoading: boolean; // Quan trọng: Để tránh nháy trang khi đang check token
  login: (email: string, role: string, jwt: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>('guest');
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedEmail = localStorage.getItem('email');
    if (savedToken && savedEmail) {
      setJwtToken(savedToken);
      setEmail(savedEmail);
      setRole(savedRole || 'guest');
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: string, jwt: string) => {
    setRole(role);
    setJwtToken(jwt);
    setIsLoggedIn(true);
    setEmail(email);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setEmail(null);
    setRole('guest');
    setJwtToken(null);

    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, email, role, jwtToken, isLoading, login, logout }}>
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
