

---

# MIBE Business - Especificação Técnica (Painel da Empresa)

## Visão Geral

**Nome:** MIBE Business Dashboard
**Tecnologia:** React Web (Next.js)
**Propósito:** Gestão da operação diária do estabelecimento parceiro. Foco em controle de cashback, validação de transações, gestão de clientes e configurações da loja.

---

## 1. Stack Tecnológica (Aprovada)

* **Framework:** Next.js 14 (App Router)
* **Linguagem:** TypeScript
* **Estilização:** **Tailwind CSS** (Utility-first para rapidez e responsividade)
* **Componentes UI:** Componentes customizados em `components/ui/`
* **Gerenciamento de Estado:** Zustand (Dados da Loja e Sessão do Usuário)
* **Ícones:** `lucide-react`
* **Backend:** Supabase (Auth via `auth.users`, Database, Storage via `@supabase/supabase-js`)
* **Validação:** Zod + React Hook Form
* **Utilitários:** clsx, tailwind-merge, date-fns

---

## 2. Arquitetura de Telas e Funcionalidades

### A. Dashboard Operacional (Home)

* **Resumo Rápido (Cards):** * Cashback emitido (Hoje/Mês).
* Clientes que retornaram (Retenção).
* Saldo disponível para emissão (se houver sistema de pré-pago).


* **Últimas Atividades:** Lista simplificada das últimas 5 transações realizadas na loja.

### B. Gestão de Vendas & Cashback

* **Registro de Venda:** Campo rápido para digitar o CPF do cliente e o valor da compra para aplicar o cashback.
* **Validação de Resgate:** Tela para ler QR Code do cliente ou buscar por CPF para aplicar o resgate do saldo de cashback.
* **Histórico de Movimentações:** Filtros por data e por funcionário que realizou a operação.

### C. Configurações do Estabelecimento (Empresa)

* **Dados da Loja:** Visualização e edição dos dados cadastrados (CNPJ, Nome Fantasia).
* **Regras de Fidelidade:** Visualização da regra ativa (Ex: 5% de cashback em compras acima de R$ 50,00).
* *Nota: Edição limitada para não quebrar regras contratuais sem aviso ao MIBE Admin.*
* **Horários e Contato:** Edição de informações que aparecem para o cliente final no App.
* **Upload de Mídia:** Logo, capa e galeria de fotos do estabelecimento.
* **Avaliações:** Visualização das avaliações dos clientes. A empresa pode responder às avaliações, mas não editar a nota atribuída pelo cliente.
* **Localização:** Mapa interativo (react-leaflet) para definir e editar as coordenadas geográficas do estabelecimento.

### D. Gestão de Clientes

* **Lista de Clientes:** Visualização de todos os clientes que já compraram na loja.
* **Busca e Filtros:** Pesquisa por nome ou CPF.
* **Detalhes do Cliente:** Histórico de compras, saldo de cashback e dados de contato.

### E. Notificações

* **Central de Notificações:** Lista de todas as notificações do sistema.
* **Tipos:** Novas vendas, resgates, alertas do sistema.
* **Marcar como lida:** Controle de notificações lidas/não lidas.

### F. Minha Conta

* **Dados do Usuário:** Visualização e edição do perfil do usuário logado.
* **Alterar Senha:** Modal para troca de senha.
* **Foto de Perfil:** Upload de foto do usuário.
* **Logout:** Confirmação antes de sair.

### G. Onboarding

* **Fluxo Inicial:** Modal guiado exibido ao primeiro acesso após o cadastro para configurar os dados essenciais da loja (nome, categoria, regras de cashback).
* **Flag de Controle:** Campo `onboarding_completed` na tabela `profiles`. Enquanto `false`, o modal é exibido ao entrar no dashboard.
* **Etapas:** Informações básicas → Regras de cashback → Confirmação.

### H. Suporte

* **Central de Ajuda:** Acesso a suporte e FAQ.
* **Contato:** Canais de comunicação com o MIBE.

### I. Planos & Faturas

O sistema de planos é **único** — não há múltiplos planos para escolher. O lojista assina o plano diretamente no app (self-service) para poder registrar vendas. O modelo de cobrança é composto por:

1. **Mensalidade fixa** — valor definido pelo painel ADMIN.
2. **Comissão diária** — percentual sobre o valor total das vendas do dia, também definido pelo ADMIN.

#### Estrutura da aba "Planos"

* **Card de Status do Plano:** plano ativo, data de vencimento da mensalidade e % de comissão vigente.
* **Banner de Conta Bloqueada** (quando aplicável): alerta vermelho com total vencido e CTA para pagar.
* **Lista de Faturas Pendentes/Vencidas:** com checkbox para seleção individual ou em lote.
* **Botão "Pagar Selecionadas":** aparece ao selecionar faturas; exibe o total somado e abre modal de pagamento.
* **Modal de Pagamento:** opções PIX e Cartão de Crédito via **AbacatePay**.
* **Histórico de Faturas Pagas:** lista das faturas quitadas com data, método e valor.

