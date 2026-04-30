'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, _hasHydrated } = useAuth();

  useEffect(() => {
    if (_hasHydrated) {
      loadUser();
    }
  }, [_hasHydrated, loadUser]);

  return <>{children}</>;
}
