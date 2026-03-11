
📘 Diretrizes de Desenvolvimento: Projeto Mibe (Fidelidade & Cashback)
1. Visão Geral do Sistema
O Mibe é um ecossistema de cashback operando em um modelo B2B2C.

Super Admin: Gerencia o app, planos, mensalidade e comissão global.

Empresas (Lojistas): Configuram regras de fidelidade e registram vendas.

Clientes (Usuários): Acumulam saldo por empresa e utilizam para descontos.

2. Arquitetura de Dados (Supabase/PostgreSQL)
O banco de dados foi projetado para garantir integridade financeira. As tabelas principais são:

A. Núcleo de Identidade
profiles: Extensão da tabela auth.users. Contém CPF (único), nome completo e o role (super_admin, company_owner, client). Usado para clientes finais e admins do sistema.

companies: Dados cadastrais (CNPJ) e as Regras de Negócio (porcentagem de cashback, valor mínimo de compra, dias para expiração). Possui o campo `is_active` (BOOLEAN, default true) que controla se a empresa pode operar — desativado automaticamente em caso de inadimplência.

company_users: Usuários vinculados a um estabelecimento específico. Utilizam o app da empresa para operações. Estrutura:
- id (UUID, PK)
- company_id (FK → companies)
- name (VARCHAR) - Nome completo
- email (VARCHAR) - Único por empresa, pode ser fictício
- password_hash (VARCHAR) - Hash bcrypt para autenticação customizada
- role (VARCHAR) - 'owner', 'manager', 'employee' (para expansão futura de permissões)
- permissions (JSONB, nullable) - Permissões granulares para expansão futura
- is_active (BOOLEAN, default true) - Status do usuário
- created_at, updated_at (TIMESTAMP)

> **Importante:** `company_users` é separado de `profiles`. Clientes finais usam `profiles` via Supabase Auth. Usuários de estabelecimento usam `company_users` com autenticação customizada, permitindo emails fictícios.

B. Núcleo Financeiro (O Coração)
cashback_balances: Tabela de saldo consolidado. Existe uma linha para cada relação Cliente x Empresa. O saldo é por empresa, não global.

transactions: Registro imutável de cada operação. Armazena o valor total, o resgate aplicado, o valor líquido pago e o cashback gerado.

C. Núcleo de Gestão

app_configs: Armazena configurações globais do sistema definidas pelo Super Admin.

D. Núcleo de Planos & Assinaturas

plans: Define o plano de assinatura disponível para as empresas. O sistema opera com um plano único configurado pelo Admin. Estrutura:
- id (UUID, PK)
- name (TEXT) - Nome do plano
- monthly_price (NUMERIC) - Mensalidade fixa do plano
- commission_percent (NUMERIC) - Percentual de comissão cobrado sobre o valor total das vendas diárias
- description (TEXT, nullable) - Descrição do plano
- is_active (BOOLEAN, default true) - Se o plano está disponível para contratação
- created_at, updated_at (TIMESTAMP)

subscriptions: Assinatura ativa de cada empresa. Relaciona empresa ao plano contratado. Estrutura:
- id (UUID, PK)
- company_id (FK → companies) - Empresa assinante
- plan_id (FK → plans) - Plano contratado
- status (TEXT) - 'active', 'overdue' ou 'cancelled'
- started_at (TIMESTAMP) - Data de início da assinatura
- created_at, updated_at (TIMESTAMP)

> **Importante:** O status da assinatura (`overdue`/`cancelled`) reflete inadimplência, mas é o campo `companies.is_active` que efetivamente bloqueia as operações da empresa.

payment_history: Registro de faturas e pagamentos vinculados à assinatura. Estrutura:
- id (UUID, PK)
- subscription_id (FK → subscriptions) - Assinatura relacionada
- type (VARCHAR) - 'MENSALIDADE' ou 'COMISSAO_DIARIA'
- amount (NUMERIC) - Valor total da fatura
- status (VARCHAR) - 'pending', 'paid', 'failed' ou 'refunded'
- due_date (DATE) - Data de vencimento (7 dias após geração)
- payment_date (TIMESTAMP, nullable) - Data efetiva do pagamento
- commission_date (DATE, nullable) - Para COMISSAO_DIARIA: data do dia de vendas ao qual a fatura se refere
- gateway_reference (VARCHAR, nullable) - Referência do gateway de pagamento externo (AbacatePay)
- created_at (TIMESTAMP)

3. Regras de Negócio Cruciais (Lógica de Implementação)
3.1. A Regra de Ouro do Cashback
O cálculo do cashback acumulado NUNCA deve ser feito sobre o valor total se houver resgate.

Fórmula: cashback_earned = (total_amount - cashback_redeemed) * (company_cashback_percent / 100)

O cliente só ganha crédito sobre o dinheiro "novo" que entra na loja.

3.2. Fluxo de Expiração (Janela Deslizante)
A expiração não é uma data fixa, mas sim baseada em inatividade.

Toda nova compra (transaction) deve atualizar o campo last_purchase_date na tabela cashback_balances.

Se o cliente ficar X dias sem comprar na empresa Y, o saldo dele naquela empresa deve ser zerado.

3.3. Modelo de Cobrança (Mensalidade + Comissão Diária)
A monetização da empresa é composta por dois tipos de fatura:

