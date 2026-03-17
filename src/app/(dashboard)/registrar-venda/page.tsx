'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { storeService } from '@/services/storeService';
import { QRScanner } from '@/components/register-sale/QRScanner';
import { CPFInput } from '@/components/register-sale/CPFInput';
import { CustomerPreview } from '@/components/register-sale/CustomerPreview';
import { SaleForm, SaleData } from '@/components/register-sale/SaleForm';
import { SaleConfirmation } from '@/components/register-sale/SaleConfirmation';
import { Divider } from '@/components/ui';
import { PlanCard, PendingInvoicesTable, PaymentModal, PaymentHistoryTable,
  TrialConfirmationModal
} from '@/components/plans';
import type { CustomerWithBalance } from '@/types/customer';
import type { SaleWithCustomer } from '@/types/sale';
import type { Plan, PaymentRecord } from '@/types/plan';

type Step = 'identify' | 'preview' | 'form' | 'confirmation';

export default function RegisterSalePage() {
  const { company } = useAuth();
  const { findCustomerByCpf, getCustomerById } = useCustomers();
  const { createSale } = useSales();

  const [step, setStep] = useState<Step>('identify');
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [sale, setSale] = useState<SaleWithCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gate de plano/conta
  const [statusLoading, setStatusLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const [companyIsActive, setCompanyIsActive] = useState(true);

  // Dados para as telas de bloqueio (carregados sob demanda)
  const [blockerData, setBlockerData] = useState<{
    plans: Plan[];
    pendingInvoices: PaymentRecord[];
  } | null>(null);
  const [blockerLoading, setBlockerLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Pagamento inline
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Trial Modal state
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [selectedPlanForTrial, setSelectedPlanForTrial] = useState<Plan | null>(null);

  // ── Status check (leve, rápido) ────────────────────────────────────────────

  const reloadStatus = useCallback(async () => {
    const token = storeService.getAuthToken();
    if (!token) {
      setStatusLoading(false);
      return;
    }
    setStatusLoading(true);
    try {
      const data = await fetch('/api/subscription/status', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      setHasActiveSubscription(data.has_active_subscription ?? true);
      setCompanyIsActive(data.company_is_active ?? true);
    } catch {
      // silencioso — mantém estado anterior
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadStatus();
  }, [reloadStatus]);

  // ── Dados do bloqueador (carregados quando necessário) ─────────────────────

  useEffect(() => {
    if (statusLoading) return;
    if (hasActiveSubscription && companyIsActive) return;

    const token = storeService.getAuthToken();
    if (!token) return;

    setBlockerLoading(true);
    fetch('/api/subscription/data', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setBlockerData({
          plans: data.plans || [],
          pendingInvoices: data.pending_invoices || [],
        });
      })
      .catch(() => {})
      .finally(() => setBlockerLoading(false));
  }, [statusLoading, hasActiveSubscription, companyIsActive]);

  // ── Assinatura de plano ────────────────────────────────────────────────────

  const handlePlanSelect = (plan: Plan) => {
    if (plan.is_trial) {
      setSelectedPlanForTrial(plan);
      setTrialModalOpen(true);
    } else {
      handleSubscribe(plan);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    const token = storeService.getAuthToken();
    if (!token) return;

    setIsSubscribing(true);
    setSubscribeError(null);

    try {
      const res = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubscribeError(data.error || 'Erro ao assinar plano');
        return;
      }

      // Se gerou fatura, abrir PaymentModal imediatamente (plano pago)
      if (data.invoice?.id) {
        setSelectedInvoiceIds([data.invoice.id]);
        // Recarregar dados do bloqueador para incluir a nova fatura
        const freshData = await fetch('/api/subscription/data', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        setBlockerData({
          plans: freshData.plans || [],
          pendingInvoices: freshData.pending_invoices || [],
        });
        setPaymentModalOpen(true);
      } else {
        // Sem fatura (trial ativo com sucesso), fechar modal e recarregar status para liberar a página
        setTrialModalOpen(false);
        reloadStatus();
      }
    } catch {
      setSubscribeError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubscribing(false);
    }
  };

  // ── Total das faturas selecionadas ─────────────────────────────────────────

  const totalSelectedAmount = useMemo(() => {
    if (!blockerData) return 0;
    return blockerData.pendingInvoices
      .filter(inv => selectedInvoiceIds.includes(inv.id))
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
  }, [blockerData, selectedInvoiceIds]);

  // ── Venda ──────────────────────────────────────────────────────────────────

  const handleQRScan = (data: string) => {
    const trimmed = data.trim();

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.cpf) { searchCustomer(parsed.cpf); return; }
      if (parsed.id) { searchCustomerById(parsed.id); return; }
    } catch { /* não é JSON */ }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (trimmed.startsWith('MIBE_USER:')) {
      const userId = trimmed.substring('MIBE_USER:'.length);
      if (uuidRegex.test(userId)) { searchCustomerById(userId); return; }
    }

    if (uuidRegex.test(trimmed)) { searchCustomerById(trimmed); return; }

    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 11) {
      searchCustomer(digits);
    } else {
      setError('QR Code inválido. Use o QR Code do app MIBE.');
    }
  };

  const searchCustomer = async (cpf: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const customerData = await findCustomerByCpf(cpf);
      if (!customerData) { setError('Cliente não encontrado'); return; }
      setCustomer(customerData);
      setStep('preview');
    } catch {
      setError('Erro ao buscar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const searchCustomerById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const customerData = await getCustomerById(id);
      if (!customerData) { setError('Cliente não encontrado'); return; }
      setCustomer(customerData);
      setStep('preview');
    } catch {
      setError('Erro ao buscar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSale = async (data: SaleData) => {
    if (!customer || !company) return;
    setIsLoading(true);
    try {
      const result = await createSale({
        user_id: customer.id,
        total_amount: data.purchaseAmount,
        cashback_redeemed: data.balanceUsed,
        net_amount_paid: data.amountPaid,
        cashback_earned: data.cashbackGenerated,
        payment_method: data.paymentMethod,
      });
      if (result.success && result.sale) {
        setSale(result.sale);
        setStep('confirmation');
      } else {
        setError(result.error || 'Erro ao registrar venda');
      }
    } catch {
      setError('Erro ao registrar venda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSale = () => {
    setStep('identify');
    setCustomer(null);
    setSale(null);
    setError(null);
  };

  const handleCancel = () => {
    if (step === 'form') {
      setStep('preview');
    } else {
      setStep('identify');
      setCustomer(null);
    }
  };

  // ── Renders ────────────────────────────────────────────────────────────────

  if (statusLoading) {
    return (
      <div className="page-container max-w-lg mx-auto flex items-center justify-center py-xxl">
        <p className="text-body text-secondary">Carregando...</p>
      </div>
    );
  }

  // Tela A: Sem assinatura
  if (!hasActiveSubscription) {
    return (
      <div className="page-container max-w-lg mx-auto">
        <div className="flex items-center gap-md mb-lg">
          <Link href="/" className="p-2 -ml-2 hover:bg-input-bg rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-title font-bold">Registrar Venda</h1>
        </div>

        <div className="flex flex-col items-center gap-sm text-center mb-xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-title font-bold">Acesso bloqueado</h2>
          <p className="text-body text-secondary max-w-xs">
            Assine um plano para ter acesso às ferramentas MIBE e começar a registrar vendas.
          </p>
        </div>

        {subscribeError && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-md mb-md">
            <p className="text-body text-error text-center">{subscribeError}</p>
          </div>
        )}

        {blockerLoading ? (
          <p className="text-body text-secondary text-center py-lg">Carregando planos...</p>
        ) : (
          <div className="space-y-md">
            {blockerData?.plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={false}
                isCancelled={isSubscribing}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
        )}

        {/* PaymentModal para pagar a mensalidade logo após assinar */}
        <PaymentModal
          isOpen={paymentModalOpen && selectedInvoiceIds.length > 0}
          onClose={() => setPaymentModalOpen(false)}
          invoiceIds={selectedInvoiceIds}
          totalAmount={totalSelectedAmount}
          onPaymentComplete={reloadStatus}
        />
      </div>
    );
  }

  // Tela B: Conta bloqueada por inadimplência
  if (!companyIsActive) {
    return (
      <div className="page-container max-w-lg mx-auto">
        <div className="flex items-center gap-md mb-lg">
          <Link href="/" className="p-2 -ml-2 hover:bg-input-bg rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-title font-bold">Registrar Venda</h1>
        </div>

        <div className="flex flex-col items-center gap-sm text-center mb-xl">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-title font-bold">Conta bloqueada</h2>
          <p className="text-body text-secondary max-w-xs">
            Você tem faturas em atraso. Regularize para continuar registrando vendas.
          </p>
        </div>

        {blockerLoading ? (
          <p className="text-body text-secondary text-center py-lg">Carregando faturas...</p>
        ) : (
          <PendingInvoicesTable
            invoices={blockerData?.pendingInvoices || []}
            selectedIds={selectedInvoiceIds}
            onSelectionChange={setSelectedInvoiceIds}
            onPayClick={() => setPaymentModalOpen(true)}
            totalSelectedAmount={totalSelectedAmount}
          />
        )}

        <PaymentModal
          isOpen={paymentModalOpen && selectedInvoiceIds.length > 0}
          onClose={() => setPaymentModalOpen(false)}
          invoiceIds={selectedInvoiceIds}
          totalAmount={totalSelectedAmount}
          onPaymentComplete={reloadStatus}
        />
      </div>
    );
  }

  // Fluxo normal
  return (
    <div className="page-container max-w-lg mx-auto">
      {step !== 'confirmation' && (
        <div className="flex items-center gap-md mb-lg">
          <Link href="/" className="p-2 -ml-2 hover:bg-input-bg rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-title font-bold">Registrar Venda</h1>
        </div>
      )}

      {error && (
        <div className="bg-error-light border border-error rounded-md p-md mb-lg">
          <p className="text-body text-error">{error}</p>
        </div>
      )}

      {step === 'identify' && (
        <div className="space-y-lg">
          <QRScanner onScan={handleQRScan} />
          <Divider text="ou" />
          <CPFInput onSearch={searchCustomer} isLoading={isLoading} />
        </div>
      )}

      {step === 'preview' && customer && (
        <CustomerPreview
          customer={customer}
          onContinue={() => setStep('form')}
          onCancel={handleCancel}
        />
      )}

      {step === 'form' && customer && company && (
        <SaleForm
          customer={customer}
          cashbackPercentage={company.cashback_percent}
          onConfirm={handleConfirmSale}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

      {step === 'confirmation' && sale && (
        <SaleConfirmation sale={sale} onNewSale={handleNewSale} />
      )}
    </div>
  );
}
