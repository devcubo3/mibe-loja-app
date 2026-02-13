'use client';

import { WifiOff } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-lg text-center">
      <Logo width={120} className="mb-xl" />

      <div className="w-20 h-20 bg-input-bg rounded-full flex items-center justify-center mb-lg">
        <WifiOff className="w-10 h-10 text-text-muted" />
      </div>

      <h1 className="text-title font-bold mb-sm">Você está offline</h1>
      <p className="text-body text-text-secondary mb-xl max-w-sm">
        Verifique sua conexão com a internet e tente novamente.
      </p>

      <Button onClick={() => window.location.reload()}>
        Tentar novamente
      </Button>
    </div>
  );
}
