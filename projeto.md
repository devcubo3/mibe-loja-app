# PROMPT COMPLETO - MIBE STORE WEB APP (Aplicativo da Loja/Empresa)

## 🎯 VISÃO GERAL DO PROJETO

Você vai criar um **aplicativo web responsivo (PWA)** para **empresas/lojas parceiras** do sistema MIBE de cashback. Este aplicativo é o **painel da empresa** onde ela gerencia suas vendas, clientes e visualiza métricas.

O projeto deve seguir **EXATAMENTE** o mesmo design system, padrões visuais, tipografia, cores e componentes do aplicativo mobile do cliente (React Native) que já existe. O objetivo é manter consistência visual total entre as plataformas.

---

## 📱 CONTEXTO DO SISTEMA MIBE

O MIBE é um sistema de **cashback** onde:
- **Clientes** usam o app mobile para acumular e resgatar cashback
- **Empresas/Lojas** usam o app web (este que você vai criar) para:
  - Registrar vendas (ler QR code ou digitar CPF)
  - Ver dados do cliente (somente leitura)
  - Confirmar vendas
  - Ver histórico de vendas
  - Ver histórico de clientes
  - Ver métricas e resumos
  - Gerenciar notificações
  - Ver dados da empresa

---

## 🛠️ STACK TECNOLÓGICA

```
Framework: Next.js 14+ (App Router)
Linguagem: TypeScript
Estilização: Tailwind CSS (seguindo exatamente as cores do design system)
Ícones: Lucide React (equivalente ao Ionicons do React Native)
Fonte: Plus Jakarta Sans (Google Fonts) - MESMA do app mobile
Estado: React Context ou Zustand
Validação: Zod + React Hook Form
PWA: next-pwa
```

---

## 🎨 DESIGN SYSTEM COMPLETO

### CORES (OBRIGATÓRIO - usar exatamente estas)

```typescript
// constants/theme.ts
export const COLORS = {
  // Cores principais
  primary: '#181818',           // Preto - cor principal da marca
  secondary: '#666666',         // Cinza médio
  background: '#FFFFFF',        // Branco - fundo principal

  // Cores de input/formulário
  inputBackground: '#F5F5F5',   // Cinza claro - fundo de inputs
  inputBorder: '#E0E0E0',       // Cinza muito claro - bordas

  // Cores de texto
  text: '#181818',              // Preto - texto principal
  textSecondary: '#666666',     // Cinza - texto secundário
  textMuted: '#999999',         // Cinza claro - texto muito suave

  // Cores utilitárias
  white: '#FFFFFF',
  black: '#000000',

  // Cores semânticas
  error: '#FF3B30',             // Vermelho - erros e despesas
  success: '#34C759',           // Verde - sucesso e ganhos
  warning: '#FF9500',           // Laranja - avisos

  // Cores específicas
  star: '#FFB800',              // Amarelo ouro - avaliações
  whatsapp: '#25D366',          // Verde WhatsApp

  // Cores de fundo para ícones (com 15% opacidade)
  successLight: '#E8F5E9',      // Verde claro
  errorLight: '#FFEBEE',        // Vermelho claro
  warningLight: '#FFF3E0',      // Laranja claro
} as const;
```

### TIPOGRAFIA (OBRIGATÓRIO - usar Plus Jakarta Sans)

```typescript
// Fonte: Plus Jakarta Sans do Google Fonts
// https://fonts.google.com/specimen/Plus+Jakarta+Sans

export const FONTS = {
  regular: 'Plus Jakarta Sans, sans-serif',    // font-weight: 400
  medium: 'Plus Jakarta Sans, sans-serif',     // font-weight: 500
  semiBold: 'Plus Jakarta Sans, sans-serif',   // font-weight: 600
  bold: 'Plus Jakarta Sans, sans-serif',       // font-weight: 700
} as const;

// Configuração Tailwind
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
};
```

### TAMANHOS E ESPAÇAMENTOS

```typescript
export const SIZES = {
  // Spacing (usar como base para padding/margin)
  xs: '4px',    // 0.25rem
  sm: '8px',    // 0.5rem
  md: '16px',   // 1rem
  lg: '24px',   // 1.5rem
  xl: '32px',   // 2rem
  xxl: '48px',  // 3rem

  // Font sizes
  caption: '12px',      // 0.75rem - textos pequenos, labels
  body: '14px',         // 0.875rem - texto padrão
  bodyLarge: '16px',    // 1rem - texto grande
  subtitle: '18px',     // 1.125rem - subtítulos
  title: '24px',        // 1.5rem - títulos
  header: '32px',       // 2rem - títulos grandes

  // Border radius
  radiusSm: '4px',      // 0.25rem - pequeno
  radiusMd: '8px',      // 0.5rem - médio
  radiusLg: '12px',     // 0.75rem - grande
  radiusFull: '9999px', // totalmente redondo

  // Input height
  inputHeight: '56px',  // altura padrão de inputs
} as const;
```

