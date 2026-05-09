'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

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

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = Number(payload?.exp);

  if (!exp || Number.isNaN(exp)) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowInSeconds;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>('guest');
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setEmail(null);
    setRole('guest');
    setJwtToken(null);

    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedEmail = localStorage.getItem('email');

    if (savedToken && savedEmail && !isTokenExpired(savedToken)) {
      setJwtToken(savedToken);
      setEmail(savedEmail);
      setRole(savedRole || 'guest');
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      setJwtToken(null);
      setEmail(null);
      setRole('guest');
      setIsLoggedIn(false);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!jwtToken) {
      return;
    }

    if (isTokenExpired(jwtToken)) {
      logout();
      return;
    }

    const payload = decodeJwtPayload(jwtToken);
    const exp = Number(payload?.exp);
    if (!exp || Number.isNaN(exp)) {
      logout();
      return;
    }

    const expiresAtMs = exp * 1000;
    const timeoutMs = Math.max(expiresAtMs - Date.now(), 0);
    const timeoutId = window.setTimeout(() => {
      logout();
    }, timeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [jwtToken, logout]);

  const login = (email: string, role: string, jwt: string) => {
    setRole(role);
    setJwtToken(jwt);
    setIsLoggedIn(true);
    setEmail(email);

    localStorage.setItem('token', jwt);
    localStorage.setItem('role', role);
    localStorage.setItem('email', email);
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
