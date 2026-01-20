# 12 - Progressive Web App (PWA)

## Objetivo
Configurar o aplicativo como PWA para permitir instalação no dispositivo e funcionamento offline básico.

---

## Passo 1: Configurar next-pwa

Atualizar `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semana
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:json|xml|csv)$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'static-data-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: ({ url }) => {
        const isSameOrigin = self.origin === url.origin;
        if (!isSameOrigin) return false;
        const pathname = url.pathname;
        // Exclude API routes
        if (pathname.startsWith('/api/')) return false;
        return true;
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
  },
};

module.exports = withPWA(nextConfig);
```

---

## Passo 2: Criar Manifest

Criar `public/manifest.json`:

```json
{
  "name": "MIBE Store",
  "short_name": "MIBE Store",
  "description": "Painel da empresa MIBE - Gerencie vendas e cashback",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#181818",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "MIBE Store Dashboard"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "MIBE Store Mobile"
    }
  ],
  "categories": ["business", "finance"],
  "shortcuts": [
    {
      "name": "Registrar Venda",
      "short_name": "Nova Venda",
      "description": "Registrar uma nova venda",
      "url": "/registrar-venda",
      "icons": [
        {
          "src": "/icons/shortcut-sale.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Histórico",
      "short_name": "Vendas",
      "description": "Ver histórico de vendas",
      "url": "/vendas",
      "icons": [
        {
          "src": "/icons/shortcut-history.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

---

## Passo 3: Atualizar Head com Meta Tags PWA

Atualizar `src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'MIBE Store',
  description: 'Painel da empresa MIBE - Gerencie vendas e cashback',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MIBE Store',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'MIBE Store',
    title: 'MIBE Store - Painel da Empresa',
    description: 'Gerencie vendas e cashback da sua loja',
  },
  twitter: {
    card: 'summary',
    title: 'MIBE Store',
    description: 'Painel da empresa MIBE',
  },
};

export const viewport: Viewport = {
  themeColor: '#181818',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Splash Screens iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-2048-2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1668-2388.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1536-2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1125-2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1242-2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-750-1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-640-1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
      </head>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

## Passo 4: Criar Ícones PWA

Você precisará criar os seguintes ícones na pasta `public/icons/`:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `shortcut-sale.png` (96x96)
- `shortcut-history.png` (96x96)

**Sugestão de design dos ícones:**
- Fundo: #181818 (preto)
- Logo MIBE em branco centralizada
- Formato quadrado com cantos levemente arredondados

Você pode usar ferramentas como:
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon.io](https://favicon.io/)

---

## Passo 5: Criar Componente de Instalação PWA

Criar `src/components/pwa/InstallPrompt.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
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

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verificar se o prompt já foi dispensado
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Não mostrar por 7 dias após dispensar
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

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
    <div className="fixed bottom-24 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-50 animate-in slide-in-from-bottom">
      <Card variant="default" padding="md" className="shadow-lg border-primary">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-text-muted hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-md">
          <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
            <Logo width={32} color="#FFFFFF" />
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-xs">Instalar MIBE Store</p>
            <p className="text-caption text-text-secondary mb-md">
              Adicione à tela inicial para acesso rápido
            </p>
            <Button
              size="sm"
              onClick={handleInstall}
              icon={<Download className="w-4 h-4" />}
            >
              Instalar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

---

## Passo 6: Adicionar InstallPrompt ao Layout

Atualizar `src/app/(dashboard)/layout.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { store, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-md w-full max-w-md p-lg">
          <Skeleton className="h-12 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        storeName={store?.name || 'Minha Loja'}
        notificationCount={unreadCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="lg:ml-sidebar">
        <Header
          notificationCount={unreadCount}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="pb-24 lg:pb-0">{children}</main>

        <MobileNav onMoreClick={() => setSidebarOpen(true)} />
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
```

---

## Passo 7: Criar Página Offline

Criar `src/app/offline/page.tsx`:

```tsx
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
```

---

## Passo 8: Exportar Componentes PWA

Criar `src/components/pwa/index.ts`:

```typescript
export { InstallPrompt } from './InstallPrompt';
```

---

## Passo 9: Testar PWA

1. **Build de produção:**
   ```bash
   npm run build
   npm run start
   ```

2. **Verificar no Chrome DevTools:**
   - Abrir DevTools (F12)
   - Ir para Application > Manifest
   - Verificar se todas as informações estão corretas
   - Ir para Application > Service Workers
   - Verificar se o SW está ativo

3. **Testar instalação:**
   - No desktop: ícone de instalação na barra de endereços
   - No mobile: banner de instalação ou "Adicionar à tela inicial"

4. **Lighthouse:**
   - Abrir DevTools > Lighthouse
   - Selecionar "Progressive Web App"
   - Rodar auditoria
   - Corrigir problemas apontados

---

## Checklist Final

- [ ] next-pwa configurado
- [ ] manifest.json criado
- [ ] Meta tags PWA no layout
- [ ] Ícones em todos os tamanhos
- [ ] Service Worker funcionando
- [ ] Componente InstallPrompt criado
- [ ] Página offline criada
- [ ] Build de produção testado
- [ ] Lighthouse PWA score > 90

---

## Resumo do Projeto Completo

Com a conclusão desta etapa, o projeto MIBE Store Web App está completo com:

1. **Setup completo** com Next.js 14, TypeScript, Tailwind CSS
2. **Design System** consistente com o app mobile
3. **Componentes UI** reutilizáveis
4. **Layout responsivo** com sidebar, header e mobile nav
5. **Autenticação** com Supabase
6. **Dashboard** com métricas e vendas recentes
7. **Registro de venda** com QR Code e CPF
8. **Histórico de vendas** com filtros
9. **Lista de clientes** (somente leitura)
10. **Página da empresa** com configurações
11. **Central de notificações** em tempo real
12. **PWA** instalável e offline-first

---

**Parabéns! O projeto está pronto para produção.**
