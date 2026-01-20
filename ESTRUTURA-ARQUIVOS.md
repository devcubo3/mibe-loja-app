# Estrutura de Arquivos - MIBE Store Web App

Documento visual com todos os arquivos que devem ser criados no projeto.

## 📁 Estrutura Completa

```
mibe-loja-app/
│
├── 📄 README.md                           ✅ Criado
├── 📄 QUICK-START.md                      ✅ Criado
├── 📄 ESTRUTURA-ARQUIVOS.md               ✅ Criado
├── 📄 .gitignore                          ✅ Criado
├── 📄 package.json                        ⚠️  Criar no setup
├── 📄 tsconfig.json                       ⚠️  Criar no setup
├── 📄 next.config.js                      ⚠️  Criar no setup
├── 📄 tailwind.config.ts                  ⚠️  Criar no setup
├── 📄 .env.local                          ⚠️  Criar no setup
├── 📄 .env.example                        ⚠️  Criar no setup
│
├── 📂 docs/                               ✅ Documentação completa
│   ├── 📄 00-ROTEIRO-IMPLEMENTACAO.md     ✅ Criado
│   ├── 📄 01-setup.md                     ✅ Criado
│   ├── 📄 02-design-system.md             ✅ Criado
│   ├── 📄 03-components.md                ✅ Criado
│   ├── 📄 04-layout.md                    ✅ Criado
│   ├── 📄 05-auth.md                      ✅ Criado
│   ├── 📄 06-dashboard.md                 ✅ Criado
│   ├── 📄 07-registrar-venda.md           ✅ Criado
│   ├── 📄 08-vendas.md                    ✅ Criado
│   ├── 📄 09-clientes.md                  ✅ Criado
│   ├── 📄 10-empresa.md                   ✅ Criado
│   ├── 📄 11-notificacoes.md              ✅ Criado
│   └── 📄 12-pwa.md                       ✅ Criado
│
├── 📂 src/
│   │
│   ├── 📂 app/
│   │   ├── 📄 layout.tsx                  📝 (05-auth, 12-pwa)
│   │   ├── 📄 globals.css                 📝 (02-design-system)
│   │   ├── 📄 manifest.json               📝 (12-pwa)
│   │   │
│   │   ├── 📂 (auth)/
│   │   │   ├── 📄 layout.tsx              📝 (05-auth)
│   │   │   ├── 📂 login/
│   │   │   │   └── 📄 page.tsx            📝 (05-auth)
│   │   │   └── 📂 esqueci-senha/
│   │   │       └── 📄 page.tsx            📝 (05-auth)
│   │   │
│   │   ├── 📂 (dashboard)/
│   │   │   ├── 📄 layout.tsx              📝 (04-layout, 11-notificacoes)
│   │   │   ├── 📄 page.tsx                📝 (06-dashboard)
│   │   │   │
│   │   │   ├── 📂 registrar-venda/
│   │   │   │   └── 📄 page.tsx            📝 (07-registrar-venda)
│   │   │   │
│   │   │   ├── 📂 vendas/
│   │   │   │   ├── 📄 page.tsx            📝 (08-vendas)
│   │   │   │   └── 📂 [id]/
│   │   │   │       └── 📄 page.tsx        📝 (08-vendas)
│   │   │   │
│   │   │   ├── 📂 clientes/
│   │   │   │   ├── 📄 page.tsx            📝 (09-clientes)
│   │   │   │   └── 📂 [id]/
│   │   │   │       └── 📄 page.tsx        📝 (09-clientes)
│   │   │   │
│   │   │   ├── 📂 empresa/
│   │   │   │   └── 📄 page.tsx            📝 (10-empresa)
│   │   │   │
│   │   │   └── 📂 notificacoes/
│   │   │       └── 📄 page.tsx            📝 (11-notificacoes)
│   │   │
│   │   ├── 📂 offline/
│   │   │   └── 📄 page.tsx                📝 (12-pwa)
│   │   │
│   │   └── 📂 design-test/
│   │       └── 📄 page.tsx                📝 (02-design-system)
│   │
│   ├── 📂 components/
│   │   │
│   │   ├── 📄 Logo.tsx                    ✅ Criado
│   │   │
│   │   ├── 📂 ui/
│   │   │   ├── 📄 Button.tsx              📝 (03-components)
│   │   │   ├── 📄 Input.tsx               📝 (03-components)
│   │   │   ├── 📄 SearchInput.tsx         📝 (03-components)
│   │   │   ├── 📄 Card.tsx                📝 (03-components)
│   │   │   ├── 📄 Badge.tsx               📝 (03-components)
│   │   │   ├── 📄 Modal.tsx               📝 (03-components)
│   │   │   ├── 📄 Skeleton.tsx            📝 (03-components)
│   │   │   ├── 📄 Avatar.tsx              📝 (03-components)
│   │   │   ├── 📄 Divider.tsx             📝 (03-components)
│   │   │   ├── 📄 EmptyState.tsx          📝 (03-components)
│   │   │   └── 📄 index.ts                📝 (03-components)
│   │   │
│   │   ├── 📂 layout/
│   │   │   ├── 📄 Sidebar.tsx             📝 (04-layout)
│   │   │   ├── 📄 Header.tsx              📝 (04-layout)
│   │   │   ├── 📄 MobileNav.tsx           📝 (04-layout)
│   │   │   └── 📄 index.ts                📝 (04-layout)
│   │   │
│   │   ├── 📂 providers/
│   │   │   └── 📄 AuthProvider.tsx        📝 (05-auth)
│   │   │
│   │   ├── 📂 dashboard/
│   │   │   ├── 📄 StatCard.tsx            📝 (06-dashboard)
│   │   │   ├── 📄 QuickActions.tsx        📝 (06-dashboard)
│   │   │   ├── 📄 RecentSales.tsx         📝 (06-dashboard)
│   │   │   └── 📄 index.ts                📝 (06-dashboard)
│   │   │
│   │   ├── 📂 register-sale/
│   │   │   ├── 📄 QRScanner.tsx           📝 (07-registrar-venda)
│   │   │   ├── 📄 CPFInput.tsx            📝 (07-registrar-venda)
│   │   │   ├── 📄 CustomerPreview.tsx     📝 (07-registrar-venda)
│   │   │   ├── 📄 SaleForm.tsx            📝 (07-registrar-venda)
│   │   │   ├── 📄 SaleConfirmation.tsx    📝 (07-registrar-venda)
│   │   │   └── 📄 index.ts                📝 (07-registrar-venda)
│   │   │
│   │   ├── 📂 sales/
│   │   │   ├── 📄 SaleCard.tsx            📝 (08-vendas)
│   │   │   ├── 📄 SalesList.tsx           📝 (08-vendas)
│   │   │   ├── 📄 SalesFilters.tsx        📝 (08-vendas)
│   │   │   ├── 📄 SaleDetail.tsx          📝 (08-vendas)
│   │   │   └── 📄 index.ts                📝 (08-vendas)
│   │   │
│   │   ├── 📂 customers/
│   │   │   ├── 📄 CustomerCard.tsx        📝 (09-clientes)
│   │   │   ├── 📄 CustomersList.tsx       📝 (09-clientes)
│   │   │   ├── 📄 CustomerDetail.tsx      📝 (09-clientes)
│   │   │   └── 📄 index.ts                📝 (09-clientes)
│   │   │
│   │   ├── 📂 empresa/
│   │   │   ├── 📄 LogoUpload.tsx          📝 (10-empresa)
│   │   │   ├── 📄 EditStoreModal.tsx      📝 (10-empresa)
│   │   │   └── 📄 index.ts                📝 (10-empresa)
│   │   │
│   │   ├── 📂 notifications/
│   │   │   ├── 📄 NotificationItem.tsx    📝 (11-notificacoes)
│   │   │   └── 📄 index.ts                📝 (11-notificacoes)
│   │   │
│   │   └── 📂 pwa/
│   │       ├── 📄 InstallPrompt.tsx       📝 (12-pwa)
│   │       └── 📄 index.ts                📝 (12-pwa)
│   │
│   ├── 📂 constants/
│   │   └── 📄 theme.ts                    ✅ Criado
│   │
│   ├── 📂 lib/
│   │   ├── 📄 utils.ts                    📝 (01-setup)
│   │   ├── 📄 formatters.ts               📝 (06-dashboard)
│   │   ├── 📄 supabase.ts                 📝 (01-setup)
│   │   └── 📄 supabase-server.ts          📝 (01-setup)
│   │
│   ├── 📂 hooks/
│   │   ├── 📄 useAuth.ts                  📝 (05-auth)
│   │   ├── 📄 useSales.ts                 📝 (06-dashboard)
│   │   └── 📄 useNotifications.ts         📝 (11-notificacoes)
│   │
│   ├── 📂 types/
│   │   ├── 📄 auth.ts                     📝 (05-auth)
│   │   ├── 📄 sale.ts                     📝 (06-dashboard)
│   │   ├── 📄 customer.ts                 📝 (07-registrar-venda)
│   │   ├── 📄 notification.ts             📝 (11-notificacoes)
│   │   └── 📄 store.ts                    📝 (10-empresa)
│   │
│   └── 📂 assets/
│       └── 📂 icons/
│
├── 📂 public/
│   ├── 📄 manifest.json                   📝 (12-pwa)
│   │
│   ├── 📂 icons/
│   │   ├── 🖼️ icon-72x72.png              📝 (12-pwa)
│   │   ├── 🖼️ icon-96x96.png              📝 (12-pwa)
│   │   ├── 🖼️ icon-128x128.png            📝 (12-pwa)
│   │   ├── 🖼️ icon-144x144.png            📝 (12-pwa)
│   │   ├── 🖼️ icon-152x152.png            📝 (12-pwa)
│   │   ├── 🖼️ icon-192x192.png            📝 (12-pwa)
│   │   ├── 🖼️ icon-384x384.png            📝 (12-pwa)
│   │   ├── 🖼️ icon-512x512.png            📝 (12-pwa)
│   │   ├── 🖼️ shortcut-sale.png           📝 (12-pwa)
│   │   └── 🖼️ shortcut-history.png        📝 (12-pwa)
│   │
│   ├── 📂 splash/
│   │   ├── 🖼️ apple-splash-*.png          📝 (12-pwa)
│   │   └── ... (vários tamanhos)
│   │
│   └── 📂 screenshots/
│       ├── 🖼️ desktop.png                 📝 (12-pwa)
│       └── 🖼️ mobile.png                  📝 (12-pwa)
│
└── 📂 middleware.ts                       📝 (05-auth)
```

