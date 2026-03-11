'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { storeService } from '@/services/storeService';
import type { Plan, SubscriptionWithPlan, PaymentRecord, SubscriptionStatus } from '@/types/plan';

export function usePlans() {
  const { company } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [pendingInvoices, setPendingInvoices] = useState<PaymentRecord[]>([]);
  const [paidInvoices, setPaidInvoices] = useState<PaymentRecord[]>([]);
  const [companyIsActive, setCompanyIsActive] = useState(true);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!company?.id) {
      setIsLoading(false);
      return;
    }

    const token = storeService.getAuthToken();
    if (!token) {
      setIsLoading(false);
      setError('Não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/data', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao carregar dados');
      }

      const data = await response.json();

      setPlans(data.plans || []);
      setCompanyIsActive(data.company_is_active ?? true);

      if (data.subscription && data.subscription.plans) {
        setSubscription({
          ...data.subscription,
          status: data.subscription.status as SubscriptionStatus,
          plan: data.subscription.plans as Plan,
        });
      } else {
        setSubscription(null);
      }

      setPendingInvoices(data.pending_invoices || []);
      setPaidInvoices(data.paid_invoices || []);
      setSelectedInvoiceIds([]);
    } catch (err: any) {
      console.error('Erro ao carregar dados de planos:', err);
      setError(err.message || 'Erro ao carregar dados do plano');
    } finally {
      setIsLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const totalSelectedAmount = useMemo(() => {
    return pendingInvoices
      .filter(inv => selectedInvoiceIds.includes(inv.id))
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
  }, [pendingInvoices, selectedInvoiceIds]);

  return {
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
    reload: loadAll,
  };
}
