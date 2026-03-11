# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Backend Rule (CRITICAL)

**TODO o backend DEVE ser implementado no Supabase.** Isso inclui:
- Lógica de negócio via **Edge Functions** do Supabase (TypeScript/Deno)
- Banco de dados via **Supabase Postgres** com RLS
- Autenticação via **Supabase Auth** (ou custom JWT conforme já implementado)
- Storage via **Supabase Storage**
- Scheduled jobs via **pg_cron** ou **Edge Functions com cron**

Não usar serviços externos de backend (AWS Lambda, Vercel Functions além do necessário para SSR, etc.). O Supabase é a única plataforma de backend autorizada.

## Project Overview

MIBE Store is a responsive web application (PWA) for companies/stores that are partners in the MIBE cashback system. It allows store owners to manage sales, view customers, track metrics, and configure their cashback settings. The app follows the same design system as the mobile customer app for visual consistency.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Environment Setup

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture Overview

### Authentication Flow

- **Custom JWT Authentication**: The app uses a custom authentication system with JWT tokens stored in Zustand (NOT Supabase Auth)
- **Auth Store**: `src/hooks/useAuth.ts` manages authentication state using Zustand with persistence
- **API Routes**: Authentication endpoints are in `src/app/api/auth/` (login, register, me, change-password, forgot-password, etc.)
- **Token Storage**: JWT tokens are stored in localStorage via Zustand persist middleware under the key `mibe-auth-storage`
- **Auth Headers**: API requests must include `Authorization: Bearer ${token}` header
- **Middleware**: Currently minimal (`src/middleware.ts`), route protection is handled client-side via the auth store

### Database Architecture

The app uses Supabase as the backend with these key tables:

- `profiles`: User profiles (with role enum: super_admin, company_owner, client)
- `companies`: Store/company data including cashback settings
- `transactions`: Sales/purchase records
- `cashback_balances`: Customer balances per company
- `reviews`: Customer reviews for stores
- `plans`: Subscription plan definitions
- `subscriptions`: Company subscription records
- `payment_history`: Payment records for subscriptions
- `categories`: Store categories

Important: The database schema is fully typed in `src/types/database.ts` - always reference this for type-safe database operations.

### State Management

- **Zustand**: Primary state management library
- **Auth State**: `useAuth` hook in `src/hooks/useAuth.ts` manages user, company, tokens, and authentication state
- **Data Fetching**: Custom hooks in `src/hooks/` (useSales, useCustomers, useNotifications, usePlans) handle data fetching and state
- **No React Context**: The app does not use React Context API - all global state is in Zustand stores

### API Route Structure

All API routes are in `src/app/api/` and follow REST conventions:

- `api/auth/*`: Authentication endpoints (login, register, me, change-password, forgot-password, onboarding)
- `api/company/*`: Company data endpoints (me, update)
- `api/sales/*`: Sales operations (create, list, detail, stats)
- `api/customers/*`: Customer operations (list, detail, find-by-cpf)
- `api/payment/*`: Payment processing (create)
- `api/subscription/*`: Subscription management (data, change-plan)
- `api/categories/*`: Category listing
- `api/reviews/*`: Review management (list, reply)
- `api/upload/*`: File upload handling

### PWA Configuration

- **Service Worker**: Located at `src/app/sw.ts`
- **PWA Framework**: Uses Serwist (next-pwa replacement)
- **Configuration**: `next.config.mjs` includes Serwist setup
- **Offline Support**: Service worker is disabled in development, enabled in production
- **Manifest**: Generated PWA manifest with icons

## Business Rules (Critical)

1. **Read-Only Customer Data**: Stores can ONLY VIEW customer data, never edit it
2. **Per-Store Balances**: Each customer has a separate cashback balance for each store
3. **Cashback Calculation**: Cashback is calculated ONLY on the amount paid, NOT on cashback redeemed
4. **Balance Usage**: Cashback balance used does NOT generate new cashback
5. **No Sale Cancellation**: Confirmed sales cannot be cancelled via the app (support only)
6. **QR Code Security**: QR codes contain encrypted customer data for identification

## Design System

### Theme Constants

All design tokens are centralized in `src/constants/theme.ts`:

