# ROTEIRO DE IMPLEMENTAÇÃO - MIBE STORE WEB APP

## Visão Geral

Este documento serve como guia mestre para implementação do **MIBE Store Web App**, um aplicativo web responsivo (PWA) para empresas/lojas parceiras do sistema MIBE de cashback.

---

## Estrutura de Documentação

| Ordem | Documento | Descrição | Dependências |
|-------|-----------|-----------|--------------|
| 01 | [01-setup.md](./01-setup.md) | Setup inicial do projeto Next.js | Nenhuma |
| 02 | [02-design-system.md](./02-design-system.md) | Cores, fontes e estilos globais | 01 |
| 03 | [03-components.md](./03-components.md) | Componentes UI reutilizáveis | 02 |
| 04 | [04-layout.md](./04-layout.md) | Sidebar, Header e estrutura | 03 |
| 05 | [05-auth.md](./05-auth.md) | Autenticação e proteção de rotas | 03, 04 |
| 06 | [06-dashboard.md](./06-dashboard.md) | Tela inicial/Home | 04, 05 |
| 07 | [07-registrar-venda.md](./07-registrar-venda.md) | Fluxo de registro de venda | 05, 06 |
| 08 | [08-vendas.md](./08-vendas.md) | Histórico e detalhes de vendas | 05, 06 |
| 09 | [09-clientes.md](./09-clientes.md) | Lista e detalhes de clientes | 05, 06 |
| 10 | [10-empresa.md](./10-empresa.md) | Dados e configurações da empresa | 05 |
| 11 | [11-notificacoes.md](./11-notificacoes.md) | Central de notificações | 05 |
| 12 | [12-pwa.md](./12-pwa.md) | Configuração PWA | Todos |

---

## Estrutura de Pastas do Projeto

