'use client';

import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {children}
      <InstallPrompt />
    </div>
  );
}