## 📊 Estatísticas

### Arquivos por Categoria

| Categoria | Quantidade |
|-----------|------------|
| Documentação | 15 arquivos |
| Páginas (App Router) | 12 arquivos |
| Componentes UI | 11 arquivos |
| Componentes Layout | 3 arquivos |
| Componentes Dashboard | 3 arquivos |
| Componentes Register Sale | 5 arquivos |
| Componentes Sales | 4 arquivos |
| Componentes Customers | 3 arquivos |
| Componentes Empresa | 2 arquivos |
| Componentes Notifications | 1 arquivo |
| Componentes PWA | 1 arquivo |
| Hooks | 3 arquivos |
| Types | 5 arquivos |
| Lib/Utils | 4 arquivos |
| Configuração | 6 arquivos |
| Assets | ~20 imagens |

**Total:** ~95 arquivos de código + ~20 assets

## 📝 Legenda

- ✅ **Criado** - Arquivo já criado e pronto
- 📝 **A criar** - Arquivo a ser criado seguindo a documentação
- ⚠️  **Setup** - Arquivo criado automaticamente no setup ou manualmente
- 🖼️ **Asset** - Imagem/ícone a ser criado

## 🔍 Busca Rápida

### Por Funcionalidade

**Autenticação:**
- `src/app/(auth)/login/page.tsx`
- `src/hooks/useAuth.ts`
- `src/components/providers/AuthProvider.tsx`
- `src/types/auth.ts`

