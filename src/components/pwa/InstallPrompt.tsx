'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Logo } from '@/components/Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS (Safari doesn't support beforeinstallprompt)
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // For iOS, show custom prompt after a delay
    if (isIOSDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // For Chrome/Edge/etc, listen for the native install event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 animate-slide-up">
      <Card variant="default" padding="md" className="shadow-lg border-primary/30 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-md pr-6">
          <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
            <Logo width={32} color="#FFFFFF" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-body-lg mb-xs">Instalar MIBE Store</p>
            <p className="text-caption text-text-secondary mb-md">
              Adicione à tela inicial para acesso rápido, como um app nativo.
            </p>

            {isIOS ? (
              <div className="flex items-center gap-2 text-caption text-text-secondary bg-input-bg rounded-sm p-sm">
                <Share className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>
                  Toque em <strong>Compartilhar</strong> e depois em{' '}
                  <strong>&quot;Adicionar à Tela Inicial&quot;</strong>
                </span>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleInstall}
                icon={<Download className="w-4 h-4" />}
              >
                Instalar
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