#### Tipos de fatura

| Tipo | Geração | Valor | Vencimento |
|---|---|---|---|
| `MENSALIDADE` | Mensal | Valor fixo (ADMIN) | 7 dias após geração |
| `COMISSAO_DIARIA` | Na 1ª venda do dia; fecha às 00:00 | Σ(valor_venda × % comissão) | 7 dias após geração |

#### Fluxo de inadimplência

* Fatura vencida há **+3 dias** → conta desativada automaticamente (`company.is_active = false`).
* Ao quitar as faturas → conta reativada automaticamente (`company.is_active = true`).

#### Fluxo de registro de venda com gate de plano

```
Lojista tenta registrar venda
        ↓
Tem plano ativo?
  └─ NÃO → Bloquear + CTA para assinar plano
        ↓
Conta ativa? (is_active = true)
  └─ NÃO → Bloquear + CTA para pagar faturas vencidas
        ↓
Venda registrada
        ↓
Fatura COMISSAO_DIARIA aberta para hoje?
  ├─ SIM → Atualizar valor
  └─ NÃO → Criar nova fatura do dia
```

---

## 3. Fluxo de Navegação (Menu Lateral)

```text
MIBE Business
├── [Home] Home
├── [PlusCircle] Registrar Venda (highlight)
├── [Receipt] Histórico de Vendas
├── [Users] Clientes
├── [Building2] Empresa
├── [CreditCard] Planos
├── [Bell] Notificações (badge)
├── ─────────────────────────
├── [MessageCircle] Suporte
├── [User] Minha Conta
└── [LogOut] Sair

```

*Ícones: lucide-react*

---

## 4. Design System (Identidade MIBE)

