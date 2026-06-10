'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  email: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL del backend (ms-client-gateway)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si el usuario está logueado al montar el componente
  useEffect(() => {
    const savedUsername = localStorage.getItem('adminUsername');
    const savedEmail = localStorage.getItem('adminEmail');
    const savedToken = localStorage.getItem('adminToken');

    if (savedUsername && savedEmail && savedToken) {
      setUsername(savedUsername);
      setEmail(savedEmail);
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (inputEmail: string, inputPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inputEmail,
          password: inputPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Email o contraseña incorrectos',
        };
      }

      const userData = await response.json();

      setUsername(userData.username || userData.name);
      setEmail(userData.email);
      setIsLoggedIn(true);

      // Guardar en localStorage (sin contraseña)
      localStorage.setItem('adminUsername', userData.username || userData.name);
      localStorage.setItem('adminEmail', userData.email);
      localStorage.setItem('adminUserId', userData.id);
      localStorage.setItem('adminAuthTime', new Date().toISOString());

      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        message: 'Error al conectar con el servidor',
      };
    }
  };

  const logout = () => {
    setUsername(null);
    setEmail(null);
    setIsLoggedIn(false);
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminUserId');
    localStorage.removeItem('adminAuthTime');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, email, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
