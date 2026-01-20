# 01 - Setup Inicial do Projeto

## Objetivo
Configurar o projeto Next.js com todas as dependências necessárias.

---

## Passo 1: Criar o Projeto Next.js

```bash
npx create-next-app@latest mibe-store-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Quando perguntado, selecione:
- Would you like to use TypeScript? **Yes**
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like to use `src/` directory? **Yes**
- Would you like to use App Router? **Yes**
- Would you like to customize the default import alias? **Yes** (@/*)

---

## Passo 2: Instalar Dependências

```bash
cd mibe-store-web

# Ícones
npm install lucide-react

# Gerenciamento de estado
npm install zustand

# Formulários e validação
npm install react-hook-form zod @hookform/resolvers

# Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# PWA
npm install next-pwa

# QR Code Scanner
npm install html5-qrcode

# Utilitários
npm install clsx tailwind-merge date-fns
```

---

## Passo 3: Estrutura de Pastas

Criar as seguintes pastas dentro de `src/`:

```bash
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/dashboard
mkdir -p src/components/sales
mkdir -p src/components/customers
mkdir -p src/components/register-sale
mkdir -p src/constants
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/assets/icons
mkdir -p public/icons
```

---

## Passo 4: Configurar TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Passo 5: Configurar Next.js (next.config.js)

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-url.supabase.co'], // Adicionar domínio do Supabase
  },
};

module.exports = withPWA(nextConfig);
```

---

## Passo 6: Variáveis de Ambiente

Criar arquivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Criar arquivo `.env.example` (para referência):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Passo 7: Configurar .gitignore

Adicionar ao `.gitignore`:

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# PWA
public/sw.js
public/workbox-*.js
public/worker-*.js
```

---

## Passo 8: Criar Arquivo de Utilitários Base

Criar `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Passo 9: Criar Configuração do Supabase

Criar `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Criar `src/lib/supabase-server.ts` (para Server Components):

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = () =>
  createServerComponentClient({ cookies });
```

---

## Passo 10: Limpar Arquivos Padrão

Limpar o conteúdo do `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main>
      <h1>MIBE Store</h1>
    </main>
  );
}
```

---

## Verificação

Execute o projeto para garantir que está funcionando:

```bash
npm run dev
```

Acesse `http://localhost:3000` e verifique se a página carrega sem erros.

---

## Checklist

- [ ] Projeto Next.js criado
- [ ] Todas as dependências instaladas
- [ ] Estrutura de pastas criada
- [ ] tsconfig.json configurado
- [ ] next.config.js configurado
- [ ] Variáveis de ambiente configuradas
- [ ] .gitignore atualizado
- [ ] utils.ts criado
- [ ] Supabase configurado
- [ ] Projeto rodando sem erros

---

## Próximo Passo

Seguir para [02-design-system.md](./02-design-system.md) para configurar o design system.
