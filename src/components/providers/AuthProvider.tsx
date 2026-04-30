'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, _hasHydrated, isAuthenticated } = useAuth();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      loadUser();
    }
  }, [_hasHydrated, isAuthenticated, loadUser]);

  return <>{children}</>;
}
