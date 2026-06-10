'use client';

import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/lib/protected-route';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // No proteger la página de login
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Proteger todas las demás rutas
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