```
mibe-loja-app/
├── docs/                           # Documentação de implementação
│   ├── 00-ROTEIRO-IMPLEMENTACAO.md
│   ├── 01-setup.md
│   ├── 02-design-system.md
│   ├── 03-components.md
│   ├── 04-layout.md
│   ├── 05-auth.md
│   ├── 06-dashboard.md
│   ├── 07-registrar-venda.md
│   ├── 08-vendas.md
│   ├── 09-clientes.md
│   ├── 10-empresa.md
│   ├── 11-notificacoes.md
│   └── 12-pwa.md
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Home/Dashboard
│   │   │   ├── registrar-venda/
│   │   │   │   └── page.tsx
│   │   │   ├── vendas/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── empresa/
│   │   │   │   └── page.tsx
│   │   │   └── notificacoes/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # Componentes base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Avatar.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── RecentSales.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── sales/
│   │   │   ├── SaleCard.tsx
│   │   │   ├── SalesList.tsx
│   │   │   └── SaleDetail.tsx
│   │   ├── customers/
│   │   │   ├── CustomerCard.tsx
│   │   │   ├── CustomersList.tsx
│   │   │   └── CustomerDetail.tsx
│   │   ├── register-sale/
│   │   │   ├── QRScanner.tsx
│   │   │   ├── CPFInput.tsx
│   │   │   ├── CustomerPreview.tsx
│   │   │   ├── SaleForm.tsx
│   │   │   └── SaleConfirmation.tsx
│   │   └── Logo.tsx
│   ├── constants/
│   │   └── theme.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── formatters.ts
│   │   └── supabase.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSales.ts
│   │   ├── useCustomers.ts
│   │   └── useNotifications.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── sale.ts
│   │   ├── customer.ts
│   │   ├── notification.ts
│   │   └── store.ts
│   └── assets/
│       └── icons/
├── public/
│   ├── icons/                      # Ícones PWA
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── manifest.json
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Next.js | 14+ | Framework React com App Router |
| TypeScript | 5+ | Tipagem estática |
| Tailwind CSS | 3+ | Estilização |
| Lucide React | Latest | Ícones |
| Zustand | 4+ | Gerenciamento de estado |
| Zod | 3+ | Validação de schemas |
| React Hook Form | 7+ | Gerenciamento de formulários |
| Supabase | Latest | Backend/Database |
| next-pwa | Latest | Progressive Web App |
| html5-qrcode | Latest | Scanner de QR Code |

---

## Fases de Implementação

### Fase 1: Fundação (Etapas 01-04)
**Objetivo:** Configurar o projeto e criar a base visual

- [ ] Setup do projeto Next.js com TypeScript
- [ ] Configuração do Tailwind CSS com tema customizado
- [ ] Implementação do Design System (cores, fontes, espaçamentos)
- [ ] Criação de componentes UI base (Button, Input, Card, etc.)
- [ ] Implementação do Layout (Sidebar, Header, Mobile Nav)

**Entregável:** Estrutura básica do app com navegação funcionando

---

### Fase 2: Autenticação (Etapa 05)
**Objetivo:** Sistema de login e proteção de rotas

- [ ] Tela de Login
- [ ] Integração com Supabase Auth
- [ ] Contexto de autenticação
- [ ] Middleware de proteção de rotas
- [ ] Tratamento de erros de autenticação

**Entregável:** Sistema de login funcional

---

### Fase 3: Dashboard e Funcionalidades Core (Etapas 06-07)
**Objetivo:** Implementar as telas principais

- [ ] Dashboard com métricas
- [ ] Cards de estatísticas
- [ ] Vendas recentes
- [ ] Fluxo completo de Registrar Venda
- [ ] Scanner de QR Code
- [ ] Busca por CPF
- [ ] Confirmação de venda

**Entregável:** Dashboard e registro de vendas funcionando

---

### Fase 4: Históricos e Listagens (Etapas 08-09)
**Objetivo:** Telas de consulta

- [ ] Histórico de vendas com filtros
- [ ] Detalhes da venda
- [ ] Lista de clientes com busca
- [ ] Detalhes do cliente (somente leitura)
- [ ] Paginação/infinite scroll

**Entregável:** Consultas de vendas e clientes

---

### Fase 5: Configurações e Finalização (Etapas 10-12)
**Objetivo:** Completar o app

- [ ] Tela de dados da empresa
- [ ] Configurações de cashback
- [ ] Central de notificações
- [ ] Configuração PWA
- [ ] Service Worker
- [ ] Testes finais

**Entregável:** App completo e instalável

---

## Regras de Negócio Importantes

1. **A loja NÃO PODE editar dados do cliente** - apenas visualização
2. **O saldo do cliente é por loja** - cada loja tem seu próprio saldo
3. **O cashback é calculado sobre o valor pago** (não sobre o valor total se usar saldo)
4. **O saldo usado não gera cashback** - apenas o valor pago
5. **Vendas confirmadas não podem ser canceladas** pelo app (somente suporte)
6. **O QR Code contém dados encriptados** do cliente para identificação

---

## Checklist Geral de Implementação

### Setup
- [ ] Criar projeto Next.js
- [ ] Configurar TypeScript
- [ ] Instalar e configurar Tailwind
- [ ] Configurar Google Fonts (Plus Jakarta Sans)
- [ ] Instalar dependências (Lucide, Zustand, etc.)

### Design System
- [ ] Criar arquivo de constantes (theme.ts)
- [ ] Configurar cores no Tailwind
- [ ] Criar classes utilitárias no globals.css
- [ ] Implementar componente Logo

### Componentes
- [ ] Button (primary, secondary, danger, ghost)
- [ ] Input (com máscaras: CPF, moeda, telefone)
- [ ] SearchInput
- [ ] Card (default, filled, outlined)
- [ ] Badge (dark, success, error, warning)
- [ ] Modal
- [ ] Skeleton
- [ ] Avatar

### Layout
- [ ] Sidebar (desktop)
- [ ] Header (mobile)
- [ ] MobileNav (bottom navigation)
- [ ] Responsividade

### Páginas
- [ ] Login (/login)
- [ ] Dashboard (/)
- [ ] Registrar Venda (/registrar-venda)
- [ ] Histórico de Vendas (/vendas)
- [ ] Detalhes da Venda (/vendas/[id])
- [ ] Lista de Clientes (/clientes)
- [ ] Detalhes do Cliente (/clientes/[id])
- [ ] Dados da Empresa (/empresa)
- [ ] Notificações (/notificacoes)

### Funcionalidades
- [ ] Scanner QR Code
- [ ] Busca por CPF
- [ ] Cálculo de cashback
- [ ] Filtros e ordenação
- [ ] Marcar notificações como lidas
- [ ] Upload de logo da empresa

### PWA
- [ ] Manifest.json
- [ ] Service Worker
- [ ] Ícones (192x192, 512x512)
- [ ] Temas e cores

---

## Cores de Referência Rápida

| Nome | Hex | Uso |
|------|-----|-----|
| primary | #181818 | Cor principal (preto) |
| secondary | #666666 | Texto secundário |
| background | #FFFFFF | Fundo principal |
| inputBackground | #F5F5F5 | Fundo de inputs |
| inputBorder | #E0E0E0 | Bordas |
| text | #181818 | Texto principal |
| textSecondary | #666666 | Texto secundário |
| textMuted | #999999 | Texto suave |
| error | #FF3B30 | Erros |
| success | #34C759 | Sucesso |
| warning | #FF9500 | Avisos |
| star | #FFB800 | Avaliações |
| whatsapp | #25D366 | WhatsApp |

---

## Próximos Passos

1. Começar pelo documento [01-setup.md](./01-setup.md)
2. Seguir a ordem numérica dos documentos
3. Marcar as tarefas concluídas no checklist
4. Testar cada etapa antes de prosseguir

---

**Última atualização:** Janeiro 2026