### CLASSES TAILWIND CUSTOMIZADAS

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans text-[#181818] bg-white;
  }
}

@layer components {
  /* Botão Primário */
  .btn-primary {
    @apply h-14 px-6 bg-[#181818] text-white font-semibold text-base rounded
           hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed
           transition-colors duration-200 flex items-center justify-center;
  }

  /* Botão Secundário */
  .btn-secondary {
    @apply h-14 px-6 bg-white text-[#181818] font-semibold text-base rounded
           border border-[#181818] hover:bg-[#F5F5F5] disabled:opacity-50
           transition-colors duration-200 flex items-center justify-center;
  }

  /* Input padrão */
  .input-default {
    @apply h-14 w-full px-4 bg-[#F5F5F5] border border-[#E0E0E0] rounded
           text-base text-[#181818] placeholder:text-[#999999]
           focus:border-[#181818] focus:outline-none transition-colors;
  }

  /* Label padrão */
  .label-default {
    @apply text-xs font-medium text-[#666666] uppercase tracking-wider mb-2;
  }

  /* Card padrão */
  .card-default {
    @apply bg-white border border-[#E0E0E0] rounded-lg p-4;
  }

  /* Card com fundo */
  .card-filled {
    @apply bg-[#F5F5F5] rounded-lg p-4;
  }

  /* Título de seção */
  .section-title {
    @apply text-lg font-bold text-[#181818];
  }

  /* Badge */
  .badge-dark {
    @apply inline-flex items-center px-2 py-1 bg-[#181818] text-white
           text-xs font-medium rounded;
  }

  /* Badge sucesso */
  .badge-success {
    @apply inline-flex items-center px-2 py-1 bg-[#34C759] text-white
           text-xs font-medium rounded;
  }

  /* Badge erro */
  .badge-error {
    @apply inline-flex items-center px-2 py-1 bg-[#FF3B30] text-white
           text-xs font-medium rounded;
  }
}
```

---

## 🖼️ LOGO DA MARCA MIBE

A logo MIBE é um SVG vetorial. Use este componente:

```tsx
// components/Logo.tsx
interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Logo({
  width = 165,
  height = 26,
  color = '#181818',
  className = ''
}: LogoProps) {
  const scale = width / 660;
  const scaledHeight = 102 * scale;

  return (
    <svg
      width={width}
      height={height || scaledHeight}
      viewBox="0 0 660 102"
      fill="none"
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
```

---

## 📐 ESTRUTURA DO PROJETO

```
mibe-store-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout com sidebar
│   │   ├── page.tsx                # Home/Dashboard
│   │   ├── registrar-venda/
│   │   │   └── page.tsx            # Registrar nova venda
│   │   ├── vendas/
│   │   │   ├── page.tsx            # Histórico de vendas
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detalhes da venda
│   │   ├── clientes/
│   │   │   ├── page.tsx            # Lista de clientes
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detalhes do cliente (somente leitura)
│   │   ├── empresa/
│   │   │   └── page.tsx            # Dados da empresa
│   │   └── notificacoes/
│   │       └── page.tsx            # Central de notificações
│   ├── layout.tsx
│   ├── globals.css
│   └── manifest.json               # PWA manifest
├── components/
│   ├── ui/                         # Componentes base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── Avatar.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx             # Menu lateral
│   │   ├── Header.tsx              # Cabeçalho
│   │   └── MobileNav.tsx           # Navegação mobile
│   ├── dashboard/
│   │   ├── StatCard.tsx            # Card de estatística
│   │   ├── RecentSales.tsx         # Vendas recentes
│   │   └── QuickActions.tsx        # Ações rápidas
│   ├── sales/
│   │   ├── SaleCard.tsx            # Card de venda
│   │   ├── SalesList.tsx           # Lista de vendas
│   │   └── SaleDetail.tsx          # Detalhes da venda
│   ├── customers/
│   │   ├── CustomerCard.tsx        # Card de cliente
│   │   ├── CustomersList.tsx       # Lista de clientes
│   │   └── CustomerDetail.tsx      # Detalhes do cliente
│   ├── register-sale/
│   │   ├── QRScanner.tsx           # Scanner de QR Code
│   │   ├── CPFInput.tsx            # Input de CPF
│   │   ├── CustomerPreview.tsx     # Preview dos dados do cliente
│   │   ├── SaleForm.tsx            # Formulário de venda
│   │   └── SaleConfirmation.tsx    # Confirmação da venda
│   └── Logo.tsx
├── constants/
│   └── theme.ts                    # Cores, fontes, tamanhos
├── lib/
│   ├── utils.ts                    # Utilitários
│   └── formatters.ts               # Formatadores (CPF, moeda, data)
├── hooks/
│   ├── useAuth.ts
│   ├── useSales.ts
│   ├── useCustomers.ts
│   └── useNotifications.ts
├── types/
│   ├── auth.ts
│   ├── sale.ts
│   ├── customer.ts
│   └── notification.ts
├── public/
│   ├── icons/                      # Ícones PWA
│   └── images/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 📄 TELAS DETALHADAS

### 1. TELA DE LOGIN

**Rota:** `/login`

**Layout:**
- Fundo branco
- Logo MIBE centralizada no topo
- Título "Área da Empresa"
- Subtítulo "Entre com sua conta para acessar o painel"
- Formulário com:
  - Input de e-mail
  - Input de senha (com toggle de visibilidade)
  - Link "Esqueci minha senha"
  - Botão "Entrar" (primário, largura total)
- Rodapé: "Versão 1.0.0"

**Código de referência do app mobile (LoginScreen):**
```tsx
// O header tem:
<Logo width={140} height={22} />
<Text style={styles.title}>Bem vindo!</Text>
<Text style={styles.subtitle}>
  Entre com a sua conta para gerenciar seus pontos.
</Text>

// Adaptar para:
<Logo width={140} height={22} />
<h1>Área da Empresa</h1>
<p>Entre com sua conta para acessar o painel</p>

// Estilos do mobile para referência:
title: {
  fontFamily: FONTS.bold,        // font-bold
  fontSize: SIZES.header,         // text-[32px]
  color: COLORS.text,             // text-[#181818]
  marginTop: SIZES.xl,            // mt-8
  marginBottom: SIZES.sm,         // mb-2
}

subtitle: {
  fontFamily: FONTS.regular,      // font-normal
  fontSize: SIZES.bodyLarge,      // text-base
  color: COLORS.textSecondary,    // text-[#666666]
  lineHeight: 24,                 // leading-6
}
```

---

### 2. LAYOUT DO DASHBOARD (Sidebar + Header)

**Estrutura geral para todas as páginas autenticadas:**

**Sidebar (Desktop - largura fixa 280px):**
```
┌─────────────────────────────┐
│  [Logo MIBE branca]         │
│  [Nome da Empresa]          │
│                             │
│  ─────────────────────────  │
│                             │
│  🏠 Home                    │
│  📝 Registrar Venda  ←FAB   │
│  📋 Histórico de Vendas     │
│  👥 Clientes                │
│  🏢 Empresa                 │
│  🔔 Notificações (badge)    │
│                             │
│                             │
│  ─────────────────────────  │
│                             │
│  ⚙️ Configurações           │
│  🚪 Sair                    │
│                             │
└─────────────────────────────┘
```

**Header (Mobile):**
```
┌─────────────────────────────────────────────┐
│  ☰  [Logo MIBE]           🔔(badge)  👤     │
└─────────────────────────────────────────────┘
```

**Sidebar - Implementação:**
```tsx
// components/layout/Sidebar.tsx
const menuItems = [
  {
    label: 'Home',
    href: '/',
    icon: 'Home',  // Lucide icon
  },
  {
    label: 'Registrar Venda',
    href: '/registrar-venda',
    icon: 'PlusCircle',
    highlight: true,  // Destacado como ação principal
  },
  {
    label: 'Histórico de Vendas',
    href: '/vendas',
    icon: 'Receipt',
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: 'Users',
  },
  {
    label: 'Empresa',
    href: '/empresa',
    icon: 'Building2',
  },
  {
    label: 'Notificações',
    href: '/notificacoes',
    icon: 'Bell',
    badge: 3,  // Número de notificações não lidas
  },
];

// Estilos:
// - Fundo: #181818 (preto)
// - Logo: branca
// - Items: texto branco, hover com fundo rgba(255,255,255,0.1)
// - Item ativo: fundo rgba(255,255,255,0.15), borda esquerda branca
// - "Registrar Venda" destacado com fundo branco e texto preto
```

---

### 3. HOME / DASHBOARD

**Rota:** `/` (após login)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Bom dia, [Nome da Empresa]!                                │
│  Aqui está o resumo do seu dia                              │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Vendas Hoje │ │ Receita Hoje│ │ Cashback    │           │
│  │    12       │ │ R$ 2.450,00 │ │ R$ 122,50   │           │
│  │  ↑ 20%      │ │  ↑ 15%      │ │ Distribuído │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 REGISTRAR NOVA VENDA                  │  │
│  │      [Ícone QR Code grande] ou [Digite o CPF]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Últimas vendas                              Ver todas →    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 João Silva • 14:32 • R$ 150,00 • +R$ 7,50        │  │
│  │ 👤 Maria Santos • 13:45 • R$ 89,00 • +R$ 4,45       │  │
│  │ 👤 Pedro Costa • 11:20 • R$ 320,00 • +R$ 16,00      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**

**StatCard (Card de estatística):**
```tsx
// Referência do WalletScreen mobile
// totalBalanceCard styles:
{
  backgroundColor: COLORS.primary,  // #181818
  padding: SIZES.xl,                // p-8
  borderRadius: SIZES.radiusMd,     // rounded-lg
  alignItems: 'center',
}

// Adaptar para cards menores no dashboard web
// Usar grid de 3 colunas no desktop, 1 coluna no mobile
```

**QuickActionCard (Registrar Venda):**
```tsx
// Card grande com fundo preto (#181818)
// Ícone de QR Code grande (64px) em branco
// Texto "Registrar Nova Venda" em branco
// Subtexto "Escaneie o QR Code ou digite o CPF"
// Ao clicar, navega para /registrar-venda
```

**RecentSaleItem:**
```tsx
// Referência do ActivityItem mobile
// Estrutura:
{
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,              // p-4
    borderRadius: SIZES.radiusMd,   // rounded-lg
    marginBottom: SIZES.sm,         // mb-2
    borderWidth: 1,
    borderColor: COLORS.inputBorder, // border-[#E0E0E0]
  }
}

// Layout:
// [Avatar com inicial] | Nome • Horário • Valor • Cashback | [Chevron]
```

---

### 4. REGISTRAR VENDA

**Rota:** `/registrar-venda`

Esta é a **tela mais importante** do aplicativo. Fluxo:

**Etapa 1 - Identificar Cliente:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                    Registrar Venda                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                        │ │
│  │              📷 ÁREA DO SCANNER QR CODE               │ │
│  │                                                        │ │
│  │         Aponte a câmera para o QR Code do cliente     │ │
│  │                                                        │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                         ─── ou ───                          │
│                                                             │
│  CPF DO CLIENTE                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 000.000.000-00                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    BUSCAR CLIENTE                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Etapa 2 - Dados do Cliente (SOMENTE LEITURA):**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                    Registrar Venda                │
│                                                             │
│  ✅ Cliente encontrado                                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👤                                                    │ │
│  │                                                        │ │
│  │  Nome                                                  │ │
│  │  João Silva Santos                                     │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  CPF                                                   │ │
│  │  123.456.789-00                                        │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Data de Nascimento                                    │ │
│  │  15/03/1990                                            │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Saldo Disponível na sua loja                         │ │
│  │  R$ 45,00                        [Usar Saldo]          │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ⚠️ Você pode apenas visualizar os dados do cliente.       │
│     Nenhuma alteração é permitida.                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Etapa 3 - Registrar Valor da Venda:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                    Registrar Venda                │
│                                                             │
│  Cliente: João Silva Santos                                 │
│  CPF: 123.456.789-00                                        │
│                                                             │
│  VALOR DA COMPRA                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ R$ 0,00                                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ☐ Usar saldo do cliente: R$ 45,00                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Resumo                                                     │
│  Valor da compra:                          R$ 150,00        │
│  Saldo utilizado:                         - R$ 45,00        │
│  ─────────────────────────────────────────────────────────  │
│  Valor a pagar:                            R$ 105,00        │
│  Cashback gerado (5%):                    + R$ 5,25         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   CONFIRMAR VENDA                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Etapa 4 - Confirmação:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ✅                                 │
│                                                             │
│                   Venda registrada!                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cliente: João Silva Santos                           │ │
│  │  Valor: R$ 150,00                                     │ │
│  │  Saldo usado: R$ 45,00                                │ │
│  │  Valor pago: R$ 105,00                                │ │
│  │  Cashback gerado: R$ 5,25                             │ │
│  │  Data: 15/01/2026 às 14:32                            │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   NOVA VENDA                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               VOLTAR PARA O INÍCIO                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Referência de estilo do QRCodeScreen mobile:**
```tsx
// qrCard styles:
{
  backgroundColor: COLORS.white,
  borderRadius: SIZES.radiusMd,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: COLORS.inputBorder,
}

// cardHeader (parte preta no topo):
{
  backgroundColor: COLORS.primary,
  padding: SIZES.lg,
  alignItems: 'center',
}

// infoRow (linha de informação):
{
  paddingVertical: SIZES.sm,
}

// infoLabel:
{
  fontFamily: FONTS.regular,
  fontSize: SIZES.caption,
  color: COLORS.textSecondary,
  marginBottom: 4,
}

// infoValue:
{
  fontFamily: FONTS.semiBold,
  fontSize: SIZES.bodyLarge,
  color: COLORS.text,
}

// divider:
{
  height: 1,
  backgroundColor: COLORS.inputBorder,
}
```

---

### 5. HISTÓRICO DE VENDAS

**Rota:** `/vendas`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Histórico de Vendas                                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar por cliente ou CPF...                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Filtros:  [Todos ▼]  [Este mês ▼]  [Ordenar por ▼]        │
│                                                             │
│  Mostrando 127 vendas                        Total: R$ 15k  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 João Silva Santos                      15/01/2026  │ │
│  │    CPF: 123.456.789-00                      14:32     │ │
│  │    ─────────────────────────────────────────────────  │ │
│  │    Valor: R$ 150,00                                   │ │
│  │    Saldo usado: R$ 45,00    Pago: R$ 105,00           │ │
│  │    Cashback: +R$ 5,25                          →      │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Maria Santos                           15/01/2026  │ │
│  │    ...                                                │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Carregar mais]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Filtros:**
- Tipo: Todos | Com cashback | Com resgate
- Período: Hoje | Esta semana | Este mês | Personalizado
- Ordenar: Mais recentes | Maior valor | Menor valor

**Referência de estilo do SearchResultsScreen mobile:**
```tsx
// Filtros em chips horizontais:
categoryChip: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: SIZES.md,
  paddingVertical: SIZES.sm,
  borderRadius: SIZES.radiusSm,
  backgroundColor: COLORS.inputBackground,
  borderWidth: 1,
  borderColor: COLORS.inputBorder,
}

categoryChipActive: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.primary,
}

// Modal de ordenação (bottom sheet no mobile, dropdown no web):
// Usar o mesmo padrão visual do mobile
```

---

### 6. DETALHES DA VENDA

**Rota:** `/vendas/[id]`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                    Detalhes da Venda              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   VENDA #12345                        │ │
│  │              15/01/2026 às 14:32                      │ │
│  │                                                        │ │
│  │                   ✅ Confirmada                        │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Cliente                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👤 João Silva Santos                                 │ │
│  │     CPF: 123.456.789-00                               │ │
│  │                               [Ver perfil →]          │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Detalhes da transação                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Valor da compra              R$ 150,00               │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Saldo utilizado             - R$ 45,00               │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Valor pago pelo cliente      R$ 105,00               │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Cashback gerado (5%)        + R$ 5,25                │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. LISTA DE CLIENTES

**Rota:** `/clientes`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Clientes                                                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar por nome ou CPF...                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Ordenar:  [Mais recentes ▼]                                │
│                                                             │
│  127 clientes                                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 João Silva Santos                                  │ │
│  │    CPF: 123.456.789-00                                │ │
│  │    12 compras • Última: 15/01/2026                    │ │
│  │    ─────────────────────────────────────────────────  │ │
│  │    Saldo: R$ 45,00                              →     │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Maria Santos                                       │ │
│  │    ...                                                │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. DETALHES DO CLIENTE (SOMENTE LEITURA)

**Rota:** `/clientes/[id]`

**IMPORTANTE:** Esta tela é **100% somente leitura**. A loja **NÃO PODE** editar nenhum dado do cliente.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                    Perfil do Cliente              │
│                                                             │
│  ⚠️ Visualização apenas - Dados não editáveis              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                       👤                              │ │
│  │                                                        │ │
│  │  Nome                                                  │ │
│  │  João Silva Santos                             🔒      │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  CPF                                                   │ │
│  │  123.456.789-00                                🔒      │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Data de Nascimento                                    │ │
│  │  15/03/1990                                    🔒      │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Resumo com sua loja                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Total de compras              12                     │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Total gasto                   R$ 1.850,00            │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Cashback recebido             R$ 92,50               │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Saldo atual                   R$ 45,00               │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Última compra                 15/01/2026             │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Histórico de compras                        Ver todas →    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 15/01/2026 • R$ 150,00 • +R$ 5,25                    │ │
│  │ 10/01/2026 • R$ 89,00 • +R$ 4,45                     │ │
│  │ 05/01/2026 • R$ 200,00 • -R$ 45,00 (resgate)         │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Referência de estilo do AccountScreen mobile (campos desabilitados):**
```tsx
// disabledInputContainer:
{
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: COLORS.inputBackground,
  paddingVertical: SIZES.sm,
  paddingHorizontal: SIZES.md,
  borderRadius: SIZES.radiusSm,
  borderWidth: 1,
  borderColor: COLORS.inputBorder,
  opacity: 0.6,  // Indicar que é somente leitura
}

// Ícone de cadeado:
<Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />

// helperText:
{
  fontFamily: FONTS.regular,
  fontSize: SIZES.caption,
  color: COLORS.textMuted,
  marginTop: SIZES.xs,
}
```

---

### 9. DADOS DA EMPRESA

**Rota:** `/empresa`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Minha Empresa                                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    [Logo da empresa]                  │ │
│  │                    📷 Alterar logo                    │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Dados da empresa                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Nome fantasia                                         │ │
│  │  Restaurante Sabor & Arte                              │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  CNPJ                                          🔒      │ │
│  │  12.345.678/0001-00                                    │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  E-mail                                                │ │
│  │  contato@saborarte.com.br                              │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Telefone                                              │ │
│  │  (11) 98765-4321                                       │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Endereço                                              │ │
│  │  Rua das Flores, 123 - Centro, São Paulo - SP          │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Configurações de Cashback                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Porcentagem de cashback                               │ │
│  │  5%                                                    │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Validade do saldo (dias)                              │ │
│  │  90 dias                                               │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Compra mínima para cashback                           │ │
│  │  R$ 20,00                                              │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               EDITAR INFORMAÇÕES                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Suporte                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  💬 Falar com o suporte pelo WhatsApp            →    │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               🚪 SAIR DA CONTA                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Versão 1.0.0                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Referência do AccountScreen mobile (estilos de seção):**
```tsx
// section:
{
  paddingHorizontal: SIZES.lg,
  paddingTop: SIZES.xl,
}

// sectionTitle:
{
  fontFamily: FONTS.bold,
  fontSize: SIZES.subtitle,
  color: COLORS.text,
  marginBottom: SIZES.md,
}

// supportCard:
{
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.white,
  padding: SIZES.md,
  borderRadius: SIZES.radiusSm,
  borderWidth: 1,
  borderColor: COLORS.inputBorder,
  gap: SIZES.md,
}

// supportIcon (WhatsApp):
{
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#E8F5E9',  // Verde claro
  alignItems: 'center',
  justifyContent: 'center',
}

// logoutButton:
{
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: SIZES.xs,
  paddingVertical: SIZES.sm,
  paddingHorizontal: SIZES.md,
  backgroundColor: COLORS.white,
  borderRadius: SIZES.radiusSm,
  borderWidth: 1,
  borderColor: '#FF3B30',  // Vermelho
}
```

---

### 10. NOTIFICAÇÕES

**Rota:** `/notificacoes`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Notificações                                               │
│                                                             │
│  Não lidas (2)                    Marcar todas como lida    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔵 ↓ Nova venda registrada           • 2 minutos atrás│ │
│  │      Você registrou uma venda de R$ 150,00           │ │
│  │      para João Silva Santos                      ✓   │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔵 ⚠️ Saldo expirando               • 1 hora atrás   │ │
│  │      3 clientes têm saldo expirando em 7 dias        │ │
│  │                                                   ✓   │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Anteriores                                                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    ↑ Resgate realizado               • Ontem         │ │
│  │      Maria Santos resgatou R$ 25,00 em compra        │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    ℹ️ Novo cliente                    • 2 dias atrás │ │
│  │      Pedro Costa fez sua primeira compra             │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Tipos de notificação:**
- `sale`: Nova venda (ícone: arrow-down, cor: #34C759 verde)
- `redeem`: Resgate de saldo (ícone: arrow-up, cor: #FF3B30 vermelho)
- `warning`: Aviso de expiração (ícone: alert-circle, cor: #FF9500 laranja)
- `info`: Informações gerais (ícone: info, cor: #181818 preto)
- `customer`: Novo cliente (ícone: user-plus, cor: #181818 preto)

**Referência do NotificationsScreen mobile:**
```tsx
// notificationItem:
{
  flexDirection: 'row',
  alignItems: 'flex-start',
  paddingHorizontal: SIZES.lg,
  paddingVertical: SIZES.md,
  backgroundColor: COLORS.background,
  gap: SIZES.md,
}

// unreadNotification:
{
  backgroundColor: COLORS.white,  // Fundo diferente para não lidas
}

// iconContainer:
{
  width: 48,
  height: 48,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
  // backgroundColor dinâmico: `${icon.color}15` (15% opacidade)
}

// unreadDot:
{
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: COLORS.primary,  // Ponto preto
}

// markAsReadButton:
{
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: COLORS.inputBackground,
  alignItems: 'center',
  justifyContent: 'center',
}
```

---

## 🔧 COMPONENTES REUTILIZÁVEIS

### Button Component

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  title: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Estilos baseados no Button.js do mobile:
// - height: 56px (SIZES.inputHeight)
// - borderRadius: 4px (SIZES.radiusSm)
// - font: semiBold, 16px
// - primary: bg #181818, text white
// - secondary: bg white, border #181818, text #181818
// - danger: border #FF3B30, text #FF3B30
// - disabled: opacity 0.5
```

### Input Component

```tsx
// components/ui/Input.tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  mask?: 'cpf' | 'cnpj' | 'phone' | 'currency' | 'date';
}

// Estilos baseados no Input.js do mobile:
// - label: uppercase, letterSpacing 1px, fontSize 12px, color #666666
// - container: height 56px, bg #F5F5F5, border #E0E0E0, radius 4px
// - focused: border #181818
// - error: border #FF3B30
// - input: font regular, fontSize 16px, color #181818
// - placeholder: color #999999
```

### SearchInput Component

```tsx
// components/ui/SearchInput.tsx
// Baseado no SearchInput.js do mobile:
// - height: 44px
// - bg: #F5F5F5
// - ícone de lupa à esquerda
// - borderRadius: 4px
// - placeholder: color #999999
```

### Card Component

```tsx
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Variantes:
// - default: bg white, border #E0E0E0, radius 8px
// - filled: bg #F5F5F5, radius 8px
// - outlined: bg transparent, border #E0E0E0, radius 8px
```

### Badge Component

```tsx
// components/ui/Badge.tsx
interface BadgeProps {
  text: string;
  variant?: 'dark' | 'success' | 'error' | 'warning' | 'light';
}

// Estilos:
// - dark: bg #181818, text white
// - success: bg #34C759, text white
// - error: bg #FF3B30, text white
// - warning: bg #FF9500, text white
// - light: bg #F5F5F5, text #666666
// - Comum: px-2, py-1, text-xs, font-medium, rounded
```

### Modal Component

```tsx
// components/ui/Modal.tsx
// Baseado nos modais do mobile (bottom sheet style):
// - Overlay: bg rgba(0,0,0,0.5)
// - Content: bg white, borderRadius top 8px
// - Handle bar: 40x4px, bg #E0E0E0, rounded, centered
// - Padding: 24px horizontal, 32px bottom
```

### Avatar Component

```tsx
// components/ui/Avatar.tsx
interface AvatarProps {
  name: string;        // Para gerar inicial
  image?: string;      // URL da imagem
  size?: 'sm' | 'md' | 'lg';
}

// Tamanhos:
// - sm: 32x32px
// - md: 48x48px
// - lg: 64x64px

// Se não tiver imagem:
// - bg: #181818
// - text: white, font-bold
// - Mostrar primeira letra do nome
```

---

## 📱 RESPONSIVIDADE

### Breakpoints

```typescript
// Tailwind padrão:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Comportamento:
// Mobile (< 768px):
//   - Sidebar escondida (hamburger menu)
//   - Header fixo com logo e ícones
//   - Cards em coluna única
//   - Bottom navigation opcional

// Tablet (768px - 1024px):
//   - Sidebar colapsada (apenas ícones)
//   - Expandir ao hover/click
//   - Cards em grid 2 colunas

// Desktop (> 1024px):
//   - Sidebar sempre visível (280px)
//   - Cards em grid 3 colunas
//   - Layout completo
```

### Mobile Navigation

```tsx
// No mobile, usar bottom navigation ou hamburger menu
// Opção 1: Bottom Navigation (estilo do app mobile)
const mobileNavItems = [
  { icon: 'Home', label: 'Home', href: '/' },
  { icon: 'PlusCircle', label: 'Venda', href: '/registrar-venda' },
  { icon: 'Receipt', label: 'Vendas', href: '/vendas' },
  { icon: 'Users', label: 'Clientes', href: '/clientes' },
  { icon: 'Menu', label: 'Menu', onClick: openSidebar },
];

// Estilo baseado no MainNavigator mobile:
// - height: 80px
// - paddingTop: 8px, paddingBottom: 16px
// - borderTop: 1px #E0E0E0
// - activeColor: #181818
// - inactiveColor: #999999
// - font: medium, 10px
```

---

## 🔐 AUTENTICAÇÃO E ROTAS

```typescript
// middleware.ts
// Proteger rotas do dashboard
// Redirecionar para /login se não autenticado

// Estrutura de autenticação:
// - Login com email/senha
// - Token JWT armazenado em cookie httpOnly
// - Refresh token para sessões longas
// - Logout remove todos os tokens

// Dados do usuário logado:
interface StoreUser {
  id: string;
  email: string;
  storeName: string;
  storeLogo?: string;
  cnpj: string;
  cashbackPercentage: number;
  expirationDays: number;
  minPurchase: number;
}
```

---

## 📊 TIPOS DE DADOS

```typescript
// types/sale.ts
interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  customerCpf: string;
  purchaseAmount: number;      // Valor da compra
  balanceUsed: number;         // Saldo usado
  amountPaid: number;          // Valor pago (purchaseAmount - balanceUsed)
  cashbackGenerated: number;   // Cashback gerado
  cashbackPercentage: number;  // % de cashback no momento
  createdAt: Date;
  status: 'confirmed' | 'cancelled';
}

// types/customer.ts
interface Customer {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  email?: string;
  phone?: string;
  // Dados específicos da loja:
  storeData: {
    totalPurchases: number;
    totalSpent: number;
    totalCashback: number;
    currentBalance: number;
    lastPurchase?: Date;
  };
}

// types/notification.ts
interface Notification {
  id: string;
  type: 'sale' | 'redeem' | 'warning' | 'info' | 'customer';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: {
    saleId?: string;
    customerId?: string;
  };
}

// types/store.ts
interface Store {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  cashbackPercentage: number;
  expirationDays: number;
  minPurchase: number;
  createdAt: Date;
}
```

---

## 🎯 FUNCIONALIDADES ESSENCIAIS

### 1. Scanner QR Code
- Usar biblioteca `html5-qrcode` ou `react-qr-reader`
- Solicitar permissão de câmera
- Decodificar dados do cliente do QR
- Fallback para input de CPF manual

### 2. Formatadores
```typescript
// lib/formatters.ts
export function formatCPF(value: string): string {
  // 123.456.789-00
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
  if (match) {
    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '.' + match[2];
    if (match[3]) formatted += '.' + match[3];
    if (match[4]) formatted += '-' + match[4];
    return formatted;
  }
  return value;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
```

### 3. PWA Configuration
```json
// public/manifest.json
{
  "name": "MIBE Store",
  "short_name": "MIBE Store",
  "description": "Painel da empresa MIBE",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#181818",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## ⚠️ REGRAS DE NEGÓCIO IMPORTANTES

1. **A loja NÃO PODE editar dados do cliente** - apenas visualização
2. **O saldo do cliente é por loja** - cada loja tem seu próprio saldo
3. **O cashback é calculado sobre o valor pago** (não sobre o valor total se usar saldo)
4. **O saldo usado não gera cashback** - apenas o valor pago
5. **Vendas confirmadas não podem ser canceladas** pelo app (somente suporte)
6. **O QR Code contém dados encriptados** do cliente para identificação

---

## 📝 ORDEM DE IMPLEMENTAÇÃO SUGERIDA

1. **Setup inicial:**
   - Next.js + TypeScript + Tailwind
   - Configurar fontes e cores
   - Criar componentes base (Button, Input, Card)

2. **Layout:**
   - Sidebar responsiva
   - Header mobile
   - Estrutura de rotas

3. **Autenticação:**
   - Tela de login
   - Contexto de autenticação
   - Proteção de rotas

4. **Dashboard:**
   - Cards de estatísticas
   - Vendas recentes
   - Quick action (registrar venda)

5. **Registrar Venda:**
   - Scanner QR Code
   - Input de CPF
   - Preview do cliente
   - Formulário de venda
   - Confirmação

6. **Histórico de Vendas:**
   - Lista com filtros
   - Detalhes da venda
   - Busca

7. **Clientes:**
   - Lista com busca
   - Detalhes (somente leitura)
   - Histórico por cliente

8. **Empresa:**
   - Dados da empresa
   - Configurações de cashback
   - Suporte

9. **Notificações:**
   - Lista de notificações
   - Marcar como lida
   - Badge de contagem

10. **PWA:**
    - Manifest
    - Service Worker
    - Ícones

---

## 🎨 RESUMO VISUAL RÁPIDO

| Elemento | Cor/Valor |
|----------|-----------|
| Cor primária | #181818 (preto) |
| Cor de fundo | #FFFFFF (branco) |
| Cor de input | #F5F5F5 (cinza claro) |
| Cor de borda | #E0E0E0 (cinza) |
| Cor de texto | #181818 (preto) |
| Cor secundária de texto | #666666 (cinza) |
| Cor muted de texto | #999999 (cinza claro) |
| Cor de sucesso | #34C759 (verde) |
| Cor de erro | #FF3B30 (vermelho) |
| Cor de aviso | #FF9500 (laranja) |
| Cor de estrela | #FFB800 (amarelo) |
| Fonte | Plus Jakarta Sans |
| Altura de input | 56px |
| Border radius pequeno | 4px |
| Border radius médio | 8px |
| Border radius grande | 12px |

---

**Este prompt contém TODAS as informações necessárias para criar o aplicativo web da loja MIBE seguindo exatamente o mesmo padrão visual do aplicativo mobile do cliente.**