- **Colors**: Primary (#181818), Success (#34C759), Error (#FF3B30), Warning (#FF9500)
- **Typography**: Plus Jakarta Sans font with weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Spacing**: xs/sm/md/lg/xl/xxl (4/8/16/24/32/48px)
- **Font Sizes**: caption/body/bodyLarge/subtitle/title/header (12/14/16/18/24/32px)
- **Border Radius**: sm/md/lg/full (4/8/12/9999px)

### Component Organization

- `src/components/ui/`: Base UI components (Button, Input, Card, Badge, Modal, Avatar, etc.)
- `src/components/layout/`: Layout components (Sidebar, Header, MobileNav)
- `src/components/dashboard/`: Dashboard-specific components (StatCard, RecentSales, QuickActions)
- `src/components/sales/`: Sales-related components (SaleCard, SalesList, SaleDetail, SalesFilters)
- `src/components/customers/`: Customer components (CustomerCard, CustomersList, CustomerDetail)
- `src/components/register-sale/`: Sale registration flow (QRScanner, CPFInput, SaleForm, etc.)
- `src/components/empresa/`: Company/store management components
- `src/components/plans/`: Subscription plan components
- `src/components/notifications/`: Notification components
- `src/components/onboarding/`: Onboarding flow
- `src/components/pwa/`: PWA-specific components

### Responsive Breakpoints

- **Desktop (>1024px)**: Full layout with sidebar
- **Tablet (768px-1024px)**: Collapsed sidebar
- **Mobile (<768px)**: Header + Bottom navigation

## Page Structure

The app uses Next.js App Router with route groups:

- `(auth)/`: Unauthenticated pages (login, criar-conta, esqueci-senha, redefinir-senha)
- `(dashboard)/`: Authenticated pages with layout (dashboard, registrar-venda, vendas, clientes, empresa, notificacoes, planos, minha-conta, suporte)

All dashboard pages are wrapped in the layout at `src/app/(dashboard)/layout.tsx` which includes Sidebar/Header/MobileNav.

## Documentation Structure

The `docs/` folder contains step-by-step implementation guides:

- `00-ROTEIRO-IMPLEMENTACAO.md`: Master implementation roadmap
- `01-setup.md` through `12-pwa.md`: Detailed implementation guides for each feature

**Important**: When making changes, always consult the relevant documentation file in `docs/` to understand the feature's requirements and implementation details.

## Key Libraries

- **html5-qrcode**: QR code scanning in the register sale flow
- **react-leaflet**: Map integration for store location
- **date-fns**: Date formatting and manipulation
- **zod**: Schema validation
- **react-hook-form**: Form state management with @hookform/resolvers
- **sonner**: Toast notifications
- **lucide-react**: Icon system
- **bcryptjs**: Password hashing (server-side only)

## Payment Integration

- **Gateway**: AbacatePay (https://docs.abacatepay.com)
- **Configuration**: `src/lib/abacatepay.ts`
- **Flow**: PIX via `POST /pixQrCode/create`; Cartão via `POST /billing/create`
- **Webhook**: `POST /api/payment/webhook?secret=ABACATEPAY_WEBHOOK_SECRET` — eventos `billing.paid`, `billing.failed`, `billing.refunded`
- **Env vars**: `ABACATEPAY_API_KEY`, `ABACATEPAY_WEBHOOK_SECRET`

## Common Patterns

### API Route Pattern

```typescript
// Authenticate request
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
// Validate token and get user from Supabase auth.users

// Use typed Supabase client
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', id);

// Return typed response
return NextResponse.json({ data });
```

### Custom Hook Pattern

Hooks in `src/hooks/` typically:
1. Accept optional parameters for filtering
2. Use SWR or manual fetch with state management
3. Return `{ data, isLoading, error, refetch }` object
4. Include proper TypeScript typing

### Component Exports

All component folders have an `index.ts` barrel export file for clean imports:

```typescript
// Instead of:
import { Button } from '@/components/ui/Button';

// Use:
import { Button } from '@/components/ui';
```

## File Upload

- **Endpoint**: `POST /api/upload`
- **Storage**: Files are uploaded to Supabase Storage
- **Use Cases**: Company logos, cover images, profile photos, gallery images
- **Components**: LogoUpload, CoverUpload, ProfilePhotoUpload

## Testing Approach

When implementing new features:
1. Ensure TypeScript types are correct
2. Test responsive behavior (mobile, tablet, desktop)
3. Verify authentication requirements
4. Check business rule compliance
5. Test offline PWA behavior if applicable