**Dashboard:**
- `src/app/(dashboard)/page.tsx`
- `src/components/dashboard/*`
- `src/hooks/useSales.ts`

**Registro de Venda:**
- `src/app/(dashboard)/registrar-venda/page.tsx`
- `src/components/register-sale/*`

**Vendas:**
- `src/app/(dashboard)/vendas/page.tsx`
- `src/components/sales/*`

**Clientes:**
- `src/app/(dashboard)/clientes/page.tsx`
- `src/components/customers/*`

**Empresa:**
- `src/app/(dashboard)/empresa/page.tsx`
- `src/components/empresa/*`

**Notificações:**
- `src/app/(dashboard)/notificacoes/page.tsx`
- `src/components/notifications/*`
- `src/hooks/useNotifications.ts`

**PWA:**
- `public/manifest.json`
- `src/components/pwa/InstallPrompt.tsx`

## 📦 Ordem de Criação Recomendada

1. **Setup (01-setup.md)**
   - Criar projeto Next.js
   - Instalar dependências
   - Criar estrutura de pastas
   - Configurar arquivos base

2. **Design System (02-design-system.md)**
   - `src/app/globals.css`
   - `tailwind.config.ts`
   - `src/app/layout.tsx`

3. **Componentes UI (03-components.md)**
   - Todos em `src/components/ui/`

4. **Layout (04-layout.md)**
   - Todos em `src/components/layout/`
   - `src/app/(dashboard)/layout.tsx`

5. **Autenticação (05-auth.md)**
   - `src/hooks/useAuth.ts`
   - `src/types/auth.ts`
   - `src/app/(auth)/*`
   - `middleware.ts`

6. **Dashboard (06-dashboard.md)**
   - `src/hooks/useSales.ts`
   - `src/lib/formatters.ts`
   - `src/components/dashboard/*`
   - `src/app/(dashboard)/page.tsx`

7. **E assim por diante...**

## ✅ Checklist de Progresso

Use este checklist para marcar seu progresso:

- [ ] Documentação lida
- [ ] Projeto Next.js criado
- [ ] Dependências instaladas
- [ ] Estrutura de pastas criada
- [ ] Design System implementado
- [ ] Componentes UI criados
- [ ] Layout implementado
- [ ] Autenticação funcionando
- [ ] Dashboard completo
- [ ] Registro de venda funcionando
- [ ] Histórico de vendas implementado
- [ ] Lista de clientes funcionando
- [ ] Página da empresa completa
- [ ] Notificações em tempo real
- [ ] PWA configurado e testado
- [ ] Build de produção funcionando
- [ ] Deploy realizado

---

**Use este documento como referência durante toda a implementação!**
