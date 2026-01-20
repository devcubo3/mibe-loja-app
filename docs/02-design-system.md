# 02 - Design System

## Objetivo
Configurar cores, fontes, espaçamentos e estilos globais seguindo exatamente o padrão do app mobile.

---

## Passo 1: Configurar Google Fonts

Editar `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'MIBE Store',
  description: 'Painel da empresa MIBE',
  manifest: '/manifest.json',
  themeColor: '#181818',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

---

## Passo 2: Configurar Tailwind (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        // Cores principais
        primary: '#181818',
        secondary: '#666666',
        background: '#FFFFFF',

        // Cores de input/formulário
        'input-bg': '#F5F5F5',
        'input-border': '#E0E0E0',

        // Cores de texto
        'text-primary': '#181818',
        'text-secondary': '#666666',
        'text-muted': '#999999',

        // Cores semânticas
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',

        // Cores específicas
        star: '#FFB800',
        whatsapp: '#25D366',

        // Cores de fundo para ícones (com opacidade)
        'success-light': '#E8F5E9',
        'error-light': '#FFEBEE',
        'warning-light': '#FFF3E0',
      },
      fontSize: {
        caption: ['12px', { lineHeight: '16px' }],
        body: ['14px', { lineHeight: '20px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        subtitle: ['18px', { lineHeight: '28px' }],
        title: ['24px', { lineHeight: '32px' }],
        header: ['32px', { lineHeight: '40px' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      height: {
        input: '56px',
        'input-sm': '44px',
      },
      width: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Passo 3: Criar Constantes do Tema

Criar `src/constants/theme.ts`:

```typescript
export const COLORS = {
  // Cores principais
  primary: '#181818',
  secondary: '#666666',
  background: '#FFFFFF',

  // Cores de input/formulário
  inputBackground: '#F5F5F5',
  inputBorder: '#E0E0E0',

  // Cores de texto
  text: '#181818',
  textSecondary: '#666666',
  textMuted: '#999999',

  // Cores utilitárias
  white: '#FFFFFF',
  black: '#000000',

  // Cores semânticas
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',

  // Cores específicas
  star: '#FFB800',
  whatsapp: '#25D366',

  // Cores de fundo para ícones (com 15% opacidade)
  successLight: '#E8F5E9',
  errorLight: '#FFEBEE',
  warningLight: '#FFF3E0',
} as const;

export const FONTS = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;

export const SIZES = {
  // Spacing
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',

  // Font sizes
  caption: '12px',
  body: '14px',
  bodyLarge: '16px',
  subtitle: '18px',
  title: '24px',
  header: '32px',

  // Border radius
  radiusSm: '4px',
  radiusMd: '8px',
  radiusLg: '12px',
  radiusFull: '9999px',

  // Input height
  inputHeight: '56px',
  inputHeightSm: '44px',

  // Sidebar
  sidebarWidth: '280px',
} as const;

export type ColorKeys = keyof typeof COLORS;
export type FontKeys = keyof typeof FONTS;
export type SizeKeys = keyof typeof SIZES;
```

---

## Passo 4: Estilos Globais (globals.css)

Substituir o conteúdo de `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-input-border;
  }

  body {
    @apply font-sans text-text-primary bg-background;
  }

  /* Remove default focus outline and add custom */
  *:focus {
    @apply outline-none;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    @apply w-2;
  }

  ::-webkit-scrollbar-track {
    @apply bg-input-bg;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-secondary rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-primary;
  }
}

