'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Building2,
  Bell,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Sparkles,
  Plus,
  PlusCircle,
  Wallet,
  Star,
  Home,
  Receipt,
  MoreHorizontal,
  Lock,
  Pencil,
  Search,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface OnboardingModalProps {
  isOpen: boolean;
  userName: string;
  onComplete: () => void;
  onSkip: () => void;
}

// ─── Dados dos slides ───────────────────────────────────────
const SLIDES = [
  {
    id: 'welcome',
    icon: Sparkles,
    iconBg: 'bg-primary',
    title: 'Bem-vindo ao MIBE!',
    subtitle: 'Vamos te mostrar como funciona o painel da sua empresa',
    mockup: null,
    features: [
      'Gerencie vendas e cashback',
      'Acompanhe seus clientes',
      'Configure sua empresa',
    ],
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    iconBg: 'bg-[#7C3AED]',
    title: 'Dashboard',
    subtitle: 'Sua visão geral do negócio em tempo real',
    mockup: 'dashboard',
    features: [
      'Vendas e receita do dia com comparativo',
      'Cashback distribuído aos clientes',
      'Ação rápida para registrar nova venda',
    ],
  },
  {
    id: 'register-sale',
    icon: ShoppingBag,
    iconBg: 'bg-success',
    title: 'Registrar Venda',
    subtitle: 'Registre vendas e gere cashback automaticamente',
    mockup: 'register-sale',
    features: [
      'Escaneie QR Code ou digite o CPF do cliente',
      'Visualize o saldo de cashback disponível',
      'O sistema calcula tudo automaticamente',
    ],
  },
  {
    id: 'sales',
    icon: TrendingUp,
    iconBg: 'bg-[#3B82F6]',
    title: 'Vendas',
    subtitle: 'Histórico completo de todas as suas vendas',
    mockup: 'sales',
    features: [
      'Busque por nome ou CPF do cliente',
      'Filtre por período (hoje, semana, mês)',
      'Veja total de vendas e valor acumulado',
    ],
  },
  {
    id: 'customers',
    icon: Users,
    iconBg: 'bg-[#F59E0B]',
    title: 'Clientes',
    subtitle: 'Todos os clientes que já compraram na sua loja',
    mockup: 'customers',
    features: [
      'Lista com saldo de cashback de cada cliente',
      'Ordene por mais recentes ou maior saldo',
      'Busca rápida por nome ou CPF',
    ],
  },
  {
    id: 'company',
    icon: Building2,
    iconBg: 'bg-[#EC4899]',
    title: 'Minha Empresa',
    subtitle: 'Configure os dados e aparência da sua loja',
    mockup: 'company',
    features: [
      'Adicione logo, capa e galeria de fotos',
      'Configure % de cashback e validade',
      'Edite dados como descrição e categoria',
    ],
  },
  {
    id: 'notifications',
    icon: Bell,
    iconBg: 'bg-[#EF4444]',
    title: 'Notificações',
    subtitle: 'Fique por dentro de tudo que acontece',
    mockup: 'notifications',
    features: [
      'Novas vendas e uso de cashback',
      'Marque como lida individualmente',
      'Separação entre lidas e não lidas',
    ],
  },
];

