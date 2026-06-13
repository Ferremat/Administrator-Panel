'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from './api';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  email: string | null;
  role: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si el usuario está logueado al montar el componente
  useEffect(() => {
    const savedUsername = localStorage.getItem('adminUsername');
    const savedEmail = localStorage.getItem('adminEmail');
    const savedRole = localStorage.getItem('adminRole');
    const savedToken = localStorage.getItem('adminToken');

    if (savedUsername && savedEmail && savedToken && savedRole === 'admin') {
      setUsername(savedUsername);
      setEmail(savedEmail);
      setRole(savedRole);
      setIsLoggedIn(true);
    } else {
      // Si no es admin o no hay token, limpiar localStorage
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUserId');
    }
    setIsLoading(false);
  }, []);

  const login = async (inputEmail: string, inputPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const userData = await loginUser(inputEmail, inputPassword);
      console.log('DEBUG AUTH: userData returned from login:', userData);
      console.log('DEBUG AUTH: userData.roll =', userData.roll);

      // Verificar que el usuario sea administrador
      if (userData.roll !== 'admin') {
        console.log('DEBUG AUTH: User role is not admin, denying access');
        return {
          success: false,
          message: 'Acceso denegado. Solo administradores pueden acceder al panel.',
        };
      }
      console.log('DEBUG AUTH: User is admin, allowing access');

      setUsername(userData.username || userData.name);
      setEmail(userData.email);
      setRole(userData.roll);
      setIsLoggedIn(true);

      // Guardar en localStorage (sin contraseña)
      localStorage.setItem('adminUsername', userData.username || userData.name);
      localStorage.setItem('adminEmail', userData.email);
      localStorage.setItem('adminRole', userData.roll);
      localStorage.setItem('adminUserId', userData.id);
      if (userData.token) {
        localStorage.setItem('adminToken', userData.token);
      }
      localStorage.setItem('adminAuthTime', new Date().toISOString());

      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al conectar con el servidor',
      };
    }
  };

  const logout = () => {
    setUsername(null);
    setEmail(null);
    setRole(null);
    setIsLoggedIn(false);
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUserId');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthTime');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, email, role, isAdmin: role === 'admin', login, logout, isLoading }}>
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
