

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
* **Backend:** Supabase (Auth, Database, Storage via `@supabase/ssr`)
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
* **Validação de Resgate:** Tela para ler QR Code ou digitar código de autorização para o cliente usar o saldo.
* **Histórico de Movimentações:** Filtros por data e por funcionário que realizou a operação.

### C. Configurações do Estabelecimento (Empresa)

* **Dados da Loja:** Visualização e edição dos dados cadastrados (CNPJ, Nome Fantasia).
* **Regras de Fidelidade:** Visualização da regra ativa (Ex: 5% de cashback em compras acima de R$ 50,00).
* *Nota: Edição limitada para não quebrar regras contratuais sem aviso ao MIBE Admin.*
* **Horários e Contato:** Edição de informações que aparecem para o cliente final no App.
* **Upload de Mídia:** Logo, capa e galeria de fotos do estabelecimento.
* **Avaliações:** Visualização das avaliações dos clientes.

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

### G. Suporte

* **Central de Ajuda:** Acesso a suporte e FAQ.
* **Contato:** Canais de comunicação com o MIBE.

### H. Planos & Assinatura

* **Plano Atual:** Card destacado com o plano ativo, mostrando nome, preço mensal e limite de clientes.
* **Uso de Clientes:** Barra de progresso visual indicando `current_profile_count / user_limit`. Muda de cor ao se aproximar do limite (verde → amarelo → vermelho).
* **Excedentes:** Caso o limite seja ultrapassado, exibe quantidade de perfis excedentes e o valor adicional cobrado (`excess_profiles × excess_user_fee`).
* **Listagem de Planos:** Cards comparativos lado a lado com todos os planos disponíveis (`is_active = true`), destacando o plano atual. Informações: nome, descrição, preço, limite de usuários e taxa de excedente.
* **Troca de Plano:** Botão para selecionar um novo plano, com modal de confirmação mostrando o impacto (novo limite, recálculo de excedentes).
* **Histórico de Pagamentos:** Tabela com faturas mensais da assinatura, exibindo: mês de referência, valor base, valor excedente, total, data de vencimento e status (Pendente / Pago / Falhou / Reembolsado).
* **Status da Assinatura:** Badge indicando o status (`active`, `overdue`, `cancelled`). Se `overdue`, exibir alerta visual com orientação de regularização.
* *Nota: A troca de plano pela loja é registrada e o recálculo de excedentes é automático (via triggers no banco). O processamento do pagamento será integrado com gateway externo em fase futura.*

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
│   ├── (auth)/              # Login / Recuperação de Senha
│   │   ├── login/
│   │   └── esqueci-senha/
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
│   └── notifications/       # Componentes de notificações
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
4. **Limite de Plano:** Empresas com assinatura `cancelled` não podem registrar novas vendas. Empresas com status `overdue` recebem alertas visuais mas continuam operando.
5. **Cálculo de Excedentes:** O controle de perfis excedentes é automático via triggers no banco de dados. Ao surgir um novo cliente ou ao trocar de plano, os valores são recalculados instantaneamente.

---

## 7. Especificações PWA (Mobile First)

Para garantir que o painel funcione como um aplicativo instalado, adicionaremos:

* **Manifest:** Configuração do `manifest.json` para definir ícone, cor do tema e modo de exibição `standalone` (sem a barra de endereços do navegador).
* **Service Workers:** Utilização do `next-pwa` para caching estratégico, permitindo que o app abra instantaneamente mesmo com conexão instável.
* **Offline Support:** Página de fallback caso o lojista perca a conexão no meio de uma consulta.
* **Acesso Rápido:** Implementação de "Web App Install Prompt" para incentivar o lojista a adicionar o ícone à tela de início.

---

## 8. Ajustes de UI (Tailwind + PWA)

Como o foco é o uso no balcão, a interface sofrerá estas adaptações:

* **Touch Targets:** Botões e campos de entrada com altura mínima de `44px` para facilitar o toque.
* **Navegação Mobile:** No celular, o menu lateral se transforma em uma **Bottom Tab Bar** (barra inferior) para facilitar o alcance do polegar.
* **Input Numérico:** O campo de valor da venda abrirá automaticamente o teclado numérico (`inputmode="decimal"`) para agilizar a operação.

---

## 9. Fluxo de Registro de Venda (Otimizado para PWA)

Considerando o uso mobile no estabelecimento:

1. **Acesso Rápido:** O botão de "Nova Venda" será um **FAB (Floating Action Button)** no canto inferior direito.
2. **Identificação:** O lojista digita o CPF (com máscara automática).
3. **Valor:** Campo de valor grande e centralizado.
4. **Feedback:** Notificação sonora ou hápica (vibração) ao confirmar o sucesso do cashback (usando a WebVitals API).

---

## 10. Dependências do Projeto

### Produção
* `next` ^14.2.0
* `react` / `react-dom` ^18.3.0
* `@supabase/ssr` ^0.8.0
* `@supabase/supabase-js` ^2.90.1
* `zustand` ^5.0.10
* `lucide-react` ^0.562.0
* `react-hook-form` ^7.71.1
* `@hookform/resolvers` ^5.2.2
* `zod` ^4.3.5
* `date-fns` ^4.1.0
* `clsx` ^2.1.1
* `tailwind-merge` ^3.4.0
* `html5-qrcode` ^2.3.8 (Scanner de QR Code)
* `next-pwa` ^5.6.0

### Desenvolvimento
* `typescript` ^5.4.0
* `tailwindcss` ^3.4.0
* `eslint` / `eslint-config-next`

---

