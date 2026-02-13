'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OnboardingModal } from '@/components/onboarding';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { company, user, token, isLoading, isAuthenticated, logout, updateUser, _hasHydrated } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Só redireciona após a hydration do Zustand e após carregar o estado
    if (_hasHydrated && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isLoading, isAuthenticated, router]);

  // Mostrar onboarding se não foi concluído
  useEffect(() => {
    if (_hasHydrated && !isLoading && isAuthenticated && user && !user.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [_hasHydrated, isLoading, isAuthenticated, user]);

  // Loading state - espera hydration e carregamento
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-md w-full max-w-md p-lg">
          <Skeleton className="h-12 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  // Não renderizar se não autenticado
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        storeName={company?.business_name || 'Minha Loja'}
        notificationCount={unreadCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:ml-sidebar">
        {/* Header (Mobile) */}
        <Header
          notificationCount={unreadCount}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="pb-24 lg:pb-0">{children}</main>

        {/* Bottom Navigation (Mobile) */}
        <MobileNav onMoreClick={() => setSidebarOpen(true)} />
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Onboarding */}
      <OnboardingModal
        isOpen={showOnboarding}
        userName={user?.name || ''}
        onComplete={async () => {
          setShowOnboarding(false);
          updateUser({ onboarding_completed: true });
          try {
            await fetch('/api/auth/onboarding', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {}
        }}
        onSkip={() => {
          setShowOnboarding(false);
          // Pular não marca como concluído — vai aparecer de novo no próximo login
        }}
      />
    </div>
  );
}
