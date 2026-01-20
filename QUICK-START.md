# Quick Start Guide - MIBE Store Web App

Guia rápido para começar a implementação do projeto.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Editor de código (VS Code recomendado)

## 🚀 Passos Rápidos

### 1. Criar Projeto Next.js

```bash
npx create-next-app@latest mibe-store-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd mibe-store-web
```

### 2. Instalar Dependências

```bash
npm install lucide-react zustand react-hook-form zod @hookform/resolvers @supabase/supabase-js @supabase/auth-helpers-nextjs next-pwa html5-qrcode clsx tailwind-merge date-fns
```

### 3. Configurar Ambiente

Criar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Seguir Documentação

Seguir os documentos na ordem:

1. [01-setup.md](./docs/01-setup.md) - Setup completo
2. [02-design-system.md](./docs/02-design-system.md) - Design System
3. [03-components.md](./docs/03-components.md) - Componentes UI
4. ... e assim por diante

## 📁 Estrutura de Pastas

Criar manualmente (ou usar o comando abaixo):

```bash
# Windows
mkdir src\components\ui src\components\layout src\components\dashboard src\components\sales src\components\customers src\components\register-sale src\constants src\lib src\hooks src\types src\assets\icons public\icons

# Linux/Mac
mkdir -p src/components/{ui,layout,dashboard,sales,customers,register-sale} src/{constants,lib,hooks,types,assets/icons} public/icons
```

## 🎨 Arquivos Base Já Criados

- [x] `src/components/Logo.tsx` - Componente de logo MIBE
- [x] `src/constants/theme.ts` - Constantes de cores, fontes e tamanhos
- [x] `.gitignore` - Configurado para Next.js e PWA
- [x] `README.md` - Documentação principal

## 📖 Ordem de Implementação Recomendada

### Fase 1: Fundação (1-2 dias)
1. Setup (01-setup.md)
2. Design System (02-design-system.md)
3. Componentes UI (03-components.md)
4. Layout (04-layout.md)

### Fase 2: Autenticação (1 dia)
5. Autenticação (05-auth.md)

### Fase 3: Core (2-3 dias)
6. Dashboard (06-dashboard.md)
7. Registrar Venda (07-registrar-venda.md)

### Fase 4: Listagens (1-2 dias)
8. Histórico de Vendas (08-vendas.md)
9. Clientes (09-clientes.md)

### Fase 5: Finalização (1 dia)
10. Empresa (10-empresa.md)
11. Notificações (11-notificacoes.md)
12. PWA (12-pwa.md)

## 🗄️ Configurar Supabase

### 1. Criar Tabelas

No SQL Editor do Supabase, executar os scripts SQL de cada documento:

- `stores` (05-auth.md)
- `customers` e `customer_balances` (07-registrar-venda.md)
- `sales` (06-dashboard.md)
- `notifications` (11-notificacoes.md)

### 2. Configurar Storage

Criar bucket `store-assets` para logos (10-empresa.md)

### 3. Configurar RLS

Ativar Row Level Security em todas as tabelas seguindo os exemplos nos documentos.

## ✅ Checklist de Início

- [ ] Node.js 18+ instalado
- [ ] Projeto Next.js criado
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Estrutura de pastas criada
- [ ] Supabase configurado
- [ ] Tabelas criadas
- [ ] RLS habilitado
- [ ] Documentação lida

## 🔍 Dicas

1. **Siga a ordem:** Os documentos são interdependentes
2. **Teste cada etapa:** Rode o projeto após cada fase
3. **Commits frequentes:** Faça commits após completar cada documento
4. **Design System:** Sempre use as classes do Tailwind customizadas
5. **Componentes:** Reutilize ao máximo os componentes UI criados

## 🆘 Problemas Comuns

### Erro de módulo não encontrado
```bash
npm install
```

### Erro de TypeScript
Verificar se todos os tipos estão criados na pasta `src/types/`

### Erro de Supabase
Verificar se as variáveis de ambiente estão corretas no `.env.local`

### Erro de PWA
O PWA só funciona em produção. Use:
```bash
npm run build
npm run start
```

## 📚 Recursos Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

## 🎯 Próximos Passos

1. Ler o [Roteiro de Implementação](./docs/00-ROTEIRO-IMPLEMENTACAO.md)
2. Começar pelo [Setup Inicial](./docs/01-setup.md)
3. Seguir a sequência dos documentos
4. Testar cada funcionalidade implementada
5. Deploy em produção (Vercel recomendado)

---

**Boa implementação!** 🚀