// ─── Bottom Nav real ────────────────────────────────────────
function MockBottomNav({ active }: { active: string }) {
  const items = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: Receipt, label: 'Vendas', id: 'sales' },
    { icon: PlusCircle, label: 'Venda', id: 'register', isMain: true },
    { icon: Users, label: 'Clientes', id: 'customers' },
    { icon: MoreHorizontal, label: 'Menu', id: 'menu' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[42px] bg-white border-t border-gray-100 flex items-center justify-around px-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;

        if (item.isMain) {
          return (
            <div key={item.id} className="flex flex-col items-center -mt-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-[4px] font-medium text-primary mt-0.5">{item.label}</span>
            </div>
          );
        }

        return (
          <div key={item.id} className="flex flex-col items-center gap-0.5">
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
            <span className={`text-[4px] font-medium ${isActive ? 'text-primary' : 'text-text-muted'}`}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mockup do celular ──────────────────────────────────────
function PhoneMockup({ slide }: { slide: string }) {
  const activeNav: Record<string, string> = {
    dashboard: 'home',
    'register-sale': 'register',
    sales: 'sales',
    customers: 'customers',
    company: 'menu',
    notifications: 'menu',
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="mx-auto w-[200px] h-[360px] bg-white rounded-[24px] border-[3px] border-[#1a1a1a] shadow-xl overflow-hidden relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#1a1a1a] rounded-b-lg z-10" />

        {/* Status bar */}
        <div className="h-5 bg-white flex items-center justify-between px-3 pt-1">
          <span className="text-[6px] font-semibold">9:41</span>
          <div className="flex gap-0.5 items-center">
            <div className="w-2 h-2 border border-gray-400 rounded-sm relative">
              <div className="absolute inset-[1px] bg-gray-400 rounded-[1px]" style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-2.5 pb-[46px] h-[calc(100%-20px)] overflow-hidden bg-[#FAFAFA]">
          {slide === 'dashboard' && <DashboardMock />}
          {slide === 'register-sale' && <RegisterSaleMock />}
          {slide === 'sales' && <SalesMock />}
          {slide === 'customers' && <CustomersMock />}
          {slide === 'company' && <CompanyMock />}
          {slide === 'notifications' && <NotificationsMock />}
        </div>

        {/* Bottom Nav */}
        <MockBottomNav active={activeNav[slide] || 'home'} />
      </div>
      <span className="text-[10px] text-text-muted italic">Imagem ilustrativa</span>
    </div>
  );
}

// ─── Dashboard Mock ─────────────────────────────────────────
function DashboardMock() {
  return (
    <div className="space-y-2 pt-1">
      {/* Greeting */}
      <div>
        <div className="text-[9px] font-bold text-primary">Bom dia, João!</div>
        <div className="text-[5px] text-text-muted">Aqui está o resumo do seu dia</div>
      </div>

      {/* Stat Cards */}
      <div className="space-y-1.5">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[5px] text-text-muted mb-0.5">Vendas Hoje</div>
              <div className="text-[10px] font-bold text-primary">12</div>
            </div>
            <div className="w-6 h-6 bg-[#F3E8FF] rounded-md flex items-center justify-center">
              <ShoppingBag className="w-3 h-3 text-[#7C3AED]" />
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-gray-50 flex items-center gap-0.5">
            <TrendingUp className="w-2 h-2 text-success" />
            <span className="text-[4px] text-success font-medium">+25%</span>
            <span className="text-[4px] text-text-muted">vs ontem</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[5px] text-text-muted mb-0.5">Receita</div>
                <div className="text-[8px] font-bold text-primary">R$ 1.580</div>
              </div>
              <div className="w-5 h-5 bg-[#DCFCE7] rounded-md flex items-center justify-center">
                <TrendingUp className="w-2.5 h-2.5 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[5px] text-text-muted mb-0.5">Cashback</div>
                <div className="text-[8px] font-bold text-primary">R$ 158</div>
              </div>
              <div className="w-5 h-5 bg-[#FFF3E0] rounded-md flex items-center justify-center">
                <Wallet className="w-2.5 h-2.5 text-[#FF9500]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="bg-primary rounded-lg p-2 flex items-center gap-2">
        <div className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[7px] text-white font-semibold flex items-center gap-1">
            Registrar Nova Venda <Sparkles className="w-2 h-2 text-[#FFB800]" />
          </div>
          <div className="text-[5px] text-white/70">Adicione uma venda e gere cashback</div>
        </div>
      </div>

      {/* Recent Sales */}
      <div>
        <div className="text-[7px] font-semibold text-primary mb-1">Vendas Recentes</div>
        {['Maria Silva', 'João Santos', 'Ana Lima'].map((name, i) => (
          <div key={i} className="flex items-center gap-1.5 py-1 border-b border-gray-50 last:border-0">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <span className="text-[5px] text-white font-bold">{name[0]}{name.split(' ')[1]?.[0]}</span>
            </div>
            <div className="flex-1">
              <div className="text-[6px] font-medium text-primary">{name}</div>
              <div className="text-[4px] text-text-muted">Há {i + 1}h · Cashback R$ {(i + 1) * 8}</div>
            </div>
            <div className="text-[6px] font-bold text-primary">R$ {[80, 125, 45][i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Registrar Venda Mock ───────────────────────────────────
function RegisterSaleMock() {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-1.5">
        <ArrowLeft className="w-3 h-3 text-primary" />
        <div className="text-[9px] font-bold text-primary">Registrar Venda</div>
      </div>

      {/* QR Scanner area */}
      <div className="bg-white rounded-lg p-2 shadow-sm">
        <div className="bg-[#1a1a1a] rounded-md h-20 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-14 h-14 border-2 border-white/40 rounded-lg relative">
            <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-white rounded-tl" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-white rounded-tr" />
            <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-white rounded-bl" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-white rounded-br" />
          </div>
          <div className="text-[5px] text-white/70 mt-1">Aponte para o QR Code</div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[5px] text-text-muted">ou</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* CPF Input */}
      <div className="bg-white rounded-lg p-2 shadow-sm">
        <div className="text-[5px] text-text-muted mb-1">CPF do cliente</div>
        <div className="bg-[#F5F5F5] rounded-md p-1.5 flex items-center gap-1">
          <Search className="w-2.5 h-2.5 text-text-muted" />
          <div className="text-[6px] text-text-muted">000.000.000-00</div>
        </div>
        <div className="bg-primary rounded-md p-1.5 text-center mt-1.5">
          <div className="text-[6px] text-white font-semibold">Buscar</div>
        </div>
      </div>
    </div>
  );
}

// ─── Vendas Mock ────────────────────────────────────────────
function SalesMock() {
  return (
    <div className="space-y-2 pt-1">
      <div className="text-[9px] font-bold text-primary">Histórico de Vendas</div>

      <div className="bg-[#F5F5F5] rounded-md p-1.5 flex items-center gap-1 border border-[#E0E0E0]">
        <Search className="w-2.5 h-2.5 text-text-muted" />
        <div className="text-[5px] text-text-muted">Buscar por cliente ou CPF...</div>
      </div>

      <div className="flex gap-1">
        <div className="bg-primary rounded-full px-2 py-0.5 text-[4px] text-white font-medium">Todas</div>
        <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-full px-2 py-0.5 text-[4px] text-text-muted">Este mês</div>
        <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-full px-2 py-0.5 text-[4px] text-text-muted">Recentes</div>
      </div>

      <div className="flex justify-between text-[4px] text-text-muted">
        <span>Mostrando 8 de 24 vendas</span>
        <span className="font-medium text-primary">Total: R$ 2.450,00</span>
      </div>

      {[
        { name: 'Maria Silva', time: '14:32', value: 'R$ 120', cashback: 'R$ 12' },
        { name: 'João Santos', time: '13:15', value: 'R$ 85', cashback: 'R$ 8,50' },
        { name: 'Ana Costa', time: '11:40', value: 'R$ 200', cashback: 'R$ 20' },
        { name: 'Pedro Lima', time: '10:20', value: 'R$ 65', cashback: 'R$ 6,50' },
      ].map((sale, i) => (
        <div key={i} className="bg-white rounded-lg p-2 shadow-sm flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[5px] text-white font-bold">{sale.name[0]}{sale.name.split(' ')[1]?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[6px] font-semibold text-primary">{sale.name}</div>
            <div className="text-[4px] text-text-muted">{sale.time} · Cashback {sale.cashback}</div>
          </div>
          <div className="text-[6px] font-bold text-primary">{sale.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Clientes Mock ──────────────────────────────────────────
function CustomersMock() {
  return (
    <div className="space-y-2 pt-1">
      <div className="text-[9px] font-bold text-primary">Clientes</div>

      <div className="bg-[#F5F5F5] rounded-md p-1.5 flex items-center gap-1 border border-[#E0E0E0]">
        <Search className="w-2.5 h-2.5 text-text-muted" />
        <div className="text-[5px] text-text-muted">Buscar por nome ou CPF...</div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[4px] text-text-muted">47 clientes</span>
        <div className="flex items-center gap-0.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded-md px-1.5 py-0.5">
          <span className="text-[4px] text-text-muted">Mais recentes</span>
          <ChevronDown className="w-2 h-2 text-text-muted" />
        </div>
      </div>

      {[
        { name: 'Ana Santos', purchases: 8, balance: 'R$ 45,60' },
        { name: 'Bruno Lima', purchases: 5, balance: 'R$ 23,00' },
        { name: 'Carla Oliveira', purchases: 12, balance: 'R$ 78,20' },
        { name: 'Diego Costa', purchases: 3, balance: 'R$ 12,50' },
        { name: 'Elena Ferreira', purchases: 6, balance: 'R$ 34,00' },
      ].map((c, i) => (
        <div key={i} className="bg-white rounded-lg p-2 shadow-sm flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[6px] text-white font-bold">{c.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[6px] font-semibold text-primary">{c.name}</div>
            <div className="text-[4px] text-text-muted">{c.purchases} compras</div>
          </div>
          <div className="text-right">
            <div className="text-[5px] font-semibold text-success">{c.balance}</div>
            <div className="text-[3px] text-text-muted">cashback</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empresa Mock ───────────────────────────────────────────
function CompanyMock() {
  return (
    <div className="space-y-2 -mx-2.5">
      {/* Cover + Logo overlay */}
      <div className="relative">
        <div className="h-16 bg-gradient-to-r from-primary via-[#333] to-primary" />
        <div className="absolute -bottom-3 left-3">
          <div className="w-9 h-9 bg-white rounded-lg border-2 border-white shadow-md flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="px-2.5 pt-2 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[8px] font-bold text-primary">Minha Loja</div>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-2 h-2 text-[#FFB800] fill-[#FFB800]" />
              ))}
              <span className="text-[4px] text-text-muted ml-0.5">4.8 (127)</span>
            </div>
          </div>
          <div className="bg-primary rounded-full px-1.5 py-0.5 text-[4px] text-white font-medium">Alimentação</div>
        </div>

        {/* Info section */}
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[6px] font-semibold text-primary">Informações</div>
            <div className="flex items-center gap-0.5 text-primary">
              <Pencil className="w-2 h-2" />
              <span className="text-[4px] font-medium">Editar</span>
            </div>
          </div>
          {[
            { label: 'Nome', value: 'Minha Loja', locked: false },
            { label: 'CNPJ', value: '00.000.000/0001-00', locked: true },
            { label: 'Categoria', value: 'Alimentação', locked: false },
          ].map((field, i) => (
            <div key={i} className="border-b border-gray-50 py-1 last:border-0 flex items-center justify-between">
              <div>
                <div className="text-[4px] text-text-muted">{field.label}</div>
                <div className="text-[5px] font-medium text-primary">{field.value}</div>
              </div>
              {field.locked && <Lock className="w-2 h-2 text-text-muted" />}
            </div>
          ))}
        </div>

        {/* Cashback config */}
        <div className="bg-[#F5F5F5] rounded-lg p-2">
          <div className="text-[6px] font-semibold text-primary mb-1">Configurações de Cashback</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-[4px] text-text-muted">💰 Cashback</div>
              <div className="text-[7px] font-bold text-success">10%</div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <div className="text-[4px] text-text-muted">📅 Validade</div>
              <div className="text-[5px] font-semibold text-success">Sem validade</div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <div className="text-[4px] text-text-muted">🛒 Compra mínima</div>
              <div className="text-[5px] font-semibold text-success">Sem mínimo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notificações Mock ──────────────────────────────────────
function NotificationsMock() {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <div className="text-[9px] font-bold text-primary">Notificações</div>
      </div>

      {/* Não lidas */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-[5px] font-semibold text-text-muted">Não lidas (3)</div>
          <div className="text-[4px] text-primary font-medium">Marcar todas como lida</div>
        </div>
        <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
          {[
            { icon: ShoppingBag, color: 'bg-[#F3E8FF]', iconColor: 'text-[#7C3AED]', title: 'Nova venda registrada', desc: 'Maria Silva - R$ 80,00', time: '2min' },
            { icon: Wallet, color: 'bg-[#DCFCE7]', iconColor: 'text-success', title: 'Cashback utilizado', desc: 'João usou R$ 15,00 de cashback', time: '1h' },
            { icon: Star, color: 'bg-[#FEF3C7]', iconColor: 'text-[#F59E0B]', title: 'Nova avaliação ⭐⭐⭐⭐⭐', desc: 'Ana: "Excelente atendimento!"', time: '3h' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 p-1.5 border-b border-gray-50 last:border-0">
              <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <div className={`w-5 h-5 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-2.5 h-2.5 ${item.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[5px] font-semibold text-primary">{item.title}</div>
                <div className="text-[4px] text-text-muted">{item.desc}</div>
              </div>
              <div className="text-[4px] text-text-muted flex-shrink-0">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Anteriores */}
      <div>
        <div className="text-[5px] font-semibold text-text-muted mb-1">Anteriores</div>
        <div className="bg-[#F5F5F5] rounded-lg overflow-hidden">
          {[
            { icon: Bell, color: 'bg-[#FEE2E2]', iconColor: 'text-[#EF4444]', title: 'Configure seu cashback', desc: 'Defina a porcentagem ideal', time: '1d' },
            { icon: ShoppingBag, color: 'bg-[#F3E8FF]', iconColor: 'text-[#7C3AED]', title: 'Venda registrada', desc: 'Pedro Lima - R$ 45,00', time: '2d' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 p-1.5 border-b border-gray-100 last:border-0">
              <div className={`w-5 h-5 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-2.5 h-2.5 ${item.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[5px] font-medium text-text-muted">{item.title}</div>
                <div className="text-[4px] text-text-muted">{item.desc}</div>
              </div>
              <div className="text-[4px] text-text-muted flex-shrink-0">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ───────────────────────────────────
export function OnboardingModal({
  isOpen,
  userName,
  onComplete,
  onSkip,
}: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === SLIDES.length - 1;
  const Icon = slide.icon;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentSlide((s) => s - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[60] animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Skip button */}
          {!isLast && (
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 z-10 text-text-muted hover:text-text-primary transition-colors text-body flex items-center gap-1"
            >
              Pular <X className="w-4 h-4" />
            </button>
          )}

          {/* Header com gradiente */}
          <div className={`${isFirst ? 'bg-primary' : 'bg-gradient-to-br from-primary to-[#333]'} px-6 pt-6 pb-5 text-white`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl ${isFirst ? 'bg-white/20' : slide.iconBg} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-subtitle font-bold">
                  {isFirst ? `Olá, ${userName?.split(' ')[0] || 'Lojista'}!` : slide.title}
                </h2>
                <p className="text-caption text-white/70">{slide.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              {/* Mockup do celular */}
              {slide.mockup && (
                <div className="flex-shrink-0">
                  <PhoneMockup slide={slide.mockup} />
                </div>
              )}

              {/* Features */}
              <div className={`flex-1 ${!slide.mockup ? 'w-full' : ''}`}>
                {isFirst && (
                  <p className="text-body text-text-secondary mb-4">
                    Vamos fazer um tour rápido pelo painel para você saber como usar tudo.
                  </p>
                )}
                <ul className="space-y-3">
                  {slide.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-body text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'w-6 bg-primary'
                      : i < currentSlide
                      ? 'w-2 bg-success'
                      : 'w-2 bg-input-border'
                  }`}
                />
              ))}
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              {!isFirst && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Voltar
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                icon={isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                iconPosition={isLast ? 'left' : 'right'}
              >
                {isLast ? 'Começar!' : 'Próximo'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