| Elemento | Token / Valor |
| --- | --- |
| **Primária (Dark)** | `bg-zinc-950` (#09090b) |
| **Destaque (Brand)** | `bg-neutral-900` (#181818) |
| **Sucesso** | `text-emerald-500` |
| **Superfície (Cards)** | `bg-white` com `border-zinc-200` |
| **Tipografia** | Plus Jakarta Sans |

---

## 5. Estrutura de Pastas

```text
src/
├── app/
│   ├── (auth)/              # Autenticação (não requer login)
│   │   ├── login/
│   │   ├── criar-conta/
│   │   ├── esqueci-senha/
│   │   └── redefinir-senha/
│   ├── (dashboard)/         # Layout com Sidebar + Rotas Protegidas
│   │   ├── page.tsx         # Home/Dashboard
│   │   ├── registrar-venda/
│   │   ├── vendas/
│   │   │   └── [id]/
│   │   ├── clientes/
│   │   │   └── [id]/
│   │   ├── empresa/
│   │   ├── planos/
│   │   ├── notificacoes/
│   │   ├── minha-conta/
│   │   └── suporte/
│   ├── offline/             # Página de fallback offline (PWA)
│   ├── politicas/           # Políticas e Termos de Uso
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                  # Componentes base (Button, Input, Card, Modal, etc.)
│   ├── layout/              # Componentes de layout (Sidebar, Header, MobileNav)
│   ├── providers/           # Context providers (AuthProvider)
│   ├── dashboard/           # Componentes do dashboard (StatCard, RecentSales)
│   ├── sales/               # Componentes de vendas (SaleCard, SalesList)
│   ├── customers/           # Componentes de clientes (CustomerCard, CustomersList)
│   ├── empresa/             # Componentes da empresa (LogoUpload, EditStoreModal)
│   ├── plans/               # Componentes de planos (PlanCard, PlanComparison, PaymentHistory)
│   ├── register-sale/       # Componentes de registro de venda (SaleForm, QRScanner)
│   ├── minha-conta/         # Componentes de conta (ChangePasswordModal)
│   ├── notifications/       # Componentes de notificações
│   ├── onboarding/          # Fluxo de configuração inicial (OnboardingModal)
│   └── pwa/                 # Componentes PWA (InstallPrompt)
├── hooks/                   # useAuth, useSales, useCustomers, useNotifications, usePlans
├── lib/                     # Utilitários (formatters, utils)
├── types/                   # TypeScript types (auth, customer, sale, store, plan, user)
├── constants/               # Constantes (theme)
└── middleware.ts            # Middleware de autenticação

```

---

## 6. Regras de Negócio Prioritárias

1. **Segurança de Transação:** O lançamento de cashback exige obrigatoriamente um valor de venda real vinculado.
2. **Limite de Resgate:** O sistema não deve permitir resgates que excedam o saldo de cashback do cliente ou o limite de uso por compra definido no Admin.
3. **Responsividade:** O painel deve ser **Mobile Friendly**, pois muitos donos de estabelecimentos acessam via tablet ou smartphone no balcão.
4. **Gate de Plano:** O lojista só pode registrar vendas se tiver plano ativo **e** conta ativa (`company.is_active = true`).
5. **Bloqueio por Inadimplência:** Faturas vencidas há mais de 3 dias desativam a conta automaticamente. O pagamento das faturas reativa a conta automaticamente.
6. **Comissão sobre valor pago:** A comissão é calculada sobre o valor total da venda, não sobre o cashback gerado.
7. **Fatura diária única:** Um único registro de `COMISSAO_DIARIA` por dia por empresa. Abre na 1ª venda e fecha à meia-noite (00:00).
8. **Dados do cliente são somente leitura:** A loja pode visualizar mas nunca editar dados de clientes.

---

## 7. Especificações PWA (Mobile First)

Para garantir que o painel funcione como um aplicativo instalado, adicionaremos:

* **Manifest:** Configuração do `manifest.json` para definir ícone, cor do tema e modo de exibição `standalone` (sem a barra de endereços do navegador).
* **Service Workers:** Utilização do **Serwist** (substituto moderno do next-pwa) para caching estratégico, permitindo que o app abra instantaneamente mesmo com conexão instável.
* **Offline Support:** Página de fallback caso o lojista perca a conexão no meio de uma consulta.
* **Acesso Rápido:** Implementação de "Web App Install Prompt" para incentivar o lojista a adicionar o ícone à tela de início.

---

## 8. Ajustes de UI (Tailwind + PWA)

Como o foco é o uso no balcão, a interface sofrerá estas adaptações:

* **Touch Targets:** Botões e campos de entrada com altura mínima de `44px` para facilitar o toque.
* **Navegação Mobile:** No celular, o menu lateral se transforma em uma **Bottom Tab Bar** (barra inferior) para facilitar o alcance do polegar.
* **Input Numérico:** Campos de valor monetário utilizam `inputmode="decimal"` para abrir automaticamente o teclado numérico no mobile.

---

## 9. Fluxo de Registro de Venda (Otimizado para PWA)

Considerando o uso mobile no estabelecimento:

1. **Acesso Rápido:** O botão de "Nova Venda" está disponível via QuickActions no dashboard e no menu de navegação inferior (MobileNav) no mobile.
2. **Identificação:** O lojista escaneia o QR Code do cliente ou digita o CPF (com máscara automática).
3. **Valor:** Campo de valor grande e centralizado com teclado numérico automático (`inputmode="decimal"`).
4. **Feedback:** Toast de confirmação visual ao registrar o cashback com sucesso (via sonner).

---

## 10. Dependências do Projeto

### Produção
* `next` ^14.2.0
* `react` / `react-dom` ^18.3.0
* `@supabase/supabase-js` ^2.90.1
* `zustand` ^5.0.10
* `lucide-react` ^0.562.0
* `react-hook-form` ^7.71.1
* `@hookform/resolvers` ^5.2.2
* `zod` ^4.3.5
* `date-fns` ^4.1.0
* `clsx` ^2.1.1
* `tailwind-merge` ^3.4.0
* `sonner` (Toasts de notificação)
* `html5-qrcode` ^2.3.8 (Scanner de QR Code)
* `react-leaflet` (Mapa interativo de localização da loja)
* `bcryptjs` (Hashing de senhas, server-side)
* `serwist` (Service Workers / PWA — substituto do next-pwa)
* `abacatepay-nodejs` (Gateway de pagamento AbacatePay)

### Desenvolvimento
* `typescript` ^5.4.0
* `tailwindcss` ^3.4.0
* `eslint` / `eslint-config-next`

---

## 11. Comandos Úteis de Desenvolvimento

### NPM
```bash
npm install            # instalar dependências
npm run dev            # servidor de desenvolvimento (http://localhost:3000)
npm run build          # build de produção
npm run start          # iniciar servidor de produção
npm run lint           # verificar código
npm run lint -- --fix  # corrigir automaticamente
```

### Supabase
```bash
supabase login
supabase gen types typescript --project-id "uipvhxgjaungdetwojou" --schema public > src/types/database.ts
supabase start   # supabase local
supabase stop
supabase status
```

### Git
```bash
git status
git add <arquivos>
git commit -m "mensagem"
git push
git checkout -b nome-da-branch
git merge nome-da-branch
```

### Debugging
```bash
rm -rf .next                                           # limpar cache do Next.js
rm -rf node_modules package-lock.json && npm install  # reinstalar dependências
npx next info                                         # informações do Next.js
```

### PWA (só funciona em produção)
```bash
npm run build && npm run start
```

### Portas em uso (Windows)
```bash
netstat -ano | findstr :3000
taskkill /PID [número] /F
```
