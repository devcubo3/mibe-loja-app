'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertOctagon, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { SkeletonCard, SkeletonText, EmptyState } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { usePlans } from '@/hooks/usePlans';
import { storeService } from '@/services/storeService';
import {
  CurrentPlanCard,
  PlanCard,
  PaymentModal,
  PaymentHistoryTable,
  PendingInvoicesTable,
} from '@/components/plans';
import type { Plan } from '@/types/plan';

export default function PlanosPage() {
  const {
    plans,
    subscription,
    pendingInvoices,
    paidInvoices,
    companyIsActive,
    isLoading,
    error,
    selectedInvoiceIds,
    setSelectedInvoiceIds,
    totalSelectedAmount,
    reload,
  } = usePlans();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Detectar retorno do checkout de cartão
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success('Pagamento realizado! Aguarde a confirmação.');
      reload();
      router.replace('/planos');
    }
  }, [searchParams]);

  const handleSubscribe = async (plan: Plan) => {
    try {
      const token = storeService.getAuthToken();
      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao assinar plano');

      await reload();

      // Abrir modal de pagamento automaticamente para a fatura recém-criada
      if (data.invoice?.id) {
        setSelectedInvoiceIds([data.invoice.id]);
        setPaymentModalOpen(true);
      }
    } catch (err: any) {
      console.error('Erro ao assinar plano:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container max-w-5xl mx-auto">
        <div className="mb-xl">
          <SkeletonText className="h-8 w-64 mb-sm" />
          <SkeletonText className="h-5 w-96" />
        </div>
        <SkeletonCard className="h-48 mb-xl" />
        <SkeletonCard className="h-64 mb-xl" />
        <SkeletonCard className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container max-w-5xl mx-auto">
        <EmptyState
          icon={<CreditCard className="w-12 h-12" />}
          title="Erro ao carregar"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="page-container max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-xl">
        <h1 className="heading-primary">Planos & Faturas</h1>
        <p className="text-body text-secondary mt-xs">
          Gerencie sua assinatura e acompanhe suas faturas
        </p>
      </div>

      {/* Banner de conta bloqueada */}
      {!companyIsActive && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-md mb-xl flex items-start gap-sm">
          <AlertOctagon className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-body-lg font-semibold text-error">Conta Bloqueada</p>
            <p className="text-body text-error/80">
              Você tem {formatCurrency(pendingInvoices.reduce((s, i) => s + Number(i.amount), 0))} em faturas vencidas.
              Regularize para reativar sua conta e continuar registrando vendas.
            </p>
          </div>
        </div>
      )}

      {/* Plano atual */}
      {subscription ? (
        <div className="mb-xl">
          <CurrentPlanCard
            subscription={subscription}
            companyIsActive={companyIsActive}
            pendingInvoices={pendingInvoices}
          />
        </div>
      ) : (
        <div className="mb-xl">
          <EmptyState
            icon={<CreditCard className="w-12 h-12" />}
            title="Sem assinatura"
            description="Assine um plano abaixo para começar a registrar vendas."
          />
        </div>
      )}

      {/* Faturas pendentes */}
      {pendingInvoices.length > 0 && (
        <div className="mb-xl">
          <h2 className="section-title mb-md">Faturas Pendentes</h2>
          <PendingInvoicesTable
            invoices={pendingInvoices}
            selectedIds={selectedInvoiceIds}
            onSelectionChange={setSelectedInvoiceIds}
            onPayClick={() => setPaymentModalOpen(true)}
            totalSelectedAmount={totalSelectedAmount}
          />
        </div>
      )}

      {/* Planos disponíveis (sem assinatura ou assinatura cancelada) */}
      {(!subscription || subscription.status === 'cancelled') && plans.length > 0 && (
        <div className="mb-xl">
          <h2 className="section-title mb-md">Assinar Plano</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={false}
                isCancelled={false}
                onSelect={handleSubscribe}
              />
            ))}
          </div>
        </div>
      )}

      {/* Histórico de faturas pagas */}
      <div>
        <h2 className="section-title mb-md">Histórico de Faturas Pagas</h2>
        <PaymentHistoryTable payments={paidInvoices} />
      </div>

      {/* Modal de pagamento */}
      <PaymentModal
        isOpen={paymentModalOpen && selectedInvoiceIds.length > 0}
        onClose={() => setPaymentModalOpen(false)}
        invoiceIds={selectedInvoiceIds}
        totalAmount={totalSelectedAmount}
        onPaymentComplete={reload}
      />
    </div>
  );
}
