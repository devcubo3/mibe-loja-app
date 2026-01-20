# MIBE Store Web App

Aplicativo web responsivo (PWA) para empresas/lojas parceiras do sistema MIBE de cashback.

## 📋 Sobre o Projeto

O MIBE Store é um painel web onde empresas gerenciam suas vendas, clientes e visualizam métricas do sistema de cashback MIBE. O aplicativo segue exatamente o mesmo design system do app mobile do cliente para manter consistência visual.

### Principais Funcionalidades

- ✅ Dashboard com métricas em tempo real
- ✅ Registro de vendas via QR Code ou CPF
- ✅ Histórico de vendas com filtros avançados
- ✅ Gerenciamento de clientes (visualização)
- ✅ Configurações da empresa e cashback
- ✅ Central de notificações em tempo real
- ✅ PWA instalável e offline-first

## 🚀 Tecnologias

- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Fonte:** Plus Jakarta Sans
- **Estado:** Zustand
- **Validação:** Zod + React Hook Form
- **Backend:** Supabase
- **PWA:** next-pwa

## 📁 Estrutura do Projeto

```
mibe-loja-app/
├── docs/                          # Documentação de implementação
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
│   ├── app/                       # Next.js App Router
│   ├── components/                # Componentes React
│   ├── constants/                 # Constantes (theme.ts)
│   ├── lib/                       # Utilitários
│   ├── hooks/                     # Custom hooks
│   ├── types/                     # TypeScript types
│   └── assets/                    # Assets estáticos
├── public/                        # Arquivos públicos
└── docs/                          # Documentação
```

## 🎨 Design System

### Cores Principais

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | `#181818` | Cor principal (preto) |
| Secondary | `#666666` | Texto secundário |
| Success | `#34C759` | Sucesso/Cashback |
| Error | `#FF3B30` | Erro/Despesas |
| Warning | `#FF9500` | Avisos |

### Tipografia

- **Fonte:** Plus Jakarta Sans (Google Fonts)
- **Pesos:** 400 (Regular), 500 (Medium), 600 (Semi Bold), 700 (Bold)

## 📖 Documentação

A documentação completa está organizada em etapas numeradas na pasta [docs/](./docs/):

1. **[Setup Inicial](./docs/01-setup.md)** - Configuração do projeto
2. **[Design System](./docs/02-design-system.md)** - Cores, fontes e estilos
3. **[Componentes UI](./docs/03-components.md)** - Componentes reutilizáveis
4. **[Layout](./docs/04-layout.md)** - Sidebar, Header, Mobile Nav
5. **[Autenticação](./docs/05-auth.md)** - Sistema de login
6. **[Dashboard](./docs/06-dashboard.md)** - Página inicial
7. **[Registrar Venda](./docs/07-registrar-venda.md)** - Fluxo de venda
8. **[Histórico de Vendas](./docs/08-vendas.md)** - Listagem de vendas
9. **[Clientes](./docs/09-clientes.md)** - Gerenciamento de clientes
10. **[Empresa](./docs/10-empresa.md)** - Configurações da empresa
11. **[Notificações](./docs/11-notificacoes.md)** - Central de notificações
12. **[PWA](./docs/12-pwa.md)** - Progressive Web App

**Comece por:** [00-ROTEIRO-IMPLEMENTACAO.md](./docs/00-ROTEIRO-IMPLEMENTACAO.md)

## 🛠️ Como Usar

### 1. Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre na pasta
cd mibe-loja-app

# Instale as dependências
npm install
```

### 2. Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Executar

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🗄️ Banco de Dados

O projeto utiliza Supabase como backend. Tabelas necessárias:

- `stores` - Dados das lojas
- `customers` - Dados dos clientes
- `customer_balances` - Saldos por loja
- `sales` - Vendas registradas
- `notifications` - Notificações

Scripts SQL estão disponíveis em cada documento de implementação.

## 🔐 Regras de Negócio

1. **A loja NÃO PODE editar dados do cliente** - apenas visualização
2. **O saldo do cliente é por loja** - cada loja tem seu próprio saldo
3. **O cashback é calculado sobre o valor pago** (não sobre o valor total se usar saldo)
4. **O saldo usado não gera cashback** - apenas o valor pago
5. **Vendas confirmadas não podem ser canceladas** pelo app (somente suporte)

## 📱 Responsividade

- **Desktop (> 1024px):** Layout completo com sidebar
- **Tablet (768px - 1024px):** Sidebar colapsada
- **Mobile (< 768px):** Header + Bottom Navigation

## 🎯 Roadmap de Implementação

- [x] Setup do projeto
- [x] Design System
- [x] Componentes UI base
- [x] Layout e navegação
- [x] Autenticação
- [x] Dashboard
- [x] Registro de vendas
- [x] Histórico de vendas
- [x] Gerenciamento de clientes
- [x] Configurações da empresa
- [x] Notificações
- [x] PWA

## 🤝 Contribuindo

1. Siga o padrão de código estabelecido
2. Mantenha consistência com o design system
3. Documente novas funcionalidades
4. Teste em diferentes dispositivos

## 📄 Licença

Este projeto é proprietário da MIBE.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do WhatsApp integrado no app.

---

**Versão:** 1.0.0
**Última atualização:** Janeiro 2026