@layer components {
  /* ===== BOTÕES ===== */

  /* Botão Primário */
  .btn-primary {
    @apply h-input px-6 bg-primary text-white font-semibold text-body-lg rounded-sm
           hover:bg-[#2a2a2a] active:bg-[#333333]
           disabled:opacity-50 disabled:cursor-not-allowed
           transition-colors duration-200
           flex items-center justify-center gap-2;
  }

  /* Botão Secundário */
  .btn-secondary {
    @apply h-input px-6 bg-white text-primary font-semibold text-body-lg rounded-sm
           border border-primary
           hover:bg-input-bg active:bg-[#EBEBEB]
           disabled:opacity-50 disabled:cursor-not-allowed
           transition-colors duration-200
           flex items-center justify-center gap-2;
  }

  /* Botão Danger */
  .btn-danger {
    @apply h-input px-6 bg-white text-error font-semibold text-body-lg rounded-sm
           border border-error
           hover:bg-error-light active:bg-error active:text-white
           disabled:opacity-50 disabled:cursor-not-allowed
           transition-colors duration-200
           flex items-center justify-center gap-2;
  }

  /* Botão Ghost */
  .btn-ghost {
    @apply h-input px-6 bg-transparent text-primary font-semibold text-body-lg rounded-sm
           hover:bg-input-bg active:bg-[#EBEBEB]
           disabled:opacity-50 disabled:cursor-not-allowed
           transition-colors duration-200
           flex items-center justify-center gap-2;
  }

  /* Botão Tamanho Pequeno */
  .btn-sm {
    @apply h-input-sm px-4 text-body;
  }

  /* ===== INPUTS ===== */

  /* Input padrão */
  .input-default {
    @apply h-input w-full px-4 bg-input-bg border border-input-border rounded-sm
           text-body-lg text-text-primary placeholder:text-text-muted
           focus:border-primary focus:ring-0
           disabled:opacity-60 disabled:cursor-not-allowed
           transition-colors duration-200;
  }

  /* Input com erro */
  .input-error {
    @apply border-error focus:border-error;
  }

  /* Label padrão */
  .label-default {
    @apply text-caption font-medium text-text-secondary uppercase tracking-wider mb-2 block;
  }

  /* Mensagem de erro */
  .error-message {
    @apply text-caption text-error mt-1;
  }

  /* Helper text */
  .helper-text {
    @apply text-caption text-text-muted mt-1;
  }

  /* ===== CARDS ===== */

  /* Card padrão */
  .card-default {
    @apply bg-white border border-input-border rounded-md p-4;
  }

  /* Card com fundo */
  .card-filled {
    @apply bg-input-bg rounded-md p-4;
  }

  /* Card outlined */
  .card-outlined {
    @apply bg-transparent border border-input-border rounded-md p-4;
  }

  /* Card destaque (fundo preto) */
  .card-highlight {
    @apply bg-primary text-white rounded-md p-4;
  }

  /* ===== BADGES ===== */

  .badge {
    @apply inline-flex items-center px-2 py-1 text-caption font-medium rounded-sm;
  }

  .badge-dark {
    @apply badge bg-primary text-white;
  }

  .badge-success {
    @apply badge bg-success text-white;
  }

  .badge-error {
    @apply badge bg-error text-white;
  }

  .badge-warning {
    @apply badge bg-warning text-white;
  }

  .badge-light {
    @apply badge bg-input-bg text-text-secondary;
  }

  /* ===== TIPOGRAFIA ===== */

  .text-header {
    @apply text-header font-bold text-text-primary;
  }

  .text-title {
    @apply text-title font-bold text-text-primary;
  }

  .text-subtitle {
    @apply text-subtitle font-semibold text-text-primary;
  }

  .section-title {
    @apply text-subtitle font-bold text-text-primary;
  }

  /* ===== DIVIDERS ===== */

  .divider {
    @apply h-px bg-input-border w-full;
  }

  .divider-vertical {
    @apply w-px bg-input-border h-full;
  }

  /* ===== CONTAINERS ===== */

  .page-container {
    @apply p-lg;
  }

  .page-header {
    @apply mb-lg;
  }

  /* ===== SKELETON ===== */

  .skeleton {
    @apply animate-pulse bg-input-bg rounded;
  }

  /* ===== SIDEBAR ===== */

  .sidebar-item {
    @apply flex items-center gap-3 px-4 py-3 text-white/70 rounded-sm
           hover:bg-white/10 hover:text-white
           transition-colors duration-200;
  }

  .sidebar-item-active {
    @apply sidebar-item bg-white/15 text-white border-l-2 border-white;
  }

  .sidebar-item-highlight {
    @apply flex items-center gap-3 px-4 py-3 bg-white text-primary font-semibold rounded-sm
           hover:bg-white/90
           transition-colors duration-200;
  }

  /* ===== CHIPS/FILTERS ===== */

  .chip {
    @apply inline-flex items-center gap-1.5 px-3 py-2 text-body
           bg-input-bg border border-input-border rounded-sm
           cursor-pointer transition-colors duration-200
           hover:border-primary;
  }

  .chip-active {
    @apply chip bg-primary border-primary text-white;
  }
}

@layer utilities {
  /* Utilitário para esconder scrollbar mas manter funcionalidade */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Gradient para fade em listas */
  .fade-bottom {
    mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  }
}
```

---

## Passo 5: Criar Componente Logo

Criar `src/components/Logo.tsx`:

```tsx
interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Logo({
  width = 165,
  height,
  color = '#181818',
  className = '',
}: LogoProps) {
  // Calcula altura proporcional se não especificada
  const scale = width / 660;
  const scaledHeight = height || Math.round(102 * scale);

  return (
    <svg
      width={width}
      height={scaledHeight}
      viewBox="0 0 660 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 101.787C0.04 67.88 -0.013335 33.9867 0.0399984 0.0799967C10.7067 0.0399967 21.3867 0.2 32.0667 0C47.5467 24.9333 62.5733 50.16 77.88 75.2C93.12 50.1733 108.293 25.1199 123.52 0.0932617C134.267 0.0932617 145.013 0.0799284 155.76 0.0932617C155.773 33.9999 155.773 67.8933 155.76 101.8C148.107 101.8 140.467 101.8 132.813 101.8C132.8 76.96 132.827 52.12 132.8 27.2933C117.333 52.12 102.04 77.0533 86.5067 101.84C80.76 101.747 75.0267 101.827 69.28 101.787C53.8667 76.9333 38.4133 52.1066 22.9733 27.2799C22.9733 52.1199 22.9867 76.96 22.9733 101.8C15.32 101.787 7.65333 101.813 0 101.787Z"
        fill={color}
      />
      <path
        d="M238.347 0.093252C246 0.0799186 253.653 0.0799186 261.307 0.093252C261.32 33.9999 261.307 67.8933 261.307 101.8C253.653 101.8 246 101.8 238.347 101.8C238.347 67.8933 238.347 33.9999 238.347 0.093252Z"
        fill={color}
      />
      <path
        d="M344.36 0.0933108C374.72 0.119978 405.093 0.0266832 435.453 0.13335C444.8 0.17335 455.413 3.13331 460.467 11.68C466.64 22.72 465.053 37.7334 456.28 46.9867C471.84 55.0934 474.613 77.5334 464.667 90.9867C458.187 99.36 446.96 101.787 436.893 101.76C406.04 101.84 375.2 101.787 344.347 101.8C344.347 67.8934 344.347 34 344.36 0.0933108ZM367.32 17.3867C367.307 25.28 367.307 33.1734 367.32 41.0667C387.853 41.04 408.387 41.1333 428.933 41.0267C432.84 41 437.747 40.5867 439.747 36.64C441.747 32.24 441.627 26.9467 440.04 22.4667C438.253 18.0133 432.947 17.36 428.787 17.44C408.293 17.32 387.8 17.4134 367.32 17.3867ZM367.32 59.24C367.307 67.3734 367.307 75.4933 367.32 83.6267C389.613 83.6267 411.893 83.68 434.187 83.6C438.453 83.6 443.907 83.3334 446.04 78.9067C448 74.1467 448.067 68.3733 445.867 63.6933C443.68 59.4933 438.413 59.3067 434.293 59.28C411.973 59.1867 389.64 59.2534 367.32 59.24Z"
        fill={color}
      />
      <path
        d="M552.014 101.787C552.04 67.88 551.987 33.9867 552.04 0.0800781C587.867 0.106745 623.694 0.0800098 659.52 0.0933431C659.52 6.24001 659.534 12.4001 659.507 18.5601C631.334 18.5467 603.16 18.5467 574.987 18.5601C574.974 26.4401 574.96 34.3334 574.987 42.2267C603.16 42.2401 631.334 42.2401 659.507 42.2267C659.52 48.0401 659.52 53.8534 659.52 59.6667C631.334 59.6934 603.16 59.6534 574.974 59.6934C574.974 67.5734 574.96 75.4534 574.987 83.3334C603.16 83.3468 631.334 83.3468 659.52 83.3334C659.52 89.4801 659.507 95.6401 659.52 101.8C623.68 101.8 587.84 101.813 552.014 101.787Z"
        fill={color}
      />
    </svg>
  );
}

export default Logo;
```

---

## Verificação Visual

Criar uma página de teste para verificar o design system.

Criar `src/app/design-test/page.tsx`:

```tsx
import { Logo } from '@/components/Logo';

export default function DesignTestPage() {
  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="text-header mb-xl">Design System Test</h1>

      {/* Logo */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Logo</h2>
        <div className="flex items-center gap-lg">
          <Logo width={165} />
          <Logo width={100} color="#666666" />
          <div className="bg-primary p-4 rounded-md">
            <Logo width={120} color="#FFFFFF" />
          </div>
        </div>
      </section>

      {/* Cores */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Cores</h2>
        <div className="grid grid-cols-4 gap-md">
          <div className="text-center">
            <div className="w-full h-16 bg-primary rounded-md mb-2" />
            <span className="text-caption">Primary</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-secondary rounded-md mb-2" />
            <span className="text-caption">Secondary</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-success rounded-md mb-2" />
            <span className="text-caption">Success</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-error rounded-md mb-2" />
            <span className="text-caption">Error</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-warning rounded-md mb-2" />
            <span className="text-caption">Warning</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-input-bg border border-input-border rounded-md mb-2" />
            <span className="text-caption">Input BG</span>
          </div>
        </div>
      </section>

      {/* Tipografia */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Tipografia</h2>
        <div className="space-y-md">
          <p className="text-header">Header (32px Bold)</p>
          <p className="text-title">Title (24px Bold)</p>
          <p className="text-subtitle">Subtitle (18px Semibold)</p>
          <p className="text-body-lg">Body Large (16px)</p>
          <p className="text-body">Body (14px)</p>
          <p className="text-caption text-text-secondary">Caption (12px)</p>
        </div>
      </section>

      {/* Botões */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Botões</h2>
        <div className="flex flex-wrap gap-md">
          <button className="btn-primary">Primary</button>
          <button className="btn-secondary">Secondary</button>
          <button className="btn-danger">Danger</button>
          <button className="btn-ghost">Ghost</button>
          <button className="btn-primary" disabled>Disabled</button>
        </div>
        <div className="flex flex-wrap gap-md mt-md">
          <button className="btn-primary btn-sm">Small Primary</button>
          <button className="btn-secondary btn-sm">Small Secondary</button>
        </div>
      </section>

      {/* Inputs */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Inputs</h2>
        <div className="space-y-md max-w-md">
          <div>
            <label className="label-default">Email</label>
            <input type="email" className="input-default" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="label-default">Com erro</label>
            <input type="text" className="input-default input-error" placeholder="Texto" />
            <span className="error-message">Este campo é obrigatório</span>
          </div>
          <div>
            <label className="label-default">Desabilitado</label>
            <input type="text" className="input-default" placeholder="Texto" disabled />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Cards</h2>
        <div className="grid grid-cols-3 gap-md">
          <div className="card-default">
            <p className="font-semibold">Card Default</p>
            <p className="text-caption text-text-secondary">Com borda</p>
          </div>
          <div className="card-filled">
            <p className="font-semibold">Card Filled</p>
            <p className="text-caption text-text-secondary">Com fundo</p>
          </div>
          <div className="card-highlight">
            <p className="font-semibold">Card Highlight</p>
            <p className="text-caption text-white/70">Fundo preto</p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Badges</h2>
        <div className="flex flex-wrap gap-md">
          <span className="badge-dark">Dark</span>
          <span className="badge-success">Success</span>
          <span className="badge-error">Error</span>
          <span className="badge-warning">Warning</span>
          <span className="badge-light">Light</span>
        </div>
      </section>

      {/* Chips */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Chips/Filters</h2>
        <div className="flex flex-wrap gap-sm">
          <span className="chip">Todos</span>
          <span className="chip-active">Este mês</span>
          <span className="chip">Esta semana</span>
          <span className="chip">Hoje</span>
        </div>
      </section>
    </div>
  );
}
```

---

## Checklist

- [ ] Google Fonts configurado (Plus Jakarta Sans)
- [ ] Tailwind configurado com cores customizadas
- [ ] Arquivo theme.ts criado com constantes
- [ ] globals.css com classes utilitárias
- [ ] Componente Logo criado
- [ ] Página de teste do design system funcionando

---

## Próximo Passo

Seguir para [03-components.md](./03-components.md) para criar os componentes UI reutilizáveis.