**MENSALIDADE:** Fatura mensal com valor fixo definido no plano (`plans.monthly_price`). Gerada uma vez por mês. Vencimento em 7 dias após a geração.

**COMISSAO_DIARIA:** Fatura diária gerada automaticamente na primeira venda do dia. O valor é acumulado ao longo do dia conforme novas vendas são registradas. Fecha à meia-noite (00:00). Vencimento em 7 dias após o fechamento.

Fórmula da comissão: `commission_amount = total_amount_da_venda × (plans.commission_percent / 100)`

Regra de unicidade: Existe no máximo **um** registro de `COMISSAO_DIARIA` por empresa por dia. A cada nova venda, o campo `amount` desse registro é atualizado (acumulado).

3.4. Fluxo de Registro de Venda com Gate de Plano
Antes de registrar uma venda, o sistema deve verificar:

```
Lojista tenta registrar venda
        ↓
Tem assinatura ativa? (subscriptions.status = 'active')
  └─ NÃO → Bloquear + CTA para assinar plano
        ↓
Conta ativa? (companies.is_active = true)
  └─ NÃO → Bloquear + CTA para pagar faturas vencidas
        ↓
Venda registrada
        ↓
Fatura COMISSAO_DIARIA aberta para hoje?
  ├─ SIM → Atualizar amount (acumular comissão)
  └─ NÃO → Criar nova fatura do dia (status: pending)
```

3.5. Fluxo de Assinatura
Toda empresa deve ter uma assinatura ativa vinculada a um plano para operar.

Criação: A empresa assina o plano pelo próprio app (self-service). Ao criar a assinatura, o status inicia como `active`.

Status: Uma assinatura pode estar `active` (operação normal), `overdue` (pagamento atrasado) ou `cancelled` (operação bloqueada).

3.6. Fluxo de Inadimplência e Bloqueio
O controle de inadimplência é baseado no vencimento das faturas em `payment_history`:

1. Fatura com status `pending` e `due_date` ultrapassado → entra em atraso.
2. Fatura vencida há **mais de 3 dias** sem pagamento → `companies.is_active` é definido como `false` automaticamente (via job agendado ou trigger).
3. Ao quitar todas as faturas pendentes/vencidas (status `paid`) → `companies.is_active` é restaurado para `true` automaticamente.
4. A assinatura é marcada como `overdue` enquanto houver faturas vencidas e `cancelled` apenas por ação manual do Admin.

3.7. Processamento de Pagamento
O pagamento é processado via gateway **AbacatePay**. O sistema:
1. Cria a cobrança no AbacatePay ao gerar a fatura (PIX via `/pixQrCode/create`, Cartão via `/billing/create`).
2. Recebe confirmação via webhook do AbacatePay (evento `billing.paid`).
3. Ao confirmar pagamento: atualiza `payment_history.status = 'paid'`, preenche `payment_date` e `gateway_reference`.
4. Se falhar: `status = 'failed'` e a assinatura pode ser marcada como `overdue`.
5. Ao quitar todas as pendências: `companies.is_active = true` e `subscriptions.status = 'active'`.

4. Padrões de Desenvolvimento Exigidos
4.1. Segurança (RLS - Row Level Security)
Clientes: Só podem ler seus próprios profiles, seus cashback_balances e suas transactions.

Empresas: Só podem ler/editar dados vinculados ao seu owner_id. Podem ler profiles de clientes apenas via busca por CPF ou QR Code.

Usuários de Estabelecimento (company_users):
- Leitura: Apenas usuários do próprio estabelecimento ou Admin do MIBE.
- Inserção/Atualização: Admin do MIBE ou owner do estabelecimento (via app empresa).
- Deleção: Soft delete (is_active = false) pelo Admin ou owner.

Admin: Acesso total via políticas de bypass ou funções específicas.

Planos (plans):
- Leitura: Todos os usuários autenticados podem ler (`plans_select_all`).
- Inserção/Atualização/Deleção: Somente `super_admin`.

Assinaturas (subscriptions):
- Leitura: O `owner` da empresa (`subscriptions_select_owner` via `companies.owner_id = auth.uid()`) ou `super_admin`.
- Inserção/Atualização: Somente `super_admin`. A assinatura pelo lojista é feita via API route com service role.

Histórico de Pagamentos (payment_history):
- Leitura: O `owner` da empresa (`payment_history_select_owner` via `subscriptions → companies.owner_id`) ou `super_admin`.
- Inserção/Atualização: Somente `super_admin` ou via API route com service role (geração automática de faturas).

4.2. Integridade
Sempre use Transactions (DB) ao registrar uma compra. A inserção na tabela transactions, a atualização na cashback_balances e a atualização/criação da fatura COMISSAO_DIARIA devem ocorrer juntas ou falhar juntas.

Triggers: O cálculo da taxa administrativa (admin_fee_amount) deve ser automatizado via Trigger para evitar erros no front-end.

Triggers de Assinatura:
- `update_subscriptions_updated_at` / `update_plans_updated_at`: Atualizam o campo `updated_at` automaticamente.
- `check_company_inadimplencia` (AFTER INSERT/UPDATE em `payment_history`): Ao marcar todas as faturas vencidas como `paid`, atualiza `companies.is_active = true` e `subscriptions.status = 'active'`.

Avaliações: Um cliente só pode avaliar uma empresa uma única vez (UPSERT). A empresa pode responder, mas não editar a nota do cliente.
